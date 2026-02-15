import { Redis } from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

console.log(`[Worker-Redis] Attempting to connect to ${REDIS_HOST}:${REDIS_PORT} (Password: ${process.env.REDIS_PASSWORD ? "SET" : "MISSING"})`);

export const connection = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
});

connection.on("connect", () => console.log("[Worker-Redis] Connected to Redis server"));
connection.on("ready", () => console.log("[Worker-Redis] Redis connection is ready"));
connection.on("error", (err) => console.error(`[Worker-Redis] Redis Error: ${err.message}`));
