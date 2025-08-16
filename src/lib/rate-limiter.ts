// Simple in-memory rate limiter for API endpoints
// This is stateless and resets on server restart, which aligns with the stateless architecture

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    // 100 requests per 15 minutes
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): {
    allowed: boolean;
    resetTime?: number;
    remainingRequests?: number;
  } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.store.delete(identifier);
    }

    const currentEntry = this.store.get(identifier);

    if (!currentEntry) {
      // First request in window
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        allowed: true,
        remainingRequests: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      };
    }

    if (currentEntry.count >= this.maxRequests) {
      return {
        allowed: false,
        resetTime: currentEntry.resetTime,
        remainingRequests: 0,
      };
    }

    // Increment count
    currentEntry.count++;
    this.store.set(identifier, currentEntry);

    return {
      allowed: true,
      remainingRequests: this.maxRequests - currentEntry.count,
      resetTime: currentEntry.resetTime,
    };
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Global rate limiter instances
export const calendarApiRateLimiter = new RateLimiter(5000, 15 * 60 * 1000); // 5000 requests per 15 minutes for calendar APIs
export const chatApiRateLimiter = new RateLimiter(30, 60 * 1000); // 30 requests per minute for chat API

// Cleanup every 5 minutes
setInterval(() => {
  calendarApiRateLimiter.cleanup();
  chatApiRateLimiter.cleanup();
}, 5 * 60 * 1000);

export function createRateLimitResponse(resetTime: number) {
  const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);

  return {
    error: "Rate limit exceeded",
    retryAfter: secondsUntilReset,
    message: `Too many requests. Try again in ${secondsUntilReset} seconds.`,
  };
}
