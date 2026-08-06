interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory fixed-window rate limiter.
 *
 * Deliberately process-local: it guards a single-instance deployment against
 * brute-force login attempts without adding a Redis dependency. If this app is
 * ever scaled to multiple instances, swap this module for a shared store — the
 * call sites only depend on the `checkRateLimit` signature.
 */
const buckets = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
