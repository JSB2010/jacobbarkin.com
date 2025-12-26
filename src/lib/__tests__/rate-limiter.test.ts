import { RateLimiter } from '@/lib/rate-limiter';

describe('RateLimiter', () => {
  let originalDateNow: () => number;
  
  beforeAll(() => {
    // Store the original Date.now function
    originalDateNow = Date.now;
  });
  
  afterAll(() => {
    // Restore the original Date.now function
    Date.now = originalDateNow;
  });

  beforeEach(() => {
    // Reset the Date.now mock before each test
    const currentTime = 1620000000000; // May 3, 2021
    Date.now = jest.fn(() => currentTime);
    
    // Clear any existing rate limiter instances
    // @ts-ignore - accessing private property for testing
    RateLimiter.instance = undefined;
  });

  test('should create a rate limiter instance with default config', () => {
    const limiter = RateLimiter.getInstance();
    expect(limiter).toBeDefined();
  });

  test('should create a rate limiter instance with custom config', () => {
    const limiter = RateLimiter.getInstance({
      windowMs: 30 * 60 * 1000, // 30 minutes
      maxRequests: 5,
      keyPrefix: 'custom_'
    });
    expect(limiter).toBeDefined();
  });

  test('should allow requests within limit', () => {
    const limiter = RateLimiter.getInstance({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
      keyPrefix: 'test_'
    });
    
    // First request
    let result = limiter.check('test-key');
    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(3);
    
    // Increment a request
    limiter.increment('test-key');
    
    // Second request
    result = limiter.check('test-key');
    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(2);
    
    // Increment another request
    limiter.increment('test-key');
    
    // Third request
    result = limiter.check('test-key');
    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(1);
  });

  test('should block requests over limit', () => {
    const limiter = RateLimiter.getInstance({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 2,
      keyPrefix: 'test_'
    });
    
    // Consume all available requests
    limiter.increment('test-key');
    limiter.increment('test-key');
    
    // This request should be limited
    const result = limiter.check('test-key');
    expect(result.isLimited).toBe(true);
    expect(result.remaining).toBe(0);
    expect(result.msBeforeNext).toBeGreaterThan(0);
  });

  test('should reset limit after window expires', () => {
    let currentTime = 1620000000000; // Starting time
    Date.now = jest.fn(() => currentTime);
    
    const limiter = RateLimiter.getInstance({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 2,
      keyPrefix: 'test_'
    });
    
    // Consume all available requests
    limiter.increment('test-key');
    limiter.increment('test-key');
    
    // Verify we're limited
    let result = limiter.check('test-key');
    expect(result.isLimited).toBe(true);
    
    // Move time forward past the window
    currentTime += 60 * 60 * 1000 + 1000; // 1 hour + 1 second
    
    // Limit should be reset
    result = limiter.check('test-key');
    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(2);
  });

  test('should track different keys separately', () => {
    const limiter = RateLimiter.getInstance({
      maxRequests: 2,
      keyPrefix: 'test_'
    });
    
    // Consume requests for key1
    limiter.increment('key1');
    limiter.increment('key1');
    
    // key1 should be limited
    expect(limiter.check('key1').isLimited).toBe(true);
    
    // key2 should not be limited
    expect(limiter.check('key2').isLimited).toBe(false);
    expect(limiter.check('key2').remaining).toBe(2);
  });

  test('should provide correct reset time', () => {
    const currentTime = 1620000000000; // Fixed time for test
    Date.now = jest.fn(() => currentTime);
    
    const windowMs = 60 * 60 * 1000; // 1 hour
    const limiter = RateLimiter.getInstance({
      windowMs,
      maxRequests: 2,
      keyPrefix: 'test_'
    });
    
    limiter.increment('test-key');
    
    const result = limiter.check('test-key');
    const expectedResetTime = new Date(currentTime + windowMs);
    
    expect(result.resetTime.getTime()).toBe(expectedResetTime.getTime());
  });

  test('should reset rate limits', () => {
    const limiter = RateLimiter.getInstance({
      maxRequests: 5,
      keyPrefix: 'test_'
    });
    
    // Add some rate limit entries
    limiter.increment('key1');
    limiter.increment('key2');
    
    // Reset a specific key
    limiter.reset('key1');
    
    // key1 should be reset
    expect(limiter.check('key1').remaining).toBe(5);
    
    // key2 should still be limited
    expect(limiter.check('key2').remaining).toBe(4);
    
    // Reset all keys
    limiter.resetAll();
    
    // All keys should be reset
    expect(limiter.check('key2').remaining).toBe(5);
  });
});
