import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  exp: number;
  iat: number;
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  return decoded.exp * 1000 < Date.now();
};

export const getUserFromToken = (token: string) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email,
    firstName: decoded.firstName,
    lastName: decoded.lastName,
    roles: decoded.roles,
  };
};
