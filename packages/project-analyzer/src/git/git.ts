import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import simpleGit from "simple-git";

const GITHUB_URL_REGEX =
    /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/;

const CLONE_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// Private helper — strips tokens from error messages
// ---------------------------------------------------------------------------

function sanitizeUrl(url: string, token?: string): string {
    if (!token) return url;
    return url.replaceAll(token, "[REDACTED]");
}

// ---------------------------------------------------------------------------
// Public API — the only export from this file
// ---------------------------------------------------------------------------

export async function withClonedRepo<T>(
    repoUrl: string,
    token: string | undefined,
    callback: (localPath: string) => Promise<T>
): Promise<T> {
    // 1. Validate URL
    if (!GITHUB_URL_REGEX.test(repoUrl)) {
        throw new Error(
            "Invalid repository URL: must be a GitHub HTTPS URL"
        );
    }

    // 2. Auth injection
    const cloneUrl = token
        ? repoUrl
            .replace("https://github.com/", `https://${token}@github.com/`)
            .replace(/\/?$/, ".git")
        : repoUrl;

    // 3. Temp directory
    const localPath = path.join(tmpdir(), `slh-clone-${uuidv4()}`);

    try {
        // 4. Shallow clone with timeout
        const git = simpleGit();
        const clonePromise = git.clone(cloneUrl, localPath, ["--depth", "1"]);

        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
                () =>
                    reject(
                        new Error(
                            `Clone timed out after 30s for repo: ${sanitizeUrl(repoUrl)}`
                        )
                    ),
                CLONE_TIMEOUT_MS
            )
        );

        await Promise.race([clonePromise, timeoutPromise]);

        // Run caller's callback with the cloned path
        return await callback(localPath);
    } catch (err: unknown) {
        // 7. Sanitize error before rethrowing
        const rawMessage =
            err instanceof Error ? err.message : "Clone failed";
        const safeMessage = sanitizeUrl(rawMessage, token);
        throw new Error(safeMessage);
    } finally {
        // 6. Cleanup guarantee
        await fs.rm(localPath, { recursive: true, force: true });
    }
}
