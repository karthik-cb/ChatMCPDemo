'use client'

import { useState, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { getAllProviders, getProvider } from '@/lib/llm-providers'
import { PerformanceMetrics } from '@/lib/telemetry'
import MessageList from './message-list'
import MessageInput from './message-input'
import ProviderSelector from './provider-selector'
import MetricsPanel from './metrics-panel'

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
  
  const { append, messages, isLoading, status } = useChat({
    id,
    initialMessages: initialMessages as any,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: () => ({
        provider: selectedProvider,
        model: selectedModel,
      }),
    }),
    onData: (data: any) => {
      console.log('Received data:', data)
    },
    onFinish: (message: UIMessage) => {
      console.log('Chat finished:', message)
    },
    onError: (error: unknown) => {
      console.error('Chat error:', error)
    }
  } as any)

  // Debug: Log status changes
  useEffect(() => {
    console.log('Chat status changed:', status)
  }, [status])

  // Debug: Log messages changes
  useEffect(() => {
    console.log('Messages updated:', messages.length, messages)
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      console.log('Last message:', lastMessage)
      if (lastMessage.role === 'assistant') {
        console.log('Assistant message parts:', lastMessage.parts)
      }
    }
  }, [messages])

  // Fetch metrics periodically
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics')
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (input: string) => {
    if (input.trim() && !isLoading) {
      console.log('Sending message:', input)
      console.log('Current status:', status)
      // Use the correct message format for useChat
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

  // Debug: Log messages changes
  useEffect(() => {
    console.log('Messages updated:', messages.length, messages)
  }, [messages])

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
                disabled={isLoading}
              />
              <button
                onClick={handleNewChat}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition-colors"
                disabled={isLoading}
              >
                New Chat
              </button>
              <button
                onClick={handleClearChat}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/80 transition-colors"
                disabled={isLoading}
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
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} isLoading={isLoading} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <MessageInput onSubmit={handleSubmit} disabled={isLoading} />
        </div>
      </div>

      {/* Metrics Panel */}
      {showMetrics && (
        <div className="w-80 border-l border-border bg-card">
          <MetricsPanel metrics={metrics} />
        </div>
      )}
    </div>
  )
}
