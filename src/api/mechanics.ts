import { buildApiUrl } from "./client";

export interface MechanicDto {
  _id: string;
  email: string;
  role: "admin";
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
  isPending?: boolean;
}

interface ApiErrorResponse {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

const defaultHeaders = {
  "Content-Type": "application/json",
};

const authHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    ...defaultHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getErrorMessage = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    if (data.errors && data.errors.length > 0) {
      return data.errors.map((err) => err.message).join(", ");
    }
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    /* ignore */
  }
  return fallbackMessage;
};

export const listMechanics = async (): Promise<MechanicDto[]> => {
  const response = await fetch(buildApiUrl("/admin/mechanics"), {
    method: "GET",
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load mechanics."),
    );
  }
  return response.json() as Promise<MechanicDto[]>;
};

export const createMechanic = async (
  email: string,
  walletAddress: string,
): Promise<MechanicDto> => {
  const response = await fetch(buildApiUrl("/admin/mechanics"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, walletAddress }),
  });
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to create mechanic."),
    );
  }
  return response.json() as Promise<MechanicDto>;
};

export const deleteMechanic = async (id: string): Promise<void> => {
  const response = await fetch(
    buildApiUrl(`/admin/mechanics/${encodeURIComponent(id)}`),
    {
      method: "DELETE",
      headers: authHeaders(),
    },
  );
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to remove mechanic."),
    );
  }
};
