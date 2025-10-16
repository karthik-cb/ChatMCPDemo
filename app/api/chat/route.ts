import { 
  convertToModelMessages, 
  streamText, 
  generateId,
  createUIMessageStream
} from 'ai'
import type { UIMessage } from 'ai'
import { loadChat, saveChat } from '@/lib/chat-store'
import { mcpTools } from '@/lib/mcp-client'
import { getProvider, getModelInstance } from '@/lib/llm-providers'
import { telemetryCollector } from '@/lib/telemetry'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, id, provider = 'cerebras', model } = body
    
    const startTime = Date.now()
    
    // Debug logging (commented out for production)
    // console.log('Received request body:', body)
    // console.log('Messages:', messages)
    
    // Handle different message formats from useChat
    // Note: messages from useChat already contains the full conversation history
    let messageArray = []
    if (Array.isArray(messages)) {
      messageArray = messages
    } else if (messages && typeof messages === 'object') {
      // Single message object
      messageArray = [messages]
    }
    
    // Use messages directly (they already contain full conversation history)
    const allMessages = messageArray
    
    // Add IDs to messages that don't have them and ensure proper format
    const messagesWithIds = allMessages.map(msg => {
      // Ensure message has proper structure
      const formattedMsg = {
        id: msg.id || generateId(),
        role: msg.role || 'user',
        content: msg.content || '',
        parts: msg.parts || [{ type: 'text', text: msg.content || '' }]
      }
      return formattedMsg
    })
    
    // console.log('Messages with IDs:', messagesWithIds.length, messagesWithIds)
    
    // Skip validation if no messages
    if (messagesWithIds.length === 0) {
      throw new Error('No messages to process')
    }
    
    // Skip validation for now - use messages directly
    const validatedMessages = messagesWithIds
    
    // Get the selected provider and model
    const llmProvider = getProvider(provider)
    if (!llmProvider) {
      throw new Error(`Unknown provider: ${provider}`)
    }
    
    const selectedModel = model || llmProvider.defaultModel
    const modelInstance = getModelInstance(provider, selectedModel)
    if (!modelInstance) {
      throw new Error(`Unknown model: ${selectedModel} for provider: ${provider}`)
    }
    
    // Record telemetry start
    telemetryCollector.recordRequest({
      provider,
      model: llmProvider.name,
      startTime,
    })
    
    console.log('Creating streamText with model:', modelInstance)
    console.log('Validated messages:', validatedMessages.length, validatedMessages)
    
    const result = streamText({
      model: modelInstance as any, // Type assertion to handle union types
      messages: convertToModelMessages(validatedMessages),
      tools: mcpTools,
    })
    
    // Let's also try to see what the result contains
    console.log('StreamText result:', result)
    
    console.log('StreamText created, returning response')
    
    // Let's try toUIMessageStreamResponse instead
    const response = result.toUIMessageStreamResponse()
    console.log('Response created:', response)
    
    return response
    
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
