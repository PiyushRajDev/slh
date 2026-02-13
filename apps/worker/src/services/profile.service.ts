import { ProfileRepository } from "@slh/database";

export class ProfileService {
  private repo = new ProfileRepository();

  private isFresh(date: Date) {
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    return Date.now() - new Date(date).getTime() < SIX_HOURS;
  }

  async getProfileStatus(studentId: string, platform: string) {
    const profile = await this.repo.find(studentId, platform);

    if (!profile) {
      return { status: "not_found", data: null };
    }

    if (this.isFresh(profile.lastSyncedAt)) {
      return { status: "fresh", data: profile.normalizedJson };
    }

    return { status: "stale", data: profile.normalizedJson };
  }
}
