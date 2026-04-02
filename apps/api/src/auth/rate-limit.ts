import rateLimit from "express-rate-limit";

function limiter(windowMs: number, max: number, message: string) {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: message },
        handler: (_req, res, _next, options) => {
            res.status(options.statusCode).json(options.message);
        },
    });
}

/** 10 req / min per IP — protects login and register from brute-force */
export const authLimiter = limiter(
    60 * 1000,
    10,
    "Too many authentication attempts. Please try again later."
);

/** 20 req / min per IP — token refresh is called more aggressively by frontends */
export const refreshLimiter = limiter(
    60 * 1000,
    20,
    "Too many refresh attempts. Please try again later."
);

/** 30 req / min per IP — third-party scraping endpoint */
export const leetcodeLimiter = limiter(
    60 * 1000,
    30,
    "Too many requests. Please try again later."
);
