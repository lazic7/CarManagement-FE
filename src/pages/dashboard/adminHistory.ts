const STORAGE_KEY = "autoledger:admin-history";
const MAX_ENTRIES = 25;

export interface AdminHistoryEntry {
  vin: string;
  mileage: number;
  txHash: string;
  walletAddress: string;
  timestamp: number;
  status: "confirmed" | "pending";
}

export const loadHistory = (): AdminHistoryEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as AdminHistoryEntry[];
  } catch {
    return [];
  }
};

export const saveEntry = (entry: AdminHistoryEntry): AdminHistoryEntry[] => {
  const current = loadHistory();
  const next = [entry, ...current].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable; fail silently.
  }
  return next;
};
