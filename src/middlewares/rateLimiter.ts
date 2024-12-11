import { rateLimit, Options } from "express-rate-limit";

const rateLimiter = (passedOptions?: Partial<Options>) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.,
    validate: { xForwardedForHeader: false, default: true },
    ...passedOptions,
  });

export default rateLimiter;
