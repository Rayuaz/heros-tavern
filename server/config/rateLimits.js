import rateLimit from "express-rate-limit";

// Standard rate limiter
const standardLimiter = rateLimit({
    windowMs: 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
});

// Chat rate limiter
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
});

export default standardLimiter;
export { chatLimiter };
