export function clamp(value: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, value));
}

export function round(value: number): number {
    return Math.round(value * 100) / 100;
}

export function safeNum(val: number | null | undefined, fallback = 0): number {
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
}
