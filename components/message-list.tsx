'use client'

import { Message } from '@ai-sdk/react'
import { Bot, User, Loader2, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { MessageSkeleton, ToolInvocationSkeleton } from '@/components/message-skeleton'
import MCPToolRenderer from '@/components/mcp-tools/mcp-tool-renderer'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Simple scroll detection for the scroll button
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement
    if (!container || messages.length < 2) return
    
    const handleScroll = () => {
      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 200
      setShowScrollButton(!isNearBottom)
    }
    
    container.addEventListener('scroll', handleScroll)
    
    // Check initial state
    const timeoutId = setTimeout(handleScroll, 100)
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [messages.length])

  // Auto-scroll to bottom when new messages arrive (but only if user is near bottom)
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement
    if (!container) return
    
    const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 200
    
    // Only auto-scroll if user is near the bottom (within 200px)
    if (isNearBottom || messages.length <= 1) {
      // Use a small delay to ensure content is rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages, isLoading])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-4 min-h-0 relative h-full" style={{ scrollBehavior: 'smooth' }}>
      {messages && Array.isArray(messages) ? messages.map((message, messageIndex) => (
        <div
          key={message.id}
          className={cn(
            'flex gap-3 p-4 rounded-lg',
            message.role === 'user'
              ? 'bg-primary/10 ml-12'
              : 'bg-muted mr-12'
          )}
        >
          <div className="flex-shrink-0">
            {message.role === 'user' ? (
              <User className="h-6 w-6 text-primary" />
            ) : (
              <Bot className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium">
              {message.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="prose prose-sm max-w-none">
              {message.parts && Array.isArray(message.parts) ? message.parts.map((part, index) => {
                // Create a more unique key using message ID, part type, and index
                const partKey = `${message.id}-${part.type}-${index}`
                
                if (part.type === 'text') {
                  const textContent = typeof part.text === 'string' ? part.text : String(part.text || '')
                  return (
                    <div key={partKey} className="prose prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ children, ...props }) => (
                            <div className="overflow-x-auto">
                              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props}>
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children, ...props }) => (
                            <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
                              {children}
                            </thead>
                          ),
                          tbody: ({ children, ...props }) => (
                            <tbody className="bg-white dark:bg-gray-900" {...props}>
                              {children}
                            </tbody>
                          ),
                          tr: ({ children, ...props }) => (
                            <tr className="border-b border-gray-200 dark:border-gray-700" {...props}>
                              {children}
                            </tr>
                          ),
                          th: ({ children, ...props }) => (
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0" {...props}>
                              {children}
                            </th>
                          ),
                          td: ({ children, ...props }) => (
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0" {...props}>
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {textContent}
                      </ReactMarkdown>
                    </div>
                  )
                }
                if (part.type === 'tool-invocation') {
                  return (
                    <div key={partKey} className="my-3">
                      <MCPToolRenderer 
                        toolInvocation={{
                          toolName: (part as any).toolName || (part as any).toolCallId,
                          args: (part as any).args || (part as any).input,
                          state: 'call'
                        }}
                      />
                    </div>
                  )
                }
                // Tool result handling removed for now due to type issues
                return null
              }) : (
                // Fallback for messages without parts array
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children, ...props }) => (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props}>
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children, ...props }) => (
                        <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
                          {children}
                        </thead>
                      ),
                      tbody: ({ children, ...props }) => (
                        <tbody className="bg-white dark:bg-gray-900" {...props}>
                          {children}
                        </tbody>
                      ),
                      tr: ({ children, ...props }) => (
                        <tr className="border-b border-gray-200 dark:border-gray-700" {...props}>
                          {children}
                        </tr>
                      ),
                      th: ({ children, ...props }) => (
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0" {...props}>
                          {children}
                        </th>
                      ),
                      td: ({ children, ...props }) => (
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0" {...props}>
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {typeof message.content === 'string' ? message.content : String(message.content || 'No content')}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No messages yet
        </div>
      )}
      
      {isLoading && (
        <div className="flex gap-3 p-4 rounded-lg bg-muted mr-12">
          <div className="flex-shrink-0">
            <Bot className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium mb-2">Assistant</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
            <div className="mt-3">
              <MessageSkeleton />
            </div>
          </div>
        </div>
      )}
      
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} className="h-4" />
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-32 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors z-20"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
      
    </div>
  )
}

