import { prisma } from "../client";

export class ProfileRepository {

  async find(studentId: string, platform: string) {
    return prisma.dSAProfile.findUnique({
      where: {
        studentId_platform: {
          studentId,
          platform,
        },
      },
    });
  }

  async upsert(data: {
    studentId: string;
    platform: string;
    normalizedJson: any;
    rawJson?: any;
    lastSyncedAt: Date;
  }) {
    return prisma.dSAProfile.upsert({
      where: {
        studentId_platform: {
          studentId: data.studentId,
          platform: data.platform,
        },
      },
      update: {
        normalizedJson: data.normalizedJson,
        rawJson: data.rawJson,
        lastSyncedAt: data.lastSyncedAt,
      },
      create: {
        studentId: data.studentId,
        platform: data.platform,
        normalizedJson: data.normalizedJson,
        rawJson: data.rawJson,
        lastSyncedAt: data.lastSyncedAt,
      },
    });
  }
}
