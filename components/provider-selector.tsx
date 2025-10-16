'use client'

import { LLMProvider } from '@/lib/llm-providers'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface ProviderSelectorProps {
  providers: LLMProvider[]
  selectedProvider: string
  onProviderChange: (provider: string) => void
  selectedModel: string
  onModelChange: (model: string) => void
  disabled?: boolean
}

export default function ProviderSelector({
  providers,
  selectedProvider,
  onProviderChange,
  selectedModel,
  onModelChange,
  disabled
}: ProviderSelectorProps) {
  const currentProvider = providers.find(p => p.id === selectedProvider)
  
  return (
    <div className="flex gap-2">
      {/* Provider Selection */}
      {providers.map((provider) => (
        <button
          key={provider.id}
          onClick={() => onProviderChange(provider.id)}
          disabled={disabled}
          className={cn(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            'border border-border',
            selectedProvider === provider.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground hover:bg-muted',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title={provider.description}
        >
          <span className="mr-1">{provider.icon}</span>
          {provider.name}
        </button>
      ))}
      
      {/* Model Selection */}
      {currentProvider && (
        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            disabled={disabled}
            className={cn(
              'px-3 py-2 pr-8 rounded-md text-sm font-medium transition-colors',
              'border border-border bg-background text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'appearance-none cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {currentProvider.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      )}
    </div>
  )
}
