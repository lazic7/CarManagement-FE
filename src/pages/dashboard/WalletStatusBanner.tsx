import { useEffect, useState } from "react";
import { buildAddressUrl, shortenHash } from "../../utils/explorer";

const requestAccounts = async (): Promise<string[]> => {
  if (!window.ethereum) return [];
  try {
    const accounts = (await window.ethereum.request({
      method: "eth_accounts",
    })) as string[] | undefined;
    return accounts ?? [];
  } catch {
    return [];
  }
};

export const WalletStatusBanner = () => {
  const [address, setAddress] = useState<string>("");
  const [isChecking, setIsChecking] = useState(true);
  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  useEffect(() => {
    let cancelled = false;
    requestAccounts().then((accounts) => {
      if (cancelled) return;
      setAddress(accounts[0] ?? "");
      setIsChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConnect = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      setAddress(accounts[0] ?? "");
    } catch {
      // user rejected
    }
  };

  if (!hasProvider) {
    return (
      <div className="wallet-banner wallet-banner-warning">
        <div className="wallet-icon-wrap">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="wallet-banner-body">
          <div className="wallet-banner-title">MetaMask not detected</div>
          <div className="wallet-banner-sub">
            Install the MetaMask browser extension to submit records on-chain.
          </div>
        </div>
        <a
          className="btn btn-ghost wallet-btn"
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="wallet-banner wallet-banner-idle">
        <div className="wallet-icon-wrap">
          <span className="wallet-spinner" aria-hidden="true" />
        </div>
        <div className="wallet-banner-body">
          <div className="wallet-banner-title">Checking wallet…</div>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="wallet-banner wallet-banner-idle">
        <div className="wallet-icon-wrap">
          <span className="fox" aria-hidden="true">
            🦊
          </span>
        </div>
        <div className="wallet-banner-body">
          <div className="wallet-banner-title">Wallet not connected</div>
          <div className="wallet-banner-sub">
            Connect MetaMask to submit mileage records to the blockchain.
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary wallet-btn"
          onClick={handleConnect}
        >
          Connect wallet
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-banner wallet-banner-connected">
      <div className="wallet-icon-wrap wallet-icon-live">
        <span className="wallet-pulse" aria-hidden="true" />
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <div className="wallet-banner-body">
        <div className="wallet-banner-title">Wallet connected</div>
        <div className="wallet-banner-sub">
          Energy Web Volta · ready to submit
        </div>
      </div>
      <a
        className="wallet-address-chip"
        href={buildAddressUrl(address)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <code>{shortenHash(address)}</code>
        <svg className="external-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 3h7v7" />
          <path d="M10 14L21 3" />
          <path d="M21 14v7h-7" />
          <path d="M3 10V3h7" />
        </svg>
      </a>
    </div>
  );
};
