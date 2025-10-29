'use client'

import { useState, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import type { UIMessage } from 'ai'
import { getAllProviders, getProvider } from '@/lib/llm-providers'
import { PerformanceMetrics } from '@/lib/telemetry'
import MessageList from './message-list'
import MessageInput from './message-input'
import ProviderSelector from './provider-selector'
import MetricsPanel from './metrics-panel'
import EnhancedMetricsPanel from './enhanced-metrics-panel'
import { ThemeToggle } from '@/lib/theme-toggle'
import SettingsPanel from './settings-panel'
import { apiKeyManager, type ProviderConfig } from '@/lib/api-key-manager'

interface ChatInterfaceProps {
  id: string
  initialMessages?: UIMessage[]
}

export default function ChatInterface({ 
  id, 
  initialMessages = [] 
}: ChatInterfaceProps) {
  const [selectedProvider, setSelectedProvider] = useState('cerebras')
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b')
  const [metrics, setMetrics] = useState<Record<string, PerformanceMetrics>>({})
  const [showMetrics, setShowMetrics] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyConfigs, setApiKeyConfigs] = useState<Record<string, ProviderConfig>>({})
  
  const { messages, append, status } = useChat({
    id,
    initialMessages: initialMessages as any,
    api: '/api/chat',
    body: {
      provider: selectedProvider,
      model: selectedModel,
      apiKey: apiKeyConfigs[selectedProvider]?.apiKey ? 
        apiKeyManager.getAPIKey(selectedProvider) : undefined,
    },
    streamProtocol: 'text',
    onFinish: (message: any, options: any) => {
      console.log('Chat finished:', message, options)
    },
    onError: (error: unknown) => {
      console.error('Chat error:', error)
    }
  })


  // Load API key configurations on mount
  useEffect(() => {
    const configs = apiKeyManager.getStoredConfigs()
    setApiKeyConfigs(configs)
  }, [])

  // Fetch metrics periodically
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        } else {
          console.warn('Metrics API not available:', response.status)
        }
      } catch (error) {
        console.warn('Failed to fetch metrics:', error)
        // Don't set metrics on error, just log it
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (input: string) => {
    if (input.trim() && status === 'ready') {
      // Use append with correct message format
      append({ role: 'user', content: input })
    }
  }

  const handleClearChat = async () => {
    if (confirm('Are you sure you want to clear this chat? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/chat/clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        })
        
        if (response.ok) {
          // Reload the page to start fresh
          window.location.reload()
        } else {
          console.error('Failed to clear chat')
        }
      } catch (error) {
        console.error('Error clearing chat:', error)
      }
    }
  }

  const handleNewChat = () => {
    // Navigate to root to create a new chat
    window.location.href = '/'
  }

  const providers = getAllProviders()
  
  // Update selected model when provider changes
  useEffect(() => {
    const provider = getProvider(selectedProvider)
    if (provider) {
      setSelectedModel(provider.defaultModel)
    }
  }, [selectedProvider])


  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chat MCP Demo</h1>
              <p className="text-muted-foreground">
                Fast inference with Cerebras vs other providers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ProviderSelector
                providers={providers}
                selectedProvider={selectedProvider}
                onProviderChange={setSelectedProvider}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                disabled={status !== 'ready'}
              />
              <ThemeToggle />
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                Settings
              </button>
              <button
                onClick={handleNewChat}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition-colors"
                disabled={status !== 'ready'}
              >
                New Chat
              </button>
              <button
                onClick={handleClearChat}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/80 transition-colors"
                disabled={status !== 'ready'}
              >
                Clear Chat
              </button>
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                {showMetrics ? 'Hide' : 'Show'} Metrics
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <MessageList messages={messages} isLoading={status === 'streaming'} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4 bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
          <MessageInput onSubmit={handleSubmit} disabled={status !== 'ready'} />
        </div>
      </div>

      {/* Enhanced Metrics Panel */}
      {showMetrics && (
        <div className="w-96 border-l border-border bg-card">
          <EnhancedMetricsPanel metrics={metrics} />
        </div>
      )}

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onKeysUpdated={setApiKeyConfigs}
        onMCPSettingsUpdated={() => {
          // Force a page refresh to reload MCP tools with new settings
          window.location.reload()
        }}
      />
    </div>
  )
}
