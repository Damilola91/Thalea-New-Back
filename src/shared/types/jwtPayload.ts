export interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
