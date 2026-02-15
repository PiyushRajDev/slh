import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`[EnvLoader] DATABASE_URL loaded. Host: ${url.host}, User: ${url.username}`);
} else {
    console.error(`[EnvLoader] ERROR: DATABASE_URL is missing!`);
}
