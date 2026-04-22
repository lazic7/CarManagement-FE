import {
  Contract,
  EventLog,
  JsonRpcProvider,
  type InterfaceAbi,
} from "ethers";
import { CHAIN_ID, DEFAULT_RPC_URL } from "../config/chain";
import type { AdminHistoryEntry } from "../pages/dashboard/adminHistory";

const CONTRACT_ADDRESS = import.meta.env.VITE_MILEAGE_CONTRACT_ADDRESS ?? "";
const MAX_TIMESTAMPS = 12;

const parseAbiFromEnv = (): InterfaceAbi => {
  const rawAbi = import.meta.env.VITE_MILEAGE_CONTRACT_ABI_JSON;
  if (!rawAbi) throw new Error("Missing contract ABI.");
  return JSON.parse(rawAbi) as InterfaceAbi;
};

interface MileageAddedArgs {
  vin: string;
  mileage: bigint;
  mechanic: string;
}

export interface LastRecordInfo {
  mileage: number;
  timestamp: number;
  mechanic: string;
}

export const fetchLastRecord = async (
  vin: string,
): Promise<LastRecordInfo | null> => {
  if (!CONTRACT_ADDRESS || !vin) return null;
  const provider = new JsonRpcProvider(DEFAULT_RPC_URL, CHAIN_ID);
  const contract = new Contract(CONTRACT_ADDRESS, parseAbiFromEnv(), provider);
  const records = (await contract
    .getFunction("getRecords")
    .staticCall(vin)) as Array<{
    mileage: bigint;
    timestamp: bigint;
    mechanic: string;
  }>;
  if (!records || records.length === 0) return null;
  const last = records[records.length - 1];
  return {
    mileage: Number(last.mileage),
    timestamp: Number(last.timestamp),
    mechanic: String(last.mechanic),
  };
};

export const fetchAdminHistoryFromChain = async (
  walletAddress: string,
): Promise<AdminHistoryEntry[]> => {
  if (!CONTRACT_ADDRESS || !walletAddress) return [];

  const provider = new JsonRpcProvider(DEFAULT_RPC_URL, CHAIN_ID);
  const contract = new Contract(CONTRACT_ADDRESS, parseAbiFromEnv(), provider);
  const filter = contract.filters.MileageAdded();
  const events = await contract.queryFilter(filter);

  const normalizedWallet = walletAddress.toLowerCase();
  const mine = events.filter((event): event is EventLog => {
    if (!(event instanceof EventLog)) return false;
    const args = event.args as unknown as MileageAddedArgs;
    return args.mechanic.toLowerCase() === normalizedWallet;
  });

  mine.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) return b.blockNumber - a.blockNumber;
    return (b.index ?? 0) - (a.index ?? 0);
  });

  const topBlocks = Array.from(
    new Set(mine.slice(0, MAX_TIMESTAMPS).map((event) => event.blockNumber)),
  );
  const blockMap = new Map<number, number>();
  await Promise.all(
    topBlocks.map(async (blockNumber) => {
      try {
        const block = await provider.getBlock(blockNumber);
        if (block?.timestamp) {
          blockMap.set(blockNumber, Number(block.timestamp) * 1000);
        }
      } catch {
        /* ignore */
      }
    }),
  );

  return mine.map((event) => {
    const args = event.args as unknown as MileageAddedArgs;
    return {
      vin: args.vin,
      mileage: Number(args.mileage),
      txHash: event.transactionHash,
      walletAddress,
      timestamp: blockMap.get(event.blockNumber) ?? 0,
      status: "confirmed" as const,
    };
  });
};
