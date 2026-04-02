export const AUTH_ROLES = ["STUDENT", "ADMIN", "SUPER_ADMIN", "RECRUITER"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export enum Permission {
    PROFILE_READ_SELF = "profile.read.self",
    GITHUB_CONNECT_SELF = "github.connect.self",
    ANALYSIS_SUBMIT_SELF = "analysis.submit.self",
    ANALYSIS_SUBMIT_ANY = "analysis.submit.any",
    ANALYSIS_READ_SELF = "analysis.read.self",
    ANALYSIS_READ_ANY = "analysis.read.any",
    ANALYSIS_STREAM_SELF = "analysis.stream.self",
    ANALYSIS_STREAM_ANY = "analysis.stream.any",
    JRI_READ_SELF = "jri.read.self",
    JRI_RECALCULATE_SELF = "jri.recalculate.self",
    JRI_VERIFY_SELF = "jri.verify.self",
    ONBOARDING_READ_SELF = "onboarding.read.self",
    COLLEGE_ONBOARD_CREATE = "college.onboard.create",
    STUDENT_BULK_IMPORT = "student.bulk_import",
    ADMIN_DASHBOARD_READ = "admin.dashboard.read",
    ADMIN_DATA_EXPORT = "admin.data.export",
    ADMIN_STUDENT_PLACEMENT_WRITE = "admin.student_placement.write",
    ADMIN_LEADERBOARD_READ = "admin.leaderboard.read",
    MARKET_FIT_ANALYZE_SELF = "market_fit.analyze.self",
    MARKET_FIT_ANALYZE_ANY = "market_fit.analyze.any",
    MARKET_FIT_REPORT_READ_SELF = "market_fit.report.read.self",
    MARKET_FIT_REPORT_READ_ANY = "market_fit.report.read.any",
    MARKET_FIT_STATUS_READ_SELF = "market_fit.status.read.self",
    MARKET_FIT_STATUS_READ_ANY = "market_fit.status.read.any"
}

const allPermissions = Object.values(Permission);

const studentPermissions: Permission[] = [
    Permission.PROFILE_READ_SELF,
    Permission.GITHUB_CONNECT_SELF,
    Permission.ANALYSIS_SUBMIT_SELF,
    Permission.ANALYSIS_READ_SELF,
    Permission.ANALYSIS_STREAM_SELF,
    Permission.JRI_READ_SELF,
    Permission.JRI_RECALCULATE_SELF,
    Permission.JRI_VERIFY_SELF,
    Permission.ONBOARDING_READ_SELF,
    Permission.MARKET_FIT_ANALYZE_SELF,
    Permission.MARKET_FIT_REPORT_READ_SELF,
    Permission.MARKET_FIT_STATUS_READ_SELF
];

const adminPermissions: Permission[] = [
    Permission.PROFILE_READ_SELF,
    Permission.ANALYSIS_SUBMIT_ANY,
    Permission.ANALYSIS_READ_ANY,
    Permission.ANALYSIS_STREAM_ANY,
    Permission.ADMIN_DASHBOARD_READ,
    Permission.ADMIN_DATA_EXPORT,
    Permission.ADMIN_STUDENT_PLACEMENT_WRITE,
    Permission.ADMIN_LEADERBOARD_READ,
    Permission.STUDENT_BULK_IMPORT,
    Permission.MARKET_FIT_ANALYZE_ANY,
    Permission.MARKET_FIT_REPORT_READ_ANY,
    Permission.MARKET_FIT_STATUS_READ_ANY
];

const recruiterPermissions: Permission[] = [
    Permission.PROFILE_READ_SELF,
    Permission.ANALYSIS_READ_ANY,
    Permission.ADMIN_LEADERBOARD_READ,
    Permission.MARKET_FIT_REPORT_READ_ANY
];

const rolePermissionMap: Record<AuthRole, ReadonlySet<Permission>> = {
    STUDENT: new Set(studentPermissions),
    ADMIN: new Set(adminPermissions),
    SUPER_ADMIN: new Set(allPermissions),
    RECRUITER: new Set(recruiterPermissions)
};

export function isAuthRole(value: unknown): value is AuthRole {
    return typeof value === "string" && AUTH_ROLES.includes(value as AuthRole);
}

export function assertAuthRole(value: unknown): AuthRole {
    if (!isAuthRole(value)) {
        throw new Error("INVALID_ROLE");
    }

    return value;
}

export function isPermission(value: unknown): value is Permission {
    return typeof value === "string" && allPermissions.includes(value as Permission);
}

export function getRolePermissions(role: AuthRole): Permission[] {
    return [...(rolePermissionMap[role] ?? new Set<Permission>())];
}

export function roleHasPermission(role: AuthRole, permission: Permission): boolean {
    return rolePermissionMap[role]?.has(permission) ?? false;
}

export function roleHasAnyPermission(role: AuthRole, permissions: readonly Permission[]): boolean {
    return permissions.some((permission) => roleHasPermission(role, permission));
}

export function isElevatedRole(role: AuthRole): role is "ADMIN" | "SUPER_ADMIN" {
    return role === "ADMIN" || role === "SUPER_ADMIN";
}
