/**
 * Integration Tests for BYOK System
 * Tests the complete flow from UI to API
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import APIKeyManager from '@/components/api-key-manager'
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

// Mock fetch
global.fetch = jest.fn()

describe('BYOK Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  describe('API Key Manager Component', () => {
    test('should render all providers', () => {
      const mockOnKeysUpdated = jest.fn()
      
      render(<APIKeyManager onKeysUpdated={mockOnKeysUpdated} />)
      
      expect(screen.getByText('Cerebras')).toBeInTheDocument()
      expect(screen.getByText('OpenAI')).toBeInTheDocument()
      expect(screen.getByText('Anthropic')).toBeInTheDocument()
    })

    test('should show security notice', () => {
      const mockOnKeysUpdated = jest.fn()
      
      render(<APIKeyManager onKeysUpdated={mockOnKeysUpdated} />)
      
      expect(screen.getByText('🔒 Your API Keys Are Secure')).toBeInTheDocument()
      expect(screen.getByText(/Your API keys are stored locally in your browser only/)).toBeInTheDocument()
    })

    test('should allow adding API keys', async () => {
      const mockOnKeysUpdated = jest.fn()
      
      render(<APIKeyManager onKeysUpdated={mockOnKeysUpdated} />)
      
      // Find Cerebras input
      const cerebrasInput = screen.getByPlaceholderText('Your Cerebras API key')
      const saveButton = screen.getAllByText('Save API Key')[0] // First provider's save button
      
      fireEvent.change(cerebrasInput, { target: { value: 'test-cerebras-key' } })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockOnKeysUpdated).toHaveBeenCalled()
      })
      
      // Check that key was saved
      const savedKey = apiKeyManager.getAPIKey('cerebras')
      expect(savedKey).toBe('test-cerebras-key')
    })

    test('should show transparency information', async () => {
      const mockOnKeysUpdated = jest.fn()
      
      render(<APIKeyManager onKeysUpdated={mockOnKeysUpdated} />)
      
      // Add a key first
      const cerebrasInput = screen.getByPlaceholderText('Your Cerebras API key')
      const saveButton = screen.getAllByText('Save API Key')[0]
      
      fireEvent.change(cerebrasInput, { target: { value: 'test-key' } })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockOnKeysUpdated).toHaveBeenCalled()
      })
      
      // Show transparency details
      const showDetailsButton = screen.getByText('Show Details')
      fireEvent.click(showDetailsButton)
      
      expect(screen.getByText('Keys stored: 1')).toBeInTheDocument()
      expect(screen.getByText('Providers configured: cerebras')).toBeInTheDocument()
      expect(screen.getByText('Storage location: localStorage (browser only)')).toBeInTheDocument()
    })

    test('should validate API keys', async () => {
      const mockOnKeysUpdated = jest.fn()
      
      // Mock successful validation
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ isValid: true })
      })
      
      render(<APIKeyManager onKeysUpdated={mockOnKeysUpdated} />)
      
      // Add a key
      const cerebrasInput = screen.getByPlaceholderText('Your Cerebras API key')
      const saveButton = screen.getAllByText('Save API Key')[0]
      
      fireEvent.change(cerebrasInput, { target: { value: 'test-key' } })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockOnKeysUpdated).toHaveBeenCalled()
      })
      
      // Validate the key
      const validateButton = screen.getByText('Validate')
      fireEvent.click(validateButton)
      
      await waitFor(() => {
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
    })

    test('should handle validation errors', async () => {
      const mockOnKeysUpdated = jest.fn()
      
      // Mock validation failure
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Invalid API key')
      })
      
      render(<APIKeyManager onKeysUpdated={mockOnKeysUpdated} />)
      
      // Add a key
      const cerebrasInput = screen.getByPlaceholderText('Your Cerebras API key')
      const saveButton = screen.getAllByText('Save API Key')[0]
      
      fireEvent.change(cerebrasInput, { target: { value: 'invalid-key' } })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockOnKeysUpdated).toHaveBeenCalled()
      })
      
      // Validate the key
      const validateButton = screen.getByText('Validate')
      fireEvent.click(validateButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Validation failed/)).toBeInTheDocument()
      })
    })

    test('should allow removing API keys', async () => {
      const mockOnKeysUpdated = jest.fn()
      
      render(<APIKeyManager onKeysUpdated={mockOnKeysUpdated} />)
      
      // Add a key first
      const cerebrasInput = screen.getByPlaceholderText('Your Cerebras API key')
      const saveButton = screen.getAllByText('Save API Key')[0]
      
      fireEvent.change(cerebrasInput, { target: { value: 'test-key' } })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockOnKeysUpdated).toHaveBeenCalled()
      })
      
      // Mock confirm dialog
      window.confirm = jest.fn(() => true)
      
      // Remove the key
      const removeButton = screen.getByText('Remove')
      fireEvent.click(removeButton)
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to remove this API key?')
      
      await waitFor(() => {
        expect(apiKeyManager.getAPIKey('cerebras')).toBeNull()
      })
    })

    test('should toggle key visibility', async () => {
      const mockOnKeysUpdated = jest.fn()
      
      render(<APIKeyManager onKeysUpdated={mockOnKeysUpdated} />)
      
      // Add a key
      const cerebrasInput = screen.getByPlaceholderText('Your Cerebras API key')
      const saveButton = screen.getAllByText('Save API Key')[0]
      
      fireEvent.change(cerebrasInput, { target: { value: 'test-key' } })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockOnKeysUpdated).toHaveBeenCalled()
      })
      
      // Toggle visibility
      const eyeButton = screen.getByRole('button', { name: /eye/i })
      fireEvent.click(eyeButton)
      
      // Should show the actual key
      expect(screen.getByDisplayValue('test-key')).toBeInTheDocument()
    })
  })

  describe('End-to-End Flow', () => {
    test('should complete full BYOK workflow', async () => {
      const mockOnKeysUpdated = jest.fn()
      
      // Mock successful validation
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ isValid: true })
      })
      
      render(<APIKeyManager onKeysUpdated={mockOnKeysUpdated} />)
      
      // 1. Add API key
      const cerebrasInput = screen.getByPlaceholderText('Your Cerebras API key')
      const saveButton = screen.getAllByText('Save API Key')[0]
      
      fireEvent.change(cerebrasInput, { target: { value: 'test-cerebras-key' } })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockOnKeysUpdated).toHaveBeenCalled()
      })
      
      // 2. Validate key
      const validateButton = screen.getByText('Validate')
      fireEvent.click(validateButton)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled()
      })
      
      // 3. Check transparency info
      const showDetailsButton = screen.getByText('Show Details')
      fireEvent.click(showDetailsButton)
      
      expect(screen.getByText('Keys stored: 1')).toBeInTheDocument()
      expect(screen.getByText('Providers configured: cerebras')).toBeInTheDocument()
      
      // 4. Verify key is stored securely
      const storedKey = apiKeyManager.getAPIKey('cerebras')
      expect(storedKey).toBe('test-cerebras-key')
      
      // 5. Verify transparency info is accurate
      const transparencyInfo = apiKeyManager.getTransparencyInfo()
      expect(transparencyInfo.keysStored).toBe(1)
      expect(transparencyInfo.providers).toEqual(['cerebras'])
      expect(transparencyInfo.storageLocation).toBe('localStorage (browser only)')
    })
  })
})
