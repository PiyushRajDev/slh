import * as jwt from "jsonwebtoken";
import { randomUUID, createHash } from "node:crypto";
import {
    assertAuthRole,
    getRolePermissions,
    isPermission,
    type AuthRole,
    type Permission
} from "./permissions";

const JWT_ISSUER = process.env.JWT_ISSUER ?? "slh-api";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? "slh-client";
const ACCESS_TOKEN_TTL_SECONDS = parsePositiveInt(
    process.env.JWT_ACCESS_TTL_SECONDS,
    15 * 60
);
const REFRESH_TOKEN_TTL_SECONDS = parsePositiveInt(
    process.env.JWT_REFRESH_TTL_SECONDS,
    7 * 24 * 60 * 60
);
const TOKEN_VERSION = 1;
const STREAM_TOKEN_TTL_SECONDS = 30;

type TokenType = "access" | "refresh" | "stream";

interface BaseClaims extends jwt.JwtPayload {
    sub: string;
    email: string;
    role: AuthRole;
    collegeId: string | null;
    permissions: Permission[];
    v: number;
    typ: TokenType;
}

export interface AccessTokenClaims extends BaseClaims {
    typ: "access";
}

export interface RefreshTokenClaims extends BaseClaims {
    typ: "refresh";
    jti: string;
}

export interface TokenIdentity {
    id: string;
    email: string;
    role: AuthRole;
    collegeId: string | null;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface SessionContext {
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
}

export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }

    return Math.floor(parsed);
}

function requiredSecret(name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET"): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name}_MISSING`);
    }

    return value;
}

function normalizePermissions(raw: unknown, role: AuthRole): Permission[] {
    if (!Array.isArray(raw)) {
        return getRolePermissions(role);
    }

    const deduped = new Set<Permission>();
    for (const item of raw) {
        if (isPermission(item)) {
            deduped.add(item);
        }
    }

    if (deduped.size === 0) {
        return getRolePermissions(role);
    }

    return [...deduped];
}

function parseClaims(payload: unknown, expectedType: TokenType): BaseClaims {
    if (!payload || typeof payload !== "object") {
        throw new Error("INVALID_TOKEN_PAYLOAD");
    }

    const decoded = payload as Record<string, unknown>;
    const sub = decoded.sub;
    const email = decoded.email;
    const role = assertAuthRole(decoded.role);
    const typ = decoded.typ;

    if (typeof sub !== "string" || !sub) {
        throw new Error("INVALID_TOKEN_SUBJECT");
    }

    if (expectedType !== "stream" && (typeof email !== "string" || !email)) {
        throw new Error("INVALID_TOKEN_EMAIL");
    }

    if (typ !== expectedType) {
        throw new Error("INVALID_TOKEN_TYPE");
    }

    return {
        ...(decoded as jwt.JwtPayload),
        sub,
        email: typeof email === "string" ? email : "",
        role,
        collegeId:
            typeof decoded.collegeId === "string" ? decoded.collegeId : null,
        permissions: normalizePermissions(decoded.permissions, role),
        v:
            typeof decoded.v === "number" && Number.isFinite(decoded.v)
                ? decoded.v
                : TOKEN_VERSION,
        typ: expectedType
    };
}

export async function createSessionAndIssueTokens(
    identity: TokenIdentity,
    context: SessionContext
): Promise<TokenPair> {
    const sessionId = randomUUID();

    const basePayload = {
        sub: identity.id,
        email: identity.email,
        role: identity.role,
        collegeId: identity.collegeId,
        permissions: getRolePermissions(identity.role),
        v: TOKEN_VERSION
    };

    const accessToken = jwt.sign(
        { ...basePayload, typ: "access" },
        requiredSecret("JWT_ACCESS_SECRET"),
        {
            expiresIn: ACCESS_TOKEN_TTL_SECONDS,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            algorithm: "HS256"
        }
    );

    const refreshToken = jwt.sign(
        { ...basePayload, typ: "refresh", jti: sessionId },
        requiredSecret("JWT_REFRESH_SECRET"),
        {
            expiresIn: REFRESH_TOKEN_TTL_SECONDS,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            algorithm: "HS256"
        }
    );

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

    const { default: prisma } = await import("../db");
    await prisma.session.create({
        data: {
            id: sessionId,
            userId: identity.id,
            tokenHash: hashToken(refreshToken),
            deviceId: context.deviceId,
            userAgent: context.userAgent,
            ipAddress: context.ipAddress,
            expiresAt
        }
    });

    return {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS
    };
}

export function verifyAccessToken(token: string): AccessTokenClaims {
    const decoded = jwt.verify(token, requiredSecret("JWT_ACCESS_SECRET"), {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithms: ["HS256"]
    });

    return parseClaims(decoded, "access") as AccessTokenClaims;
}

