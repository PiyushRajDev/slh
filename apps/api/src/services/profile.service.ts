import { DSARepository } from "@slh/database";
import { isFresh } from "./freshness.service.js";

export class ProfileService {
    private repo = new DSARepository();

    async getProfileStatus(studentId: string, platform: string) {
        const profile = await this.repo.find(studentId, platform);

        if (!profile) {
            return {
                status: "not_found",
                data: null,
            };
        }

        if (isFresh(profile.lastSyncedAt)) {
            return {
                status: "fresh",
                data: profile.normalizedJson,
            };
        }

        return {
            status: "stale",
            data: profile.normalizedJson,
        };
    }

    async canRefresh(studentId: string, platform: string) {
        const profile = await this.repo.find(studentId, platform);

        if (!profile) return true;

        const THIRTY_MIN = 30 * 60 * 1000;

        return Date.now() - new Date(profile.lastSyncedAt).getTime() > THIRTY_MIN;
    }


}
