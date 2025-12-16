export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  ten: string;
  password: string;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}
