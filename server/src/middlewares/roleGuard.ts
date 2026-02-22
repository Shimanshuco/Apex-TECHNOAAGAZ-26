import { Request, Response, NextFunction } from "express";
import type { UserRole } from "../models/User";

/**
 * Factory: returns middleware that allows only the listed roles.
 * Must be placed AFTER `authenticate`.
 *
 *   router.get("/admin-only", authenticate, roleGuard("admin"), handler);
 */
export const roleGuard = (...allowed: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole || !allowed.includes(req.userRole as UserRole)) {
      res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
      return;
    }
    next();
  };
