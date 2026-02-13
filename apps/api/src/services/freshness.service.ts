export function isFresh(lastSyncedAt: Date): boolean {
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    return Date.now() - new Date(lastSyncedAt).getTime() < SIX_HOURS;
}
