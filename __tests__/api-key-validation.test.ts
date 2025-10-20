/**
 * Tests for API Key Validation
 * Tests the server-side API key validation functionality
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/chat/route'

// Mock the dependencies
jest.mock('@/lib/llm-providers', () => ({
  getModelInstance: jest.fn(),
  getProvider: jest.fn()
}))

jest.mock('ai', () => ({
  streamText: jest.fn(),
  convertToModelMessages: jest.fn(),
  generateId: jest.fn(() => 'test-id')
}))

import { getModelInstance, getProvider } from '@/lib/llm-providers'
import { streamText } from 'ai'

const mockGetModelInstance = getModelInstance as jest.MockedFunction<typeof getModelInstance>
const mockGetProvider = getProvider as jest.MockedFunction<typeof getProvider>
const mockStreamText = streamText as jest.MockedFunction<typeof streamText>

describe('API Key Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Successful Validation', () => {
    test('should validate API key successfully', async () => {
      const mockModel = { id: 'test-model' }
      const mockProvider = { id: 'cerebras', name: 'Cerebras' }
      
      mockGetProvider.mockReturnValue(mockProvider as any)
      mockGetModelInstance.mockReturnValue(mockModel as any)
      
      // Mock successful streamText response
      const mockTextStream = {
        getReader: jest.fn().mockReturnValue({
          read: jest.fn()
            .mockResolvedValueOnce({ done: false, value: 'Hello' })
            .mockResolvedValueOnce({ done: true, value: undefined })
        })
      }
      
      mockStreamText.mockResolvedValue({
        textStream: mockTextStream
      } as any)

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'cerebras',
          apiKey: 'test-api-key',
          model: 'llama-3.3-70b',
          test: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.isValid).toBe(true)
      expect(data.model).toBe('llama-3.3-70b')
      expect(data.message).toBe('API key is valid')
    })

    test('should handle different providers', async () => {
      const providers = [
        { provider: 'openai', model: 'gpt-4o' },
        { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' }
      ]

      for (const { provider, model } of providers) {
        const mockModel = { id: model }
        const mockProviderObj = { id: provider, name: provider }
        
        mockGetProvider.mockReturnValue(mockProviderObj as any)
        mockGetModelInstance.mockReturnValue(mockModel as any)
        
        const mockTextStream = {
          getReader: jest.fn().mockReturnValue({
            read: jest.fn()
              .mockResolvedValueOnce({ done: false, value: 'Hello' })
              .mockResolvedValueOnce({ done: true, value: undefined })
          })
        }
        
        mockStreamText.mockResolvedValue({
          textStream: mockTextStream
        } as any)

        const request = new NextRequest('http://localhost:3000/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            provider,
            apiKey: `test-${provider}-key`,
            model,
            test: true
          })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.isValid).toBe(true)
        expect(data.model).toBe(model)
      }
    })
  })

  describe('Validation Failures', () => {
    test('should handle unknown provider', async () => {
      mockGetProvider.mockReturnValue(undefined)

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'unknown-provider',
          apiKey: 'test-key',
          model: 'test-model',
          test: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.isValid).toBe(false)
      expect(data.error).toContain('Unknown provider')
    })

    test('should handle unknown model', async () => {
      const mockProvider = { id: 'cerebras', name: 'Cerebras' }
      mockGetProvider.mockReturnValue(mockProvider as any)
      mockGetModelInstance.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'cerebras',
          apiKey: 'test-key',
          model: 'unknown-model',
          test: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.isValid).toBe(false)
      expect(data.error).toContain('Unknown model')
    })

    test('should handle API errors', async () => {
      const mockProvider = { id: 'cerebras', name: 'Cerebras' }
      const mockModel = { id: 'test-model' }
      
      mockGetProvider.mockReturnValue(mockProvider as any)
      mockGetModelInstance.mockReturnValue(mockModel as any)
      
      // Mock API error
      mockStreamText.mockRejectedValue(new Error('Invalid API key'))

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'cerebras',
          apiKey: 'invalid-key',
          model: 'llama-3.3-70b',
          test: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.isValid).toBe(false)
      expect(data.error).toContain('Invalid API key')
    })

    test('should handle stream reading errors', async () => {
      const mockProvider = { id: 'cerebras', name: 'Cerebras' }
      const mockModel = { id: 'test-model' }
      
      mockGetProvider.mockReturnValue(mockProvider as any)
      mockGetModelInstance.mockReturnValue(mockModel as any)
      
      // Mock stream reading error
      const mockTextStream = {
        getReader: jest.fn().mockReturnValue({
          read: jest.fn().mockRejectedValue(new Error('Stream error'))
        })
      }
      
      mockStreamText.mockResolvedValue({
        textStream: mockTextStream
      } as any)

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'cerebras',
          apiKey: 'test-key',
          model: 'llama-3.3-70b',
          test: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.isValid).toBe(false)
      expect(data.error).toContain('Stream error')
    })
  })

  describe('Request Validation', () => {
    test('should handle missing test flag', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'cerebras',
          apiKey: 'test-key',
          model: 'llama-3.3-70b'
          // Missing test: true
        })
      })

      // Should not call validation, should proceed with normal chat flow
      const response = await POST(request)
      
      // Should return an error since we're not mocking the full chat flow
      expect(response.status).toBe(500)
    })

    test('should handle missing API key in test request', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'cerebras',
          model: 'llama-3.3-70b',
          test: true
          // Missing apiKey
        })
      })

      // Should not call validation, should proceed with normal chat flow
      const response = await POST(request)
      
      // Should return an error since we're not mocking the full chat flow
      expect(response.status).toBe(500)
    })

    test('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: 'invalid-json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })
})
