import prisma from "./db";
import type { AuthPrincipal } from "./middleware/auth.middleware";
import { Prisma } from "../../../packages/database/src/generated/client";

export function getScopedPrismaClient(principal: AuthPrincipal | null) {
    if (!principal) {
        throw new Error("UNAUTHORIZED_DB_ACCESS: principal is required to use the scoped client.");
    }

    const { role, collegeId, userId } = principal;

    return (prisma as any).$extends({
        query: {
            $allModels: {
                async $allOperations({ model, operation, args, query }: any) {
                    if (!model) return (query as any)(args);

                    const ctx = Prisma.dmmf.datamodel.models.find((m: any) => m.name === model);
                    if (!ctx) return (query as any)(args);

                    const hasCollegeId = ctx.fields.some((f: any) => f.name === "collegeId");
                    const hasUserId = ctx.fields.some((f: any) => f.name === "userId");

                    const readManyLike = [
                        "findFirst", "findFirstOrThrow", "findMany", 
                        "count", "aggregate", "groupBy", 
                        "updateMany", "deleteMany"
                    ];

                    let scopeFilter: any = null;
                    if (role === "ADMIN" && hasCollegeId && collegeId) {
                        scopeFilter = { collegeId };
                    } else if (role === "STUDENT" && hasUserId && userId) {
                        scopeFilter = { userId };
                    }

                    // If no scoping rules apply for this role/model combination, proceed normally.
                    if (!scopeFilter) {
                        return (query as any)(args);
                    }

                    if (readManyLike.includes(operation)) {
                        args.where = { ...(args.where || {}), ...scopeFilter };
                        return (query as any)(args);
                    }

                    if (["findUnique", "findUniqueOrThrow"].includes(operation)) {
                        const opMap: Record<string, string> = {
                            findUnique: "findFirst",
                            findUniqueOrThrow: "findFirstOrThrow"
                        };
                        const fallbackOp = opMap[operation];
                        return (prisma as any)[model][fallbackOp]({
                            ...args,
                            where: { ...(args.where || {}), ...scopeFilter }
                        });
                    }

                    if (["update", "delete"].includes(operation)) {
                        // Pre-flight check to guarantee record ownership
                        const record = await (prisma as any)[model].findFirst({
                            where: { ...(args.where || {}), ...scopeFilter },
                            select: { [ctx.primaryKey?.name || "id"]: true }
                        });

                        if (!record) {
                            throw new Error(`FORBIDDEN: Attempted to ${operation} ${model} outside of allowed scope.`);
                        }

                        return (query as any)(args);
                    }

                    return (query as any)(args);
                }
            }
        }
    });
}
