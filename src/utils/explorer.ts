const EXPLORER_BASE = "https://volta-explorer.energyweb.org";

export const buildTxUrl = (txHash: string): string =>
  `${EXPLORER_BASE}/tx/${txHash}`;

export const buildAddressUrl = (address: string): string =>
  `${EXPLORER_BASE}/address/${address}`;

export const shortenHash = (value: string, head = 8, tail = 6): string =>
  value.length > head + tail + 3
    ? `${value.slice(0, head)}…${value.slice(-tail)}`
    : value;
