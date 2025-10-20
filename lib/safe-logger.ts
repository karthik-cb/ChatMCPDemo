/**
 * Safe Logger Utility
 * 
 * Provides secure logging functions that automatically filter out sensitive data
 * like API keys, tokens, and other credentials from debug output.
 */

// List of sensitive parameter names to filter out
const SENSITIVE_KEYS = [
  'apiKey',
  'api_key',
  'apikey',
  'accessToken',
  'access_token',
  'token',
  'secret',
  'password',
  'passwd',
  'pwd',
  'key',
  'auth',
  'authorization',
  'credential',
  'credentials',
  'authToken',
  'auth_token',
  'bearer',
  'jwt',
  'sessionId',
  'session_id',
  'cookie',
  'cookies',
  'privateKey',
  'private_key',
  'publicKey',
  'public_key',
  'signature',
  'nonce',
  'salt',
  'hash',
  'checksum',
  'fingerprint',
  'ssn',
  'socialSecurityNumber',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'cvc',
  'expiry',
  'expiration',
  'pin',
  'otp',
  'verificationCode',
  'verification_code'
]

// List of sensitive parameter patterns (case-insensitive)
const SENSITIVE_PATTERNS = [
  /.*[Kk]ey$/,
  /.*[Tt]oken$/,
  /.*[Pp]assword$/,
  /.*[Ss]ecret$/,
  /.*[Aa]uth.*/,
  /.*[Cc]redential.*/,
  /.*[Pp]rivate.*/,
  /.*[Ss]ession.*/,
  /.*[Cc]ookie.*/,
  /.*[Ss]ignature.*/,
  /.*[Hh]ash.*/,
  /.*[Cc]hecksum.*/,
  /.*[Ff]ingerprint.*/,
  /.*[Cc]ard.*/,
  /.*[Pp]in.*/,
  /.*[Oo]tp.*/,
  /.*[Vv]erification.*/
]

/**
 * Check if a key is sensitive based on exact match or pattern
 */
function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase()
  
  // Check exact matches
  if (SENSITIVE_KEYS.some(sensitive => sensitive.toLowerCase() === lowerKey)) {
    return true
  }
  
  // Check patterns
  if (SENSITIVE_PATTERNS.some(pattern => pattern.test(key))) {
    return true
  }
  
  return false
}

/**
 * Recursively sanitize an object by replacing sensitive values
 */
function sanitizeObject(obj: any, depth = 0, maxDepth = 10): any {
  // Prevent infinite recursion
  if (depth > maxDepth) {
    return '[Max Depth Reached]'
  }
  
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (typeof obj === 'string') {
    // Check if it looks like an API key (long alphanumeric string)
    if (obj.length > 20 && /^[a-zA-Z0-9_-]+$/.test(obj)) {
      return '[REDACTED_API_KEY]'
    }
    return obj
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1, maxDepth))
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(obj)) {
      if (isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeObject(value, depth + 1, maxDepth)
      }
    }
    
    return sanitized
  }
  
  return obj
}

/**
 * Safe console.log that filters sensitive data
 */
export function safeLog(message: string, ...args: any[]): void {
  if (process.env.NODE_ENV === 'production') {
    return // Don't log in production
  }
  
  const sanitizedArgs = args.map(arg => sanitizeObject(arg))
  console.log(message, ...sanitizedArgs)
}

/**
 * Safe console.error that filters sensitive data
 */
export function safeError(message: string, ...args: any[]): void {
  if (process.env.NODE_ENV === 'production') {
    return // Don't log in production
  }
  
  const sanitizedArgs = args.map(arg => sanitizeObject(arg))
  console.error(message, ...sanitizedArgs)
}

/**
 * Safe console.warn that filters sensitive data
 */
export function safeWarn(message: string, ...args: any[]): void {
  if (process.env.NODE_ENV === 'production') {
    return // Don't log in production
  }
  
  const sanitizedArgs = args.map(arg => sanitizeObject(arg))
  console.warn(message, ...sanitizedArgs)
}

/**
 * Safe console.debug that filters sensitive data
 */
export function safeDebug(message: string, ...args: any[]): void {
  if (process.env.NODE_ENV === 'production') {
    return // Don't log in production
  }
  
  const sanitizedArgs = args.map(arg => sanitizeObject(arg))
  console.debug(message, ...sanitizedArgs)
}

/**
 * Safe JSON.stringify that filters sensitive data
 */
export function safeStringify(obj: any, space?: number): string {
  const sanitized = sanitizeObject(obj)
  return JSON.stringify(sanitized, null, space)
}

/**
 * Create a safe logger with a prefix
 */
export function createSafeLogger(prefix: string) {
  return {
    log: (message: string, ...args: any[]) => safeLog(`[${prefix}] ${message}`, ...args),
    error: (message: string, ...args: any[]) => safeError(`[${prefix}] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => safeWarn(`[${prefix}] ${message}`, ...args),
    debug: (message: string, ...args: any[]) => safeDebug(`[${prefix}] ${message}`, ...args),
    stringify: (obj: any, space?: number) => safeStringify(obj, space)
  }
}

/**
 * Test function to verify the logger works correctly
 */
export function testSafeLogger() {
  const testData = {
    apiKey: 'sk-1234567890abcdef',
    api_key: 'sk-9876543210fedcba',
    username: 'testuser',
    password: 'secretpassword',
    config: {
      openai_api_key: 'sk-openai-key-here',
      anthropic_api_key: 'sk-ant-key-here',
      cerebras_api_key: 'sk-cerebras-key-here',
      normalSetting: 'this is safe'
    },
    messages: [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ]
  }
  
  console.log('🧪 Testing Safe Logger:')
  console.log('Original data:', testData)
  console.log('Sanitized data:', safeStringify(testData, 2))
  
  const logger = createSafeLogger('TEST')
  logger.log('This is a test log with sensitive data:', testData)
}

// Export the main functions
export default {
  safeLog,
  safeError,
  safeWarn,
  safeDebug,
  safeStringify,
  createSafeLogger,
  testSafeLogger
}
