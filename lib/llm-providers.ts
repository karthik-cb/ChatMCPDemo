import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { cerebras } from '@ai-sdk/cerebras'

// Helper function to clean JSON schemas for Cerebras compatibility
function cleanSchemaForCerebras(schema: any): any {
  if (!schema || typeof schema !== 'object') return schema
  
  // Remove unsupported top-level keys
  const cleaned = { ...schema }
  delete cleaned.$schema
  delete cleaned.$id
  delete cleaned.title
  delete cleaned.description
  delete cleaned.examples
  delete cleaned.default
  
  // Ensure additionalProperties is false for schemas with required arrays
  if (cleaned.required && Array.isArray(cleaned.required) && cleaned.required.length > 0) {
    cleaned.additionalProperties = false
  }
  
  // Recursively clean nested objects
  if (cleaned.properties) {
    for (const [key, value] of Object.entries(cleaned.properties)) {
      cleaned.properties[key] = cleanSchemaForCerebras(value)
    }
  }
  
  if (cleaned.items) {
    cleaned.items = cleanSchemaForCerebras(cleaned.items)
  }
  
  if (cleaned.anyOf) {
    cleaned.anyOf = cleaned.anyOf.map(cleanSchemaForCerebras)
  }
  
  if (cleaned.allOf) {
    cleaned.allOf = cleaned.allOf.map(cleanSchemaForCerebras)
  }
  
  if (cleaned.oneOf) {
    cleaned.oneOf = cleaned.oneOf.map(cleanSchemaForCerebras)
  }
  
  if (cleaned.$defs) {
    for (const [key, value] of Object.entries(cleaned.$defs)) {
      cleaned.$defs[key] = cleanSchemaForCerebras(value)
    }
  }
  
  return cleaned
}

// Custom Cerebras provider wrapper to handle schema compatibility
function createCerebrasProvider(modelId: string, config: any) {
  return cerebras(modelId)
}

export interface Model {
  id: string
  name: string
  description?: string
}

export interface LLMProvider {
  id: string
  name: string
  description: string
  models: Model[]
  defaultModel: string
  color: string
  icon: string
}

export const llmProviders: Record<string, LLMProvider> = {
  cerebras: {
    id: 'cerebras',
    name: 'Cerebras',
    description: 'Ultra-fast inference with Cerebras models',
    defaultModel: 'llama-3.3-70b',
    models: [
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', description: 'Latest Llama model' },
      { id: 'llama3.1-8b', name: 'Llama 3.1 8B', description: 'Efficient smaller model' },
      { id: 'llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', description: 'Advanced instruction model' },
      { id: 'llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B', description: 'Preview model' },
      { id: 'qwen-3-32b', name: 'Qwen 3 32B', description: 'Multilingual model' },
      { id: 'qwen-3-235b-a22b-instruct-2507', name: 'Qwen 3 235B', description: 'Large preview model' },
      { id: 'qwen-3-235b-a22b-thinking-2507', name: 'Qwen 3 235B Thinking', description: 'Reasoning model' },
      { id: 'qwen-3-coder-480b', name: 'Qwen 3 Coder 480B', description: 'Code generation model' },
      { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', description: 'Open source GPT model' }
    ],
    color: 'bg-purple-500',
    icon: '⚡'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI models for comparison',
    defaultModel: 'gpt-5',
    models: [
      { id: 'gpt-5', name: 'GPT-5', description: 'Latest flagship model' },
      { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Faster, efficient model' },
      { id: 'gpt-5-nano', name: 'GPT-5 Nano', description: 'Ultra-fast, lightweight model' },
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Previous generation flagship' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Previous generation mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Legacy model' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Legacy model' }
    ],
    color: 'bg-green-500',
    icon: '🤖'
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models for comparison',
    defaultModel: 'claude-sonnet-4-5-20250929',
    models: [
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', description: 'Best model for complex agents and coding' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', description: 'Fastest and most intelligent Haiku model' },
      { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', description: 'Exceptional model for specialized complex tasks' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'High-performance model' },
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude Sonnet 3.7', description: 'High-performance with extended thinking' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Previous generation flagship' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Previous generation fast model' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Legacy most capable model' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Legacy balanced model' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Legacy fast model' }
    ],
    color: 'bg-orange-500',
    icon: '🧠'
  }
}

export function getProvider(id: string): LLMProvider | undefined {
  return llmProviders[id]
}

export function getAllProviders(): LLMProvider[] {
  return Object.values(llmProviders)
}

export function getModelInstance(providerId: string, modelId: string, customApiKey?: string) {
  const provider = getProvider(providerId)
  if (!provider) return null
  
  if (providerId === 'cerebras') {
    // Use custom Cerebras provider wrapper for schema compatibility
    const config: any = {
      apiKey: customApiKey || process.env.CEREBRAS_API_KEY,
      // Enable structured outputs for MCP server compatibility
      supportsStructuredOutputs: true
    }
    
    // Special configuration for Qwen thinking models
    if (modelId.includes('thinking')) {
      config.enable_thinking = true
    }
    
    return createCerebrasProvider(modelId, config)
  } else if (providerId === 'openai') {
    return openai(modelId as any, {
      apiKey: customApiKey || process.env.OPENAI_API_KEY
    } as any)
  } else if (providerId === 'anthropic') {
    return anthropic(modelId as any, {
      apiKey: customApiKey || process.env.ANTHROPIC_API_KEY
    } as any)
  }
  
  return null
}
