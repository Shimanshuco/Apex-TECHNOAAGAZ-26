import jwt, { type SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env";

interface TokenPayload {
  id: string;
  role: string;
}

/** Sign a JWT for a user */
export const signToken = (payload: TokenPayload): string => {
  const options: SignOptions = { expiresIn: ENV.JWT_EXPIRES_IN as unknown as SignOptions["expiresIn"] };
  return jwt.sign(payload, ENV.JWT_SECRET, options);
};

/** Verify + decode a JWT (throws on invalid) */
export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
