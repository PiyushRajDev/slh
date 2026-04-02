import { NextFunction, Request, RequestHandler, Response } from "express";
import prisma from "../db";
import {
    type AuthRole,
    type Permission,
    getRolePermissions
} from "../auth/permissions";
import { verifyAccessToken, type AccessTokenClaims } from "../auth/token.service";

export interface LegacyAuthenticatedUser {
    userId: string;
    email: string;
    role: AuthRole;
    collegeId: string | null;
}

export interface AuthPrincipal extends LegacyAuthenticatedUser {
    permissions: Permission[];
}

export interface AuthState {
    principal: AuthPrincipal;
    token: AccessTokenClaims;
}

export interface AuthRequest extends Request {
    user?: LegacyAuthenticatedUser;
    auth?: AuthState;
}

function extractAccessToken(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken;
    const queryToken =
        typeof req.query.token === "string" ? req.query.token : undefined;
    const bearerToken =
        authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : undefined;

    return bearerToken ?? cookieToken ?? queryToken;
}

function attachAuthState(req: AuthRequest, state: AuthState): void {
    req.auth = state;
    req.user = {
        userId: state.principal.userId,
        email: state.principal.email,
        role: state.principal.role,
        collegeId: state.principal.collegeId
    };
}

function hasAllPermissions(
    principal: AuthPrincipal,
    permissions: readonly Permission[]
): boolean {
    if (permissions.length === 0) {
        return true;
    }

    return permissions.every((permission) => principal.permissions.includes(permission));
}

function hasAtLeastOnePermission(
    principal: AuthPrincipal,
    permissions: readonly Permission[]
): boolean {
    if (permissions.length === 0) {
        return true;
    }

    return permissions.some((permission) => principal.permissions.includes(permission));
}

export function getPrincipal(req: Request): AuthPrincipal | null {
    const authReq = req as AuthRequest;
    return authReq.auth?.principal ?? null;
}

export function hasRequestPermission(req: Request, permission: Permission): boolean {
    const principal = getPrincipal(req);
    if (!principal) {
        return false;
    }

    return principal.permissions.includes(permission);
}

export const authenticate: RequestHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const token = extractAccessToken(req);

    if (!token) {
        res.status(401).json({ error: "No token provided" });
        return;
    }

    try {
        const claims = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: { id: claims.sub },
            select: {
                id: true,
                email: true,
                role: true,
                collegeId: true,
                isActive: true
            }
        });

        if (!user || !user.isActive) {
            res.status(401).json({ error: "Invalid or expired token" });
            return;
        }

        const principal: AuthPrincipal = {
            userId: user.id,
            email: user.email,
            role: user.role as AuthRole,
            collegeId: user.collegeId,
            permissions: getRolePermissions(user.role as AuthRole)
        };

        attachAuthState(req, { principal, token: claims });
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

export function requirePermission(permission: Permission): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const principal = getPrincipal(req);
        if (!principal || !hasAllPermissions(principal, [permission])) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }

        next();
    };
}

export function requireAnyPermission(
    ...permissions: Permission[]
): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const principal = getPrincipal(req);
        if (!principal || !hasAtLeastOnePermission(principal, permissions)) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }

        next();
    };
}

export {
    Permission,
    type AuthRole,
    isElevatedRole,
    roleHasPermission,
    roleHasAnyPermission,
    getRolePermissions
} from "../auth/permissions";
