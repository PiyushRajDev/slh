import { prisma } from "../client.js";
import { UnifiedDSAProfile } from "@slh/shared";

export class DSARepository {
    async find(studentId: string, platform: string) {
        return prisma.dSAProfile.findUnique({
            where: {
                studentId_platform: {
                    studentId,
                    platform: platform as any,
                },
            },
        });
    }

    async upsert(studentId: string, platform: string, data: UnifiedDSAProfile) {
        return prisma.dSAProfile.upsert({
            where: {
                studentId_platform: {
                    studentId,
                    platform: platform as any,
                },
            },
            update: {
                normalizedJson: data as any,
                lastSyncedAt: new Date(),
            },
            create: {
                studentId,
                platform: platform as any,
                normalizedJson: data as any,
                lastSyncedAt: new Date(),
            },
        });
    }

    async healthCheck() {
        return prisma.$queryRaw`SELECT 1`;
    }
}
