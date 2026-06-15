/**
 * Lightweight in-memory rate limiter (fixed window).
 *
 * Intended for AI API routes to curb abuse and runaway cost. Keyed by an
 * identifier (e.g. client IP or user id).
 *
 * NOTE: state is per server instance / per warm serverless container, so this
 * is a best-effort guard, not a distributed limiter. For strict, multi-instance
 * limits use Upstash Redis / Vercel KV — swap the Map for a KV client and keep
 * the same `rateLimit()` signature. A periodic sweep prevents unbounded growth.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit?: number;
  /** Window length in milliseconds. */
  windowMs?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix ms timestamp when the window resets. */
  reset: number;
}

export function rateLimit(
  identifier: string,
  { limit = 20, windowMs = 60_000 }: RateLimitOptions = {}
): RateLimitResult {
  const now = Date.now();

  // Occasionally drop expired buckets to bound memory.
  if (now - lastSweep > windowMs) {
    buckets.forEach((b, key) => {
      if (b.resetAt <= now) buckets.delete(key);
    });
    lastSweep = now;
  }

  const existing = buckets.get(identifier);
  if (!existing || existing.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(identifier, bucket);
    return { success: true, limit, remaining: limit - 1, reset: bucket.resetAt };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return {
    success: existing.count <= limit,
    limit,
    remaining,
    reset: existing.resetAt,
  };
}

/** Derive a best-effort client identifier from a request's headers. */
export function getClientId(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'anonymous';
}
