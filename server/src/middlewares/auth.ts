import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

/**
 * Extend Express Request to carry authenticated user info
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

/**
 * Middleware: extract & verify Bearer token.
 * Attaches `req.userId` and `req.userRole`.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const token = header.split(" ")[1]!;
    const decoded = verifyToken(token);

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
