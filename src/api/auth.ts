import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from "./dto";

const registerEndpoint = "http://localhost/auth/register";
const loginEndpoint = "http://localhost:3000/auth/login";

const defaultHeaders = {
  "Content-Type": "application/json",
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
    throw new Error("Registration failed.");
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
    throw new Error("Login failed.");
  }

  return response.json() as Promise<LoginResponseDto>;
};
