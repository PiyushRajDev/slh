import { Queue } from "bullmq";
import { redisOptions } from "./redis.js";

export const profileQueue = new Queue("profileQueue", {
  connection: redisOptions,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

// Queue Lifecycle Logging (Basic visibility on producer side)
profileQueue.on("error", (err: Error) => console.error(`[Queue] Error: ${err.message}`));

export async function enqueueProfileFetch(
  studentId: string,
  platform: string
) {
  const jobId = `${platform}-${studentId}`;
  const isDebug = process.env.DEBUG_QUEUE === "true";

  if (isDebug) {
    const counts = await profileQueue.getJobCounts();
    console.log(`[Queue] Current Counts:`, counts);
  }

  console.log(`[Queue] Attempting to enqueue fetch for ${studentId} on ${platform} (jobId: ${jobId})`);

  const existingJob = await profileQueue.getJob(jobId);

  if (existingJob) {
    const state = await existingJob.getState();
    const isActive = ["waiting", "active", "delayed"].includes(state);

    if (isActive) {
      console.log(`[Queue] BLOCKING: Job ${jobId} is currently ${state}`);
      return { alreadyScheduled: true, jobId, state };
    }

    console.log(`[Queue] ALLOWING: Previous job ${jobId} is in state: ${state}. Removing old job to re-add.`);
    await existingJob.remove();
  }

  const job = await profileQueue.add(
    "FETCH_PROFILE",
    { studentId, platform },
    { jobId }
  );

  console.log(`[Queue] Job ${job.id} successfully added to queue`);
  return { alreadyScheduled: false, jobId: job.id };
}

