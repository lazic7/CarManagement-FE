import { BrowserProvider, Contract, type InterfaceAbi } from "ethers";

const VOLTA_CHAIN_ID = 73799;
const VOLTA_CHAIN_ID_HEX = "0x12047";
const CONTRACT_ADDRESS = import.meta.env.VITE_MILEAGE_CONTRACT_ADDRESS ?? "";

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
    if (code !== 4902) throw error;

    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: VOLTA_CHAIN_ID_HEX,
          chainName: "Energy Web Volta Testnet",
          nativeCurrency: { name: "Volta", symbol: "VT", decimals: 18 },
          rpcUrls: ["https://volta-rpc.energyweb.org"],
          blockExplorerUrls: ["https://volta-explorer.energyweb.org"],
        },
      ],
    });
  }
};

const getAdminContract = async (): Promise<Contract> => {
  const ethereum = getEthereumProvider();
  await ethereum.request({ method: "eth_requestAccounts" });
  await ensureVoltaNetwork();

  const provider = new BrowserProvider(ethereum);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== VOLTA_CHAIN_ID) {
    throw new Error("Please connect MetaMask to Volta network.");
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error("Missing contract address in environment.");
  }

  const signer = await provider.getSigner();
  const abi = parseAbiFromEnv();
  return new Contract(CONTRACT_ADDRESS, abi, signer);
};

export interface OnChainActionResult {
  txHash: string;
}

export const addMechanicOnChain = async (
  walletAddress: string,
): Promise<OnChainActionResult> => {
  const contract = await getAdminContract();
  const tx = await contract.getFunction("addMechanic").send(walletAddress);
  await tx.wait(1);
  return { txHash: tx.hash };
};

export const revokeMechanicOnChain = async (
  walletAddress: string,
): Promise<OnChainActionResult> => {
  const contract = await getAdminContract();
  const tx = await contract.getFunction("revokeMechanic").send(walletAddress);
  await tx.wait(1);
  return { txHash: tx.hash };
};
