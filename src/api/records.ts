import { buildApiUrl } from "./client";
import type { MileageRecordDto, MileageRecordResponseDto } from "./dto";

interface ApiErrorResponse {
  message?: string;
}

const getErrorMessage = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    // Ignore invalid error body and use fallback.
  }

  return fallbackMessage;
};

const normalizeRecords = (
  payload: MileageRecordResponseDto | MileageRecordDto[],
): MileageRecordDto[] => {
  const records = Array.isArray(payload) ? payload : (payload.records ?? []);

  return records.map((record) => ({
    mileage: Number(record.mileage),
    timestamp: Number(record.timestamp),
    mechanic: String(record.mechanic),
  }));
};

export const getMileageRecordsByVin = async (
  vin: string,
): Promise<MileageRecordDto[]> => {
  const response = await fetch(
    buildApiUrl(`/cars/${encodeURIComponent(vin)}`),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to fetch records."),
    );
  }

  const data = (await response.json()) as
    | MileageRecordResponseDto
    | MileageRecordDto[];
  return normalizeRecords(data);
};
