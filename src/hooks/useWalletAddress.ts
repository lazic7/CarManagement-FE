import { useEffect, useState } from "react";

const readAccount = async (): Promise<string> => {
  if (typeof window === "undefined" || !window.ethereum) return "";
  try {
    const accounts = (await window.ethereum.request({
      method: "eth_accounts",
    })) as string[] | undefined;
    return accounts?.[0] ?? "";
  } catch {
    return "";
  }
};

export const useWalletAddress = (): string => {
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    readAccount().then((value) => {
      if (!cancelled) setAddress(value);
    });

    const ethereum = window.ethereum as unknown as {
      on?: (event: string, handler: (accounts: string[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (accounts: string[]) => void,
      ) => void;
    } | undefined;

    const handler = (accounts: string[]) => setAddress(accounts[0] ?? "");
    ethereum?.on?.("accountsChanged", handler);

    return () => {
      cancelled = true;
      ethereum?.removeListener?.("accountsChanged", handler);
    };
  }, []);

  return address;
};
