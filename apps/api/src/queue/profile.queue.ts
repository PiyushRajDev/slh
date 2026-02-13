import { Queue } from "bullmq";
import { redisOptions } from "./redis";

export const profileQueue = new Queue("profileQueue", {
  connection: redisOptions,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export async function enqueueProfileFetch(
  studentId: string,
  platform: string
) {
  const jobId = `${platform}-${studentId}`;

  const existingJob = await profileQueue.getJob(jobId);

  if (existingJob) {
    return { alreadyScheduled: true };
  }

  await profileQueue.add(
    "FETCH_PROFILE",
    { studentId, platform },
    { jobId }
  );

  return { alreadyScheduled: false };
}

