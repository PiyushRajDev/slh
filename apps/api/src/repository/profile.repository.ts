import { db } from "../../../../packages/database/src";
import { UnifiedDSAProfile } from "../models/unifiedProfile";

export class ProfileRepository {

    async find(studentId: string, platform: string) {
        return db.dSAProfile.findUnique({
            where: {
                studentId_platform: {
                    studentId,
                    platform,
                },
            },
        });
    }

    async save(profile: UnifiedDSAProfile) {
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
}
