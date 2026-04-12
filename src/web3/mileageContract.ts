import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  type InterfaceAbi,
} from "ethers";

const VOLTA_CHAIN_ID = 73799;
const VOLTA_CHAIN_ID_HEX = "0x12047";
const VOLTA_RPC_URL =
  import.meta.env.VITE_VOLTA_RPC_URL ?? "https://volta-rpc.energyweb.org";

const CONTRACT_ADDRESS = import.meta.env.VITE_MILEAGE_CONTRACT_ADDRESS ?? "";
const WRITE_METHOD = import.meta.env.VITE_MILEAGE_WRITE_METHOD ?? "addMileage";
const CONFIRMATION_TIMEOUT_MS = 120000;
const MAX_SEND_ATTEMPTS = 2;

type EthereumProvider = NonNullable<Window["ethereum"]>;

const parseAbiFromEnv = (): InterfaceAbi => {
  const rawAbi = import.meta.env.VITE_MILEAGE_CONTRACT_ABI_JSON;

  if (!rawAbi) {
    throw new Error("Missing VITE_MILEAGE_CONTRACT_ABI_JSON in environment.");
  }

  try {
    return JSON.parse(rawAbi) as InterfaceAbi;
  } catch {
    throw new Error("VITE_MILEAGE_CONTRACT_ABI_JSON is not valid JSON.");
  }
};

const getEthereumProvider = (): EthereumProvider => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  return window.ethereum;
};

const ensureVoltaNetwork = async (): Promise<void> => {
  const ethereum = getEthereumProvider();

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: VOLTA_CHAIN_ID_HEX }],
    });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? Number((error as { code?: unknown }).code)
        : undefined;

    if (code !== 4902) {
      throw error;
    }

    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: VOLTA_CHAIN_ID_HEX,
          chainName: "Energy Web Volta Testnet",
          nativeCurrency: {
            name: "Volta",
            symbol: "VT",
            decimals: 18,
          },
          rpcUrls: ["https://volta-rpc.energyweb.org"],
          blockExplorerUrls: ["https://volta-explorer.energyweb.org"],
        },
      ],
    });
  }
};

const createContractWithSigner = async (): Promise<{
  contract: Contract;
  address: string;
  provider: BrowserProvider;
}> => {
  const ethereum = getEthereumProvider();

  await ethereum.request({ method: "eth_requestAccounts" });
  await ensureVoltaNetwork();

  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  if (Number(network.chainId) !== VOLTA_CHAIN_ID) {
    throw new Error("Please connect MetaMask to Volta network.");
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error("Missing VITE_MILEAGE_CONTRACT_ADDRESS in environment.");
  }

  const abi = parseAbiFromEnv();
  const contract = new Contract(CONTRACT_ADDRESS, abi, signer);
  const address = await signer.getAddress();

  return { contract, address, provider };
};

export interface SubmitMileageResult {
  txHash: string;
  walletAddress: string;
  confirmationStatus: "confirmed" | "pending";
}

export interface SubmitMileageCallbacks {
  onTransactionSubmitted?: (txHash: string) => void;
}

const isNonceConflictError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code =
    "code" in error ? String((error as { code?: unknown }).code) : "";
  const message =
    "message" in error
      ? String((error as { message?: unknown }).message).toLowerCase()
      : "";

  if (code === "NONCE_EXPIRED") {
    return true;
  }

  return (
    message.includes("nonce") ||
    message.includes("replacement") ||
    message.includes("underpriced") ||
    message.includes("already known")
  );
};

export const submitMileageOnChain = async (
  vin: string,
  mileage: number,
  callbacks?: SubmitMileageCallbacks,
): Promise<SubmitMileageResult> => {
  const { contract, address, provider } = await createContractWithSigner();
  const writeMethod = contract.getFunction(WRITE_METHOD) as {
    estimateGas: (
      contractVin: string,
      contractMileage: number,
    ) => Promise<bigint>;
    send: (
      contractVin: string,
      contractMileage: number,
      overrides: Record<string, unknown>,
    ) => Promise<{ hash: string }>;
  };

  if (!writeMethod) {
    throw new Error(
      `Write method '${WRITE_METHOD}' not found in contract ABI.`,
    );
  }

  const feeData = await provider.getFeeData();
  let txHash = "";

  for (let attempt = 0; attempt < MAX_SEND_ATTEMPTS; attempt += 1) {
    const pendingNonce = await provider.getTransactionCount(address, "pending");
    const gasEstimate = await writeMethod.estimateGas(vin, mileage);

    const feeMultiplier = BigInt(120 + attempt * 15);
    const overrides: Record<string, unknown> = {
      nonce: pendingNonce,
      gasLimit: (gasEstimate * 120n) / 100n,
    };

    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      overrides.maxFeePerGas = (feeData.maxFeePerGas * feeMultiplier) / 100n;
      overrides.maxPriorityFeePerGas =
        (feeData.maxPriorityFeePerGas * feeMultiplier) / 100n;
    } else if (feeData.gasPrice) {
      overrides.gasPrice = (feeData.gasPrice * feeMultiplier) / 100n;
    }

    try {
      const txResponse = await writeMethod.send(vin, mileage, overrides);
      txHash = txResponse.hash;
      break;
    } catch (error) {
      const shouldRetry =
        attempt < MAX_SEND_ATTEMPTS - 1 && isNonceConflictError(error);
      if (!shouldRetry) {
        throw error;
      }
    }
  }

  if (!txHash) {
    throw new Error("Failed to submit transaction due to nonce conflict.");
  }

  callbacks?.onTransactionSubmitted?.(txHash);

  const rpcProvider = new JsonRpcProvider(VOLTA_RPC_URL, VOLTA_CHAIN_ID);
  const receipt = await rpcProvider.waitForTransaction(
    txHash,
    1,
    CONFIRMATION_TIMEOUT_MS,
  );

  if (receipt && receipt.status === 0) {
    throw new Error(
      "Transaction reverted on-chain. Check if mileage is greater than 0 and not lower than the previous record for this VIN.",
    );
  }

  return {
    txHash,
    walletAddress: address,
    confirmationStatus: receipt ? "confirmed" : "pending",
  };
};
