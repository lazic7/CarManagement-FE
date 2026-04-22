/// <reference types="vite/client" />

interface EthereumRequestArguments {
  method: string;
  params?: unknown[] | object;
}

interface EthereumProvider {
  request: (args: EthereumRequestArguments) => Promise<unknown>;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_MILEAGE_CONTRACT_ADDRESS?: string;
  readonly VITE_MILEAGE_CONTRACT_ABI_JSON?: string;
  readonly VITE_MILEAGE_WRITE_METHOD?: string;
  readonly VITE_CHAIN_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
