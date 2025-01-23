interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private readonly maxAttempts: number;
  private readonly timeWindowMs: number;
  private readonly cooldownMs: number;

  constructor(maxAttempts = 5, timeWindowMs = 15 * 60 * 1000, cooldownMs = 60 * 60 * 1000) {
    this.limits = new Map();
    this.maxAttempts = maxAttempts;
    this.timeWindowMs = timeWindowMs;
    this.cooldownMs = cooldownMs;
  }

  checkLimit(key: string): { allowed: boolean; waitTime: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      this.limits.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
      return { allowed: true, waitTime: 0 };
    }

    // Clean up old entries
    if (now - entry.lastAttempt > this.cooldownMs) {
      this.limits.delete(key);
      return { allowed: true, waitTime: 0 };
    }

    // Check if within time window
    if (now - entry.firstAttempt <= this.timeWindowMs) {
      if (entry.count >= this.maxAttempts) {
        const waitTime = this.cooldownMs - (now - entry.lastAttempt);
        return { allowed: false, waitTime };
      }
      
      entry.count++;
      entry.lastAttempt = now;
      this.limits.set(key, entry);
      return { allowed: true, waitTime: 0 };
    }

    // Reset if outside time window
    this.limits.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return { allowed: true, waitTime: 0 };
  }

  getRemainingAttempts(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - entry.count);
  }

  formatWaitTime(waitTimeMs: number): string {
    if (waitTimeMs <= 0) return '';
    
    const minutes = Math.ceil(waitTimeMs / 60000);
    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    
    const hours = Math.ceil(minutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
}

// Create a singleton instance
export const rateLimiter = new RateLimiter();
