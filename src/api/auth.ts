import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from "./dto";
import { buildApiUrl } from "./client";

const registerEndpoint = buildApiUrl("/auth/register");
const loginEndpoint = buildApiUrl("/auth/login");

const defaultHeaders = {
  "Content-Type": "application/json",
};

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
    // Ignore invalid or empty error bodies and use the fallback instead.
  }

  return fallbackMessage;
};

export const registerUser = async (
  payload: RegisterRequestDto,
): Promise<RegisterResponseDto> => {
  const response = await fetch(registerEndpoint, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Registration failed."));
  }

  return response.json() as Promise<RegisterResponseDto>;
};

export const loginUser = async (
  payload: LoginRequestDto,
): Promise<LoginResponseDto> => {
  const response = await fetch(loginEndpoint, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Login failed."));
  }

  return response.json() as Promise<LoginResponseDto>;
};
