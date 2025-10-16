'use client'

import { UIMessage } from '@ai-sdk/react'
import { Bot, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageListProps {
  messages: UIMessage[]
  isLoading: boolean
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
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
              {message.parts.map((part, index) => {
                if (part.type === 'text') {
                  return (
                    <p key={index} className="whitespace-pre-wrap">
                      {part.text}
                    </p>
                  )
                }
                if (part.type === 'tool-call') {
                  return (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3 my-2">
                      <div className="text-sm font-medium text-blue-800">
                        🔧 Tool Call: {part.toolName}
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        {JSON.stringify(part.args, null, 2)}
                      </div>
                    </div>
                  )
                }
                if (part.type === 'tool-result') {
                  return (
                    <div key={index} className="bg-green-50 border border-green-200 rounded p-3 my-2">
                      <div className="text-sm font-medium text-green-800">
                        ✅ Tool Result: {part.toolName}
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        {typeof part.result === 'string' 
                          ? part.result 
                          : JSON.stringify(part.result, null, 2)
                        }
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
        </div>
      ))}
      
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
          </div>
        </div>
      )}
    </div>
  )
}
