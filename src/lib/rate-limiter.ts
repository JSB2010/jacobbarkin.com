import { logger } from '@/lib/logger';

// Interface for rate limit entry
interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

// Rate limiter configuration
interface RateLimiterConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

/**
 * Simple rate limiter for API routes
 * Uses localStorage on client-side and memory on server-side
 */
export class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitEntry> = new Map();
  private config: RateLimiterConfig;
  
  // Default configuration
  private static readonly DEFAULT_CONFIG: RateLimiterConfig = {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 requests per hour
    keyPrefix: 'rate_limit_'
  };
  
  // Private constructor for singleton pattern
  private constructor(config?: Partial<RateLimiterConfig>) {
    this.config = { ...RateLimiter.DEFAULT_CONFIG, ...config };
    this.loadLimits();
  }
  
  // Get singleton instance
  public static getInstance(config?: Partial<RateLimiterConfig>): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter(config);
    }
    return RateLimiter.instance;
  }
  
  /**
   * Check if a key is rate limited
   * @param key The key to check (e.g., IP address, email, etc.)
   * @returns Object with isLimited flag and reset time
   */
  public check(key: string): { 
    isLimited: boolean; 
    remaining: number; 
    resetTime: Date;
    msBeforeNext: number;
  } {
    const now = Date.now();
    const limitKey = `${this.config.keyPrefix}${key}`;
    
    // Get or create entry
    let entry = this.limits.get(limitKey);
    if (!entry) {
      entry = {
        count: 0,
        firstRequest: now,
        lastRequest: now
      };
      this.limits.set(limitKey, entry);
    }
    
    // Check if window has expired
    const windowExpired = now - entry.firstRequest > this.config.windowMs;
    
    // If window expired, reset entry
    if (windowExpired) {
      entry.count = 0;
      entry.firstRequest = now;
    }
    
    // Calculate remaining requests
    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    
    // Calculate reset time
    const resetTime = new Date(entry.firstRequest + this.config.windowMs);
    
    // Calculate ms before next request is allowed
    let msBeforeNext = 0;
    if (entry.count >= this.config.maxRequests) {
      msBeforeNext = (entry.firstRequest + this.config.windowMs) - now;
    }
    
    return {
      isLimited: entry.count >= this.config.maxRequests && !windowExpired,
      remaining,
      resetTime,
      msBeforeNext
    };
  }
  
  /**
   * Increment the request count for a key
   * @param key The key to increment (e.g., IP address, email, etc.)
   * @returns Object with updated rate limit info
   */
  public increment(key: string): { 
    isLimited: boolean; 
    remaining: number; 
    resetTime: Date;
    msBeforeNext: number;
  } {
    const now = Date.now();
    const limitKey = `${this.config.keyPrefix}${key}`;
    
    // Get or create entry
    let entry = this.limits.get(limitKey);
    if (!entry) {
      entry = {
        count: 0,
        firstRequest: now,
        lastRequest: now
      };
      this.limits.set(limitKey, entry);
    }
    
    // Check if window has expired
    const windowExpired = now - entry.firstRequest > this.config.windowMs;
    
    // If window expired, reset entry
    if (windowExpired) {
      entry.count = 1; // Start with 1 for this request
      entry.firstRequest = now;
      entry.lastRequest = now;
    } else {
      // Increment count and update last request time
      entry.count += 1;
      entry.lastRequest = now;
    }
    
    // Save limits
    this.saveLimits();
    
    // Calculate remaining requests
    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    
    // Calculate reset time
    const resetTime = new Date(entry.firstRequest + this.config.windowMs);
    
    // Calculate ms before next request is allowed
    let msBeforeNext = 0;
    if (entry.count >= this.config.maxRequests) {
      msBeforeNext = (entry.firstRequest + this.config.windowMs) - now;
    }
    
    // Log rate limit info
    logger.info('Rate limit updated', {
      key: limitKey,
      count: entry.count,
      remaining,
      resetTime: resetTime.toISOString(),
      isLimited: entry.count >= this.config.maxRequests
    });
    
    return {
      isLimited: entry.count >= this.config.maxRequests,
      remaining,
      resetTime,
      msBeforeNext
    };
  }
  
  /**
   * Reset the rate limit for a key
   * @param key The key to reset
   */
  public reset(key: string): void {
    const limitKey = `${this.config.keyPrefix}${key}`;
    this.limits.delete(limitKey);
    this.saveLimits();
    
    logger.info('Rate limit reset', { key: limitKey });
  }
  
  /**
   * Reset all rate limits
   */
  public resetAll(): void {
    this.limits.clear();
    this.saveLimits();
    
    logger.info('All rate limits reset');
  }
  
  /**
   * Save limits to localStorage (client-side only)
   */
  private saveLimits(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Convert Map to object for storage
      const limitsObj: Record<string, RateLimitEntry> = {};
      this.limits.forEach((value, key) => {
        limitsObj[key] = value;
      });
      
      localStorage.setItem('rate_limits', JSON.stringify(limitsObj));
    } catch (error) {
      logger.error('Error saving rate limits to localStorage', error as Record<string, unknown>);
    }
  }
  
  /**
   * Load limits from localStorage (client-side only)
   */
  private loadLimits(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const savedLimits = localStorage.getItem('rate_limits');
      if (savedLimits) {
        const limitsObj = JSON.parse(savedLimits);
        
        // Convert object back to Map
        Object.entries(limitsObj).forEach(([key, value]) => {
          this.limits.set(key, value as RateLimitEntry);
        });
        
        logger.info('Loaded rate limits from localStorage', { 
          count: this.limits.size 
        });
      }
    } catch (error) {
      logger.error('Error loading rate limits from localStorage', error as Record<string, unknown>);
    }
  }
}

/**
 * Get rate limiter instance with default configuration
 */
export function getRateLimiter(config?: Partial<RateLimiterConfig>): RateLimiter {
  return RateLimiter.getInstance(config);
}

/**
 * Check if a request is rate limited
 * @param key The key to check (e.g., IP address, email, etc.)
 * @param config Optional configuration
 */
export function checkRateLimit(
  key: string,
  config?: Partial<RateLimiterConfig>
): { 
  isLimited: boolean; 
  remaining: number; 
  resetTime: Date;
  msBeforeNext: number;
} {
  return getRateLimiter(config).check(key);
}

/**
 * Increment the request count for a key
 * @param key The key to increment (e.g., IP address, email, etc.)
 * @param config Optional configuration
 */
export function incrementRateLimit(
  key: string,
  config?: Partial<RateLimiterConfig>
): { 
  isLimited: boolean; 
  remaining: number; 
  resetTime: Date;
  msBeforeNext: number;
} {
  return getRateLimiter(config).increment(key);
}