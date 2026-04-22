/**
 * Central chain configuration. Change these values to switch networks globally.
 */

export const CHAIN_ID = 11155111;
export const CHAIN_ID_HEX = "0xaa36a7";
export const CHAIN_NAME = "Sepolia";
export const CHAIN_DISPLAY_NAME = "Ethereum Sepolia";
export const NATIVE_CURRENCY = {
  name: "SepoliaETH",
  symbol: "ETH",
  decimals: 18,
};
export const DEFAULT_RPC_URL =
  import.meta.env.VITE_CHAIN_RPC_URL ??
  "https://ethereum-sepolia-rpc.publicnode.com";
export const EXPLORER_BASE = "https://sepolia.etherscan.io";

export const WALLET_ADD_CHAIN_PARAMS = {
  chainId: CHAIN_ID_HEX,
  chainName: CHAIN_DISPLAY_NAME,
  nativeCurrency: NATIVE_CURRENCY,
  rpcUrls: [DEFAULT_RPC_URL],
  blockExplorerUrls: [EXPLORER_BASE],
};
