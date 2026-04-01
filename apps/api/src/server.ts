import "dotenv/config";
import app from "./app";
import { registerScheduledJobs, startSchedulerWorker } from "./services/scheduler";

const PORT = 3000;

app.listen(PORT, async () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
    await registerScheduledJobs();
    startSchedulerWorker();
});
