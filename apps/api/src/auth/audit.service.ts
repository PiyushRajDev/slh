import prisma from "../db";

export type AuditAction =
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "TOKEN_REFRESH"
    | "TOKEN_REUSE_DETECTED"
    | "LOGOUT"
    | "PERMISSION_DENIED"
    | "ADMIN_ACTION";

export interface AuditLogOptions {
    action: AuditAction;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}

export async function logSecurityEvent(options: AuditLogOptions): Promise<void> {
    try {
        await (prisma as any).auditLog.create({
            data: {
                action: options.action,
                userId: options.userId,
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
                metadata: options.metadata ?? {},
            },
        });
    } catch (err) {
        // Silently fail so we don't break the auth flow, but log to stderr
        console.error("Failed to write to AuditLog", err);
    }
}
