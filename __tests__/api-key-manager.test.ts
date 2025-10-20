/**
 * Tests for API Key Manager
 * Tests the secure client-side API key management functionality
 */

import { apiKeyManager } from '@/lib/api-key-manager'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock fetch for API validation
global.fetch = jest.fn()

describe('API Key Manager', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  describe('Key Storage and Retrieval', () => {
    test('should save and retrieve API key', () => {
      const provider = 'cerebras'
      const apiKey = 'test-api-key-123'
      const model = 'llama-3.3-70b'

      apiKeyManager.saveAPIKey(provider, apiKey, model)
      
      const retrievedKey = apiKeyManager.getAPIKey(provider)
      expect(retrievedKey).toBe(apiKey)
    })

    test('should obfuscate keys in storage', () => {
      const provider = 'openai'
      const apiKey = 'sk-test-key-456'
      const model = 'gpt-4o'

      apiKeyManager.saveAPIKey(provider, apiKey, model)
      
      // Check that the stored value is obfuscated (base64 encoded)
      const stored = localStorageMock.getItem('mcp-demo-api-keys')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed[provider].apiKey).not.toBe(apiKey) // Should be obfuscated
      expect(parsed[provider].apiKey).toBe(btoa(apiKey)) // Should be base64 encoded
    })

    test('should handle multiple providers', () => {
      const providers = [
        { id: 'cerebras', key: 'cerebras-key-123', model: 'llama-3.3-70b' },
        { id: 'openai', key: 'sk-openai-key-456', model: 'gpt-4o' },
        { id: 'anthropic', key: 'sk-ant-anthropic-789', model: 'claude-3-5-sonnet-20241022' }
      ]

      providers.forEach(({ id, key, model }) => {
        apiKeyManager.saveAPIKey(id, key, model)
      })

      providers.forEach(({ id, key }) => {
        expect(apiKeyManager.getAPIKey(id)).toBe(key)
      })
    })

    test('should return null for non-existent keys', () => {
      expect(apiKeyManager.getAPIKey('nonexistent')).toBeNull()
    })

    test('should handle corrupted storage gracefully', () => {
      // Store invalid JSON
      localStorageMock.setItem('mcp-demo-api-keys', 'invalid-json')
      
      const configs = apiKeyManager.getStoredConfigs()
      expect(configs).toEqual({})
    })
  })

  describe('Key Management', () => {
    test('should remove API key', () => {
      const provider = 'cerebras'
      const apiKey = 'test-key-123'
      const model = 'llama-3.3-70b'

      apiKeyManager.saveAPIKey(provider, apiKey, model)
      expect(apiKeyManager.getAPIKey(provider)).toBe(apiKey)

      apiKeyManager.removeAPIKey(provider)
      expect(apiKeyManager.getAPIKey(provider)).toBeNull()
    })

    test('should clear all keys', () => {
      const providers = ['cerebras', 'openai', 'anthropic']
      
      providers.forEach(provider => {
        apiKeyManager.saveAPIKey(provider, `key-${provider}`, 'default-model')
      })

      apiKeyManager.clearAllKeys()
      
      providers.forEach(provider => {
        expect(apiKeyManager.getAPIKey(provider)).toBeNull()
      })
    })

    test('should handle invalid key deobfuscation', () => {
      // Manually store an invalid obfuscated key
      const invalidConfig = {
        cerebras: {
          provider: 'cerebras',
          apiKey: 'invalid-base64!@#',
          model: 'llama-3.3-70b',
          enabled: true
        }
      }
      localStorageMock.setItem('mcp-demo-api-keys', JSON.stringify(invalidConfig))

      // Should return null and clean up the invalid key
      expect(apiKeyManager.getAPIKey('cerebras')).toBeNull()
      
      // Should have removed the invalid key from storage
      const configs = apiKeyManager.getStoredConfigs()
      expect(configs.cerebras).toBeUndefined()
    })
  })

  describe('Transparency Information', () => {
    test('should provide accurate transparency info', () => {
      const providers = [
        { id: 'cerebras', key: 'key1', model: 'model1' },
        { id: 'openai', key: 'key2', model: 'model2' }
      ]

      providers.forEach(({ id, key, model }) => {
        apiKeyManager.saveAPIKey(id, key, model)
      })

      const info = apiKeyManager.getTransparencyInfo()
      
      expect(info.keysStored).toBe(2)
      expect(info.providers).toEqual(['cerebras', 'openai'])
      expect(info.storageLocation).toBe('localStorage (browser only)')
    })

    test('should handle empty storage', () => {
      const info = apiKeyManager.getTransparencyInfo()
      
      expect(info.keysStored).toBe(0)
      expect(info.providers).toEqual([])
      expect(info.lastValidated).toBeNull()
    })
  })

  describe('API Key Validation', () => {
    test('should validate API key successfully', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('{"isValid": true}')
      }
      
      ;(fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const result = await apiKeyManager.validateAPIKey('cerebras', 'test-key')
      
      expect(result.isValid).toBe(true)
      expect(fetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'cerebras',
          apiKey: 'test-key',
          test: true,
          messages: [{ role: 'user', content: 'Hello' }]
        })
      })
    })

    test('should handle validation failure', async () => {
      const mockResponse = {
        ok: false,
        text: () => Promise.resolve('Invalid API key')
      }
      
      ;(fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const result = await apiKeyManager.validateAPIKey('openai', 'invalid-key')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid API key')
    })

    test('should handle network errors', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const result = await apiKeyManager.validateAPIKey('anthropic', 'test-key')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Network error')
    })

    test('should update validation status after successful validation', async () => {
      const provider = 'cerebras'
      const apiKey = 'test-key'
      const model = 'llama-3.3-70b'

      // Save key first
      apiKeyManager.saveAPIKey(provider, apiKey, model)

      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('{"isValid": true}')
      }
      
      ;(fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      await apiKeyManager.validateAPIKey(provider, apiKey)

      const configs = apiKeyManager.getStoredConfigs()
      expect(configs[provider].validationStatus).toBe('valid')
      expect(configs[provider].lastValidated).toBeDefined()
    })
  })

  describe('Configuration Management', () => {
    test('should get stored configurations', () => {
      const configs = {
        cerebras: {
          provider: 'cerebras',
          apiKey: btoa('test-key'),
          model: 'llama-3.3-70b',
          enabled: true,
          validationStatus: 'valid' as const,
          lastValidated: new Date()
        }
      }
      
      localStorageMock.setItem('mcp-demo-api-keys', JSON.stringify(configs))
      
      const retrieved = apiKeyManager.getStoredConfigs()
      expect(retrieved).toEqual(configs)
    })

    test('should handle missing storage gracefully', () => {
      const configs = apiKeyManager.getStoredConfigs()
      expect(configs).toEqual({})
    })
  })
})
