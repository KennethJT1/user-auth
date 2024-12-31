import jwt, { JwtPayload } from "jsonwebtoken";
import { EXPIRESIN, JWT_SECRET } from "../config";

export const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: EXPIRESIN });
};

export const verifyToken = (token: string): JwtPayload | string => {
  return jwt.verify(token, JWT_SECRET);
};
