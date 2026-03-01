import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
        collegeId: string | null;
    };
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET!
        ) as AuthRequest["user"];

        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