export function verifyRefreshToken(token: string): RefreshTokenClaims {
    const decoded = jwt.verify(token, requiredSecret("JWT_REFRESH_SECRET"), {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithms: ["HS256"]
    });

    const claims = parseClaims(decoded, "refresh");
    const jti = (decoded as Record<string, unknown>).jti;
    if (typeof jti !== "string" || !jti) {
        throw new Error("INVALID_REFRESH_JTI");
    }

    return {
        ...claims,
        typ: "refresh",
        jti
    };
}

export async function rotateRefreshToken(
    oldRefreshToken: string,
    context: SessionContext
): Promise<TokenPair> {
    const claims = verifyRefreshToken(oldRefreshToken);
    const sessionId = claims.jti;

    const { default: prisma } = await import("../db");
    const { logSecurityEvent } = await import("./audit.service");

    const session = await prisma.session.findUnique({
        where: { id: sessionId }
    });

    if (!session) {
        throw new Error("SESSION_NOT_FOUND");
    }

    if (session.revokedAt) {
        throw new Error("SESSION_REVOKED");
    }

    if (session.replacedBy) {
        // TOKEN REUSE DETECTED!
        await prisma.session.updateMany({
            where: { userId: session.userId, revokedAt: null },
            data: { revokedAt: new Date() }
        });

        await logSecurityEvent({
            action: "TOKEN_REUSE_DETECTED",
            userId: session.userId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            metadata: { sessionId, reason: "Attempted to use a replaced refresh token" }
        });

        throw new Error("TOKEN_REUSE_DETECTED");
    }

    const newSessionId = randomUUID();

    const basePayload = {
        sub: claims.sub,
        email: claims.email,
        role: claims.role,
        collegeId: claims.collegeId,
        permissions: claims.permissions,
        v: claims.v
    };

    const accessToken = jwt.sign(
        { ...basePayload, typ: "access" },
        requiredSecret("JWT_ACCESS_SECRET"),
        {
            expiresIn: ACCESS_TOKEN_TTL_SECONDS,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            algorithm: "HS256"
        }
    );

    const newRefreshToken = jwt.sign(
        { ...basePayload, typ: "refresh", jti: newSessionId },
        requiredSecret("JWT_REFRESH_SECRET"),
        {
            expiresIn: REFRESH_TOKEN_TTL_SECONDS,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            algorithm: "HS256"
        }
    );

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

    try {
        await prisma.$transaction(async (tx) => {
            const updateCount = await tx.session.updateMany({
                where: {
                    id: sessionId,
                    replacedBy: null,
                    revokedAt: null
                },
                data: {
                    replacedBy: newSessionId,
                    revokedAt: new Date() // old session immediately considered revoked to prevent access
                }
            });

            if (updateCount.count === 0) {
                throw new Error("RACE_CONDITION_OR_REUSE");
            }

            await tx.session.create({
                data: {
                    id: newSessionId,
                    userId: session.userId,
                    tokenHash: hashToken(newRefreshToken),
                    deviceId: context.deviceId,
                    userAgent: context.userAgent,
                    ipAddress: context.ipAddress,
                    expiresAt
                }
            });
        });
    } catch (err: unknown) {
        if (err instanceof Error && err.message === "RACE_CONDITION_OR_REUSE") {
            await prisma.session.updateMany({
                where: { userId: session.userId, revokedAt: null },
                data: { revokedAt: new Date() }
            });
            await logSecurityEvent({
                action: "TOKEN_REUSE_DETECTED",
                userId: session.userId,
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                metadata: { sessionId, reason: "Race condition reuse detected" }
            });
            throw new Error("TOKEN_REUSE_DETECTED");
        }
        throw err;
    }

    return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS
    };
}

export function issueStreamToken(identity: TokenIdentity): string {
    const basePayload = {
        sub: identity.id,
        role: identity.role,
        collegeId: identity.collegeId,
        permissions: getRolePermissions(identity.role),
        typ: "stream"
    };

    return jwt.sign(
        basePayload,
        requiredSecret("JWT_ACCESS_SECRET"),
        {
            expiresIn: STREAM_TOKEN_TTL_SECONDS,
            issuer: JWT_ISSUER,
            audience: "stream",
            algorithm: "HS256"
        }
    );
}

export function verifyStreamToken(token: string) {
    const decoded = jwt.verify(token, requiredSecret("JWT_ACCESS_SECRET"), {
        issuer: JWT_ISSUER,
        audience: "stream",
        algorithms: ["HS256"]
    });
    return parseClaims(decoded, "stream");
}
