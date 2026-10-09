// Process-local protection for bcrypt endpoints. Use a shared edge limiter when scaling.
export function authRateLimit({
  limit = 20,
  windowMs = 15 * 60 * 1000,
  now = Date.now,
} = {}) {
  const attempts = new Map();
  return (req, res, next) => {
    const time = now(),
      key = req.ip;
    let bucket = attempts.get(key);
    if (!bucket || bucket.until <= time) {
      if (attempts.size >= 10000) {
        for (const [ip, value] of attempts)
          if (value.until <= time) attempts.delete(ip);
        if (attempts.size >= 10000)
          attempts.delete(attempts.keys().next().value);
      }
      bucket = { count: 0, until: time + windowMs };
      attempts.set(key, bucket);
    }
    if (bucket.count >= limit) {
      res.set(
        "Retry-After",
        String(Math.max(1, Math.ceil((bucket.until - time) / 1000))),
      );
      return res
        .status(429)
        .json({
          error: {
            message:
              "A few too many attempts. Please wait a little before trying again.",
          },
        });
    }
    bucket.count++;
    next();
  };
}
