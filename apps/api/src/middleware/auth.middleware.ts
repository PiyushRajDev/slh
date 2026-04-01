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
    const queryToken =
        typeof req.query.token === "string" ? req.query.token : undefined;
    const bearerToken =
        authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : undefined;
    const token = bearerToken ?? queryToken;

    if (!token) {
        res.status(401).json({ error: "No token provided" });
        return;
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET!
        ) as AuthRequest["user"];

        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
