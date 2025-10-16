'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSubmit: (message: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSubmit, disabled }: MessageInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSubmit(input.trim())
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about travel recommendations, hotels, or activities..."
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 pr-12 border border-input rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-background text-foreground'
          )}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}
