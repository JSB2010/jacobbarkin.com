import { logger } from '@/lib/logger';

// Interface for spam detection result
export interface SpamDetectionResult {
  isSpam: boolean;
  score: number;
  reasons: string[];
}

// Interface for spam detection options
export interface SpamDetectionOptions {
  minMessageLength: number;
  maxMessageLength: number;
  maxLinks: number;
  forbiddenWords: string[];
  suspiciousPatterns: RegExp[];
  honeypotField?: string;
  honeypotValue?: string;
}

// Default spam detection options
const defaultOptions: SpamDetectionOptions = {
  minMessageLength: 10,
  maxMessageLength: 5000,
  maxLinks: 5,
  forbiddenWords: [
    'viagra', 'cialis', 'casino', 'lottery', 'prize', 'winner', 'free money',
    'buy now', 'click here', 'earn money', 'make money', 'get rich', 'weight loss',
    'diet pill', 'cheap', 'discount', 'free offer', 'limited time', 'act now',
    'satisfaction', 'guarantee', 'no risk', 'no obligation', 'no purchase',
    'congratulations', 'won', 'winning', 'selected', 'pharmacy', 'prescription'
  ],
  suspiciousPatterns: [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email pattern
    /https?:\/\/[^\s]+/gi, // URL pattern
    /\+\d{10,}/g, // Phone number pattern
    /\$\d+/g, // Dollar amount pattern
    /\d{3}[\s-]?\d{3}[\s-]?\d{4}/g, // US phone number pattern
  ]
};

/**
 * Detect spam in contact form submission
 * @param data The form data to check
 * @param options Spam detection options
 * @returns Spam detection result
 */
export function detectSpam(
  data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
    [key: string]: any;
  },
  options: Partial<SpamDetectionOptions> = {}
): SpamDetectionResult {
  // Merge options with defaults
  const opts = { ...defaultOptions, ...options };
  
  // Initialize result
  const result: SpamDetectionResult = {
    isSpam: false,
    score: 0,
    reasons: []
  };
  
  // Check honeypot field if provided
  if (opts.honeypotField && opts.honeypotValue !== undefined) {
    const honeypotValue = data[opts.honeypotField];
    if (honeypotValue !== opts.honeypotValue) {
      result.isSpam = true;
      result.score += 100;
      result.reasons.push('Honeypot field triggered');
      
      logger.warn('Spam detected: Honeypot field triggered', {
        field: opts.honeypotField,
        expected: opts.honeypotValue,
        actual: honeypotValue
      });
      
      // Return early as this is a strong indicator of spam
      return result;
    }
  }
  
  // Check message length
  if (data.message.length < opts.minMessageLength) {
    result.score += 10;
    result.reasons.push('Message too short');
  }
  
  if (data.message.length > opts.maxMessageLength) {
    result.score += 20;
    result.reasons.push('Message too long');
  }
  
  // Check for links
  const linkMatches = data.message.match(/https?:\/\/[^\s]+/gi);
  if (linkMatches && linkMatches.length > opts.maxLinks) {
    result.score += 30;
    result.reasons.push(`Too many links (${linkMatches.length})`);
  }
  
  // Check for forbidden words
  const lowerMessage = data.message.toLowerCase();
  const lowerSubject = (data.subject || '').toLowerCase();
  const lowerName = data.name.toLowerCase();
  
  const foundForbiddenWords = opts.forbiddenWords.filter(word => 
    lowerMessage.includes(word.toLowerCase()) || 
    lowerSubject.includes(word.toLowerCase()) ||
    lowerName.includes(word.toLowerCase())
  );
  
  if (foundForbiddenWords.length > 0) {
    result.score += 25 * foundForbiddenWords.length;
    result.reasons.push(`Contains forbidden words: ${foundForbiddenWords.join(', ')}`);
  }
  
  // Check for suspicious patterns
  let suspiciousPatternCount = 0;
  
  opts.suspiciousPatterns.forEach(pattern => {
    const matches = data.message.match(pattern);
    if (matches) {
      suspiciousPatternCount += matches.length;
    }
  });
  
  if (suspiciousPatternCount > 0) {
    result.score += 15 * suspiciousPatternCount;
    result.reasons.push(`Contains suspicious patterns (${suspiciousPatternCount})`);
  }
  
  // Check for excessive capitalization
  const upperCaseChars = data.message.replace(/[^A-Z]/g, '').length;
  const totalChars = data.message.replace(/[^A-Za-z]/g, '').length;
  
  if (totalChars > 20 && upperCaseChars / totalChars > 0.5) {
    result.score += 20;
    result.reasons.push('Excessive capitalization');
  }
  
  // Check for character repetition
  const repeatedCharsMatch = data.message.match(/(.)\1{5,}/g);
  if (repeatedCharsMatch) {
    result.score += 15;
    result.reasons.push('Excessive character repetition');
  }
  
  // Check for mismatched name and email
  const emailNamePart = data.email.split('@')[0].toLowerCase();
  if (emailNamePart.length > 3 && !lowerName.includes(emailNamePart) && !emailNamePart.includes(lowerName.replace(/\s+/g, ''))) {
    result.score += 10;
    result.reasons.push('Name and email mismatch');
  }
  
  // Set isSpam flag if score is high enough
  if (result.score >= 50) {
    result.isSpam = true;
    
    logger.warn('Spam detected', {
      score: result.score,
      reasons: result.reasons,
      email: data.email
    });
  }
  
  return result;
}

/**
 * Check if a submission is spam
 * @param data The form data to check
 * @param options Spam detection options
 * @returns True if spam, false otherwise
 */
export function isSpam(
  data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
    [key: string]: any;
  },
  options: Partial<SpamDetectionOptions> = {}
): boolean {
  return detectSpam(data, options).isSpam;
}