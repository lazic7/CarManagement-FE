export interface RegisterRequestDto {
  email: string;
  password: string;
}

export interface RegisterResponseDto {
  email: string;
  password: string;
  role: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
}

export interface AuthTokenPayloadDto {
  userId?: string;
  role?: string;
  iat?: number;
  exp?: number;
}
