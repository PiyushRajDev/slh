import { prisma } from "../client.js";
export class DSARepository {
    async find(studentId, platform) {
        return prisma.dSAProfile.findUnique({
            where: {
                studentId_platform: {
                    studentId,
                    platform,
                },
            },
        });
    }
    async save(profile) {
        // profile conforms to UnifiedDSAProfile from shared
        return db.dSAProfile.upsert({
            where: {
                studentId_platform: {
                    studentId: profile.username,
                    platform: profile.platform,
                },
            },
            update: {
                normalizedJson: profile,
                lastSyncedAt: profile.last_synced_at,
            },
            create: {
                studentId: profile.username,
                platform: profile.platform,
                normalizedJson: profile,
                lastSyncedAt: profile.last_synced_at,
            },
        });
    }
    async healthCheck() {
        return db.$queryRaw `SELECT 1`;
    }
}
//# sourceMappingURL=dsa.repository.js.map