import { buildUnifiedProfile } from "@slh/dsa-core";
import { DSARepository } from "@slh/database";
import { Job } from "bullmq";

const repo = new DSARepository();

export async function processProfileJob(job: Job) {
    const { studentId, platform } = job.data;
    console.log(`[Worker] Processing profile job for ${studentId} on ${platform}...`);

    if (!studentId || !platform) {
        throw new Error("Missing required fields: studentId or platform");
    }

    try {
        const profile = await buildUnifiedProfile(studentId, platform);
        await repo.upsert(studentId, platform, profile);
        console.log(`[Worker] Successfully synced profile for ${studentId} on ${platform}`);
    } catch (error) {
        // DO NOT swallow errors, allows BullMQ to retry
        throw error;
    }
}
