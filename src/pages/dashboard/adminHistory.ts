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

const dedupeByTxHash = (
  entries: AdminHistoryEntry[],
): AdminHistoryEntry[] => {
  const seen = new Set<string>();
  const deduped: AdminHistoryEntry[] = [];
  for (const entry of entries) {
    const key = entry.txHash?.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }
  return deduped;
};

export const persistHistory = (entries: AdminHistoryEntry[]): void => {
  try {
    const deduped = dedupeByTxHash(entries).slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
  } catch {
    // Storage may be unavailable; fail silently.
  }
};

export const loadHistory = (): AdminHistoryEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const entries = parsed as AdminHistoryEntry[];
    const deduped = dedupeByTxHash(entries);
    if (deduped.length !== entries.length) {
      persistHistory(deduped);
    }
    return deduped;
  } catch {
    return [];
  }
};

export const saveEntry = (
  entry: AdminHistoryEntry,
  currentList: AdminHistoryEntry[] = loadHistory(),
): AdminHistoryEntry[] => {
  const withoutDuplicate = currentList.filter(
    (existing) =>
      existing.txHash.toLowerCase() !== entry.txHash.toLowerCase(),
  );
  const next = [entry, ...withoutDuplicate].slice(0, MAX_ENTRIES);
  persistHistory(next);
  return next;
};
