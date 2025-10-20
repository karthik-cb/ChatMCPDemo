import { 
  convertToModelMessages, 
  streamText, 
  generateId,
  createUIMessageStream,
  stepCountIs,
  generateText
} from 'ai'
import type { UIMessage } from 'ai'
import { loadChat, saveChat } from '@/lib/chat-store'
import { mcpTools } from '@/lib/mcp-client'
import { ferryhopperMCPTools } from '@/lib/ferryhopper-mcp-client'
import { airbnbMCPTools } from '@/lib/airbnb-mcp-client'
import { getProvider, getModelInstance } from '@/lib/llm-providers'
import { telemetryCollector } from '@/lib/telemetry'
import { createSafeLogger } from '@/lib/safe-logger'

// Create safe logger for this module
const logger = createSafeLogger('CHAT_API')

// Helper function to convert Zod schema to JSON schema
function zodToJsonSchema(zodSchema: any): any {
  if (!zodSchema || typeof zodSchema !== 'object') return zodSchema
  
  // Check if this is a Zod schema object
  if (zodSchema._def && zodSchema.typeName) {
    logger.debug(`Converting Zod schema with typeName: ${zodSchema.typeName}`)
    
    // Use Zod's built-in method to convert to JSON schema
    if (typeof zodSchema._def === 'object' && zodSchema._def.typeName === 'ZodObject') {
      try {
        // Convert Zod object to JSON schema
        const jsonSchema: any = zodSchema._def.shape ? {} : { type: 'object', properties: {}, additionalProperties: false }
        
        if (zodSchema._def.shape) {
          const properties: any = {}
          const required: string[] = []
          
          for (const [key, value] of Object.entries(zodSchema._def.shape)) {
            properties[key] = zodToJsonSchema(value)
            // Check if this field is required (not optional)
            if (value && typeof value === 'object' && '_def' in value && (value as any)._def && (value as any)._def.typeName !== 'ZodOptional') {
              required.push(key)
            }
          }
          
          jsonSchema.type = 'object'
          jsonSchema.properties = properties
          if (required.length > 0) {
            jsonSchema.required = required
            jsonSchema.additionalProperties = false
          }
        }
        
        logger.debug('Converted to JSON schema:', jsonSchema)
        return jsonSchema
      } catch (error) {
        console.error(`🔄 ZOD CONVERSION DEBUG - Error converting Zod schema:`, error)
        // Fallback to basic object schema
        return { type: 'object', properties: {}, additionalProperties: false }
      }
    }
    
    // Handle other Zod types
    switch (zodSchema.typeName) {
      case 'ZodString':
        return { type: 'string' }
      case 'ZodNumber':
        return { type: 'number' }
      case 'ZodBoolean':
        return { type: 'boolean' }
      case 'ZodArray':
        return { 
          type: 'array', 
          items: zodSchema._def.type ? zodToJsonSchema(zodSchema._def.type) : { type: 'string' }
        }
      case 'ZodOptional':
        return zodToJsonSchema(zodSchema._def.innerType)
      default:
        logger.debug(`Unknown Zod type: ${zodSchema.typeName}, falling back to object`)
        return { type: 'object', properties: {}, additionalProperties: false }
    }
  }
  
  return zodSchema
}

// Helper function to clean JSON schemas for Cerebras compatibility
function cleanSchemaForCerebras(schema: any, debugName = 'schema'): any {
  if (!schema || typeof schema !== 'object') return schema
  
  logger.debug(`Schema cleaning input ${debugName}:`, schema)
  
  // First convert Zod schema to JSON schema if needed
  const jsonSchema = zodToJsonSchema(schema)
  
  // Remove unsupported top-level keys
  const cleaned = { ...jsonSchema }
  const removedKeys = []
  
  if ('$schema' in cleaned) { delete cleaned.$schema; removedKeys.push('$schema') }
  if ('$id' in cleaned) { delete cleaned.$id; removedKeys.push('$id') }
  if ('title' in cleaned) { delete cleaned.title; removedKeys.push('title') }
  if ('description' in cleaned) { delete cleaned.description; removedKeys.push('description') }
  if ('examples' in cleaned) { delete cleaned.examples; removedKeys.push('examples') }
  if ('default' in cleaned) { delete cleaned.default; removedKeys.push('default') }
  
  if (removedKeys.length > 0) {
    logger.debug(`Removed keys from ${debugName}:`, removedKeys)
  }
  
  // Ensure additionalProperties is false for schemas with required arrays
  if (cleaned.required && Array.isArray(cleaned.required) && cleaned.required.length > 0) {
    cleaned.additionalProperties = false
    logger.debug(`Set additionalProperties=false for ${debugName}`)
  }
  
  // Recursively clean nested objects
  if (cleaned.properties) {
    for (const [key, value] of Object.entries(cleaned.properties)) {
      cleaned.properties[key] = cleanSchemaForCerebras(value, `${debugName}.properties.${key}`)
    }
  }
  
  if (cleaned.items) {
    cleaned.items = cleanSchemaForCerebras(cleaned.items, `${debugName}.items`)
  }
  
  if (cleaned.anyOf) {
    cleaned.anyOf = cleaned.anyOf.map((item: any, index: number) => cleanSchemaForCerebras(item, `${debugName}.anyOf[${index}]`))
  }
  
  if (cleaned.allOf) {
    cleaned.allOf = cleaned.allOf.map((item: any, index: number) => cleanSchemaForCerebras(item, `${debugName}.allOf[${index}]`))
  }
  
  if (cleaned.oneOf) {
    cleaned.oneOf = cleaned.oneOf.map((item: any, index: number) => cleanSchemaForCerebras(item, `${debugName}.oneOf[${index}]`))
  }
  
  if (cleaned.$defs) {
    for (const [key, value] of Object.entries(cleaned.$defs)) {
      cleaned.$defs[key] = cleanSchemaForCerebras(value, `${debugName}.$defs.${key}`)
    }
  }
  
  logger.debug(`Schema cleaning output ${debugName}:`, cleaned)
  
  return cleaned
}

// Handle API key validation requests
async function handleAPIKeyValidation(provider: string, apiKey: string, model: string) {
  try {
    // Create a temporary model instance with the provided API key
    const tempModel = getModelInstance(provider, model, apiKey)
    
    if (!tempModel) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          error: `Unknown model: ${model} for provider: ${provider}` 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Make a minimal test request
    const result = await streamText({
      model: tempModel as any,
      messages: [{ role: 'user', content: 'Hello' }],
    })

    // Consume the stream to complete the request
    const reader = result.textStream.getReader()
    let response = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      response += value
    }

    return new Response(
      JSON.stringify({ 
        isValid: true,
        model: model,
        message: 'API key is valid'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('API key validation error:', error)
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Received request body:', body)
    const { messages, id, provider = 'cerebras', model, apiKey, test } = body
    console.log('Extracted provider:', provider, 'model:', model, 'test:', test)
    
    // Handle API key validation requests
    if (test && apiKey) {
      return handleAPIKeyValidation(provider, apiKey, model)
    }
    
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
    const modelInstance = getModelInstance(provider, selectedModel, apiKey)
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
    
    // Include tools for providers that support them
    // Combine travel tools (mock) with Ferryhopper MCP tools (real) and Airbnb MCP tools (real)
    const allTools = {
      ...mcpTools,
      ...ferryhopperMCPTools,
      ...airbnbMCPTools
    }
    
    let tools = (provider === 'openai' || provider === 'anthropic' || provider === 'cerebras') ? allTools : undefined
    
    // Clean tool schemas for Cerebras compatibility
    if (tools && provider === 'cerebras') {
      logger.debug('Original tools:', tools)
      const cleanedTools: any = {}
      for (const [toolName, tool] of Object.entries(tools)) {
        logger.debug(`Processing tool: ${toolName}`)
        if (tool && typeof tool === 'object' && 'parameters' in tool) {
          logger.debug(`Original parameters for ${toolName}:`, tool.parameters)
          // Clean the parameters schema
          const cleanedParameters = cleanSchemaForCerebras(tool.parameters, `tool.${toolName}.parameters`)
          
          // Create the tool in the format expected by Cerebras
          const cleanedTool = {
            type: "function",
            function: {
              name: toolName,
              description: tool.description || `Tool: ${toolName}`,
              parameters: cleanedParameters,
              // Add strict: true as required by Cerebras tool use
              strict: true
            }
          }
          logger.debug(`Cleaned tool ${toolName}:`, cleanedTool)
          cleanedTools[toolName] = cleanedTool
        } else {
          logger.debug(`Tool ${toolName} has no parameters, keeping as-is`)
          cleanedTools[toolName] = tool
        }
      }
      // Convert the cleaned tools object to an array format for the AI SDK
      // But we need to preserve the tool names, so we'll create a proper tools array
      const toolsArray = Object.entries(cleanedTools).map(([toolName, tool]) => tool)
      tools = toolsArray as any
      logger.debug('Final cleaned tools array:', tools)
    }
    
    console.log('Using tools for provider:', provider, tools ? 'Yes' : 'No')
    if (tools) {
      console.log('Available tools:', Object.keys(tools))
    }
    
    // Debug: Log the exact request being sent to Cerebras
    if (provider === 'cerebras') {
      logger.debug('Model instance:', modelInstance)
      logger.debug('Messages:', convertToModelMessages(validatedMessages))
      if (tools) {
        logger.debug('Tools:', tools)
        // Log each tool's schema in detail
        Object.entries(tools).forEach(([toolName, tool]) => {
          logger.debug(`Tool ${toolName}:`, tool)
        })
      }
      
      // Add fetch interceptor to capture the actual HTTP request
      const originalFetch = global.fetch
      global.fetch = async (url, options) => {
        if (typeof url === 'string' && url.includes('cerebras.ai')) {
          logger.debug('HTTP URL:', url)
          logger.debug('HTTP Options:', options)
          if (options?.body) {
            try {
              const bodyObj = JSON.parse(options.body as string)
              logger.debug('Request Body:', bodyObj)
              if (bodyObj.tools) {
                logger.debug('Tools in request:', bodyObj.tools)
                bodyObj.tools.forEach((tool: any, index: number) => {
                  logger.debug(`Tool ${index}:`, tool)
                  if (tool.function?.parameters) {
                    logger.debug(`Tool ${index} parameters:`, tool.function.parameters)
                  }
                })
              }
            } catch (e) {
              logger.debug('Could not parse body:', options.body)
            }
          }
        }
        return originalFetch(url, options)
      }
    }

    // Configure streaming based on provider and tool usage
    const shouldStream = !(provider === 'cerebras' && tools)
    logger.debug(`Provider: ${provider}, Has tools: ${!!tools}, Should stream: ${shouldStream}`)

    // For Cerebras with tools, implement multi-turn tool use pattern
    if (provider === 'cerebras' && tools) {
      logger.debug('Using multi-turn tool use pattern')
      
      // Create a registry of available functions for tool execution
      const availableFunctions: Record<string, any> = {}
      for (const [toolName, tool] of Object.entries(allTools)) {
        if (tool && typeof tool === 'object' && 'execute' in tool) {
          availableFunctions[toolName] = tool
        }
      }
      
      logger.debug('Available functions:', Object.keys(availableFunctions))
      
      // Start with the initial messages
      let messages = convertToModelMessages(validatedMessages)
      let responseText = ''
      
      // Multi-turn tool use loop as per Cerebras documentation
      while (true) {
        logger.debug('Making API call with messages:', messages)
        
        const resp = await generateText({
          model: modelInstance as any,
          messages,
          tools,
          maxOutputTokens: 40960,
        })
        
        logger.debug('API response:', resp)
        
        // If the assistant didn't ask for a tool, we're done
        if (!resp.toolCalls || resp.toolCalls.length === 0) {
          logger.debug('No tool calls, final response')
          responseText = resp.text || ''
          break
        }
        
        // Save the assistant turn exactly as returned
        messages.push({
          role: 'assistant',
          content: resp.content as any
        })
        
        // Execute all tool calls
        for (const toolCall of resp.toolCalls) {
          logger.debug(`Executing tool - ${toolCall.toolName}:`, toolCall.input)
          
          try {
            const fname = toolCall.toolName
            
            if (!(fname in availableFunctions)) {
              logger.debug(`Tool not found - ${fname}`)
              // Feed error back to model
              messages.push({
                role: 'tool',
                toolCallId: toolCall.toolCallId,
                content: JSON.stringify({ error: `Unknown tool requested: ${fname}` })
              } as any)
              continue
            }
            
            // Execute the tool
            const argsDict = toolCall.input
            const output = await availableFunctions[fname].execute(argsDict)
            
            logger.debug(`Tool result - ${fname}:`, output)
            
            // Feed the tool result back
            messages.push({
              role: 'tool',
              toolCallId: toolCall.toolCallId,
              content: JSON.stringify(output)
            } as any)
            
          } catch (error) {
            logger.error(`Tool error - ${toolCall.toolName}:`, error)
            messages.push({
              role: 'tool',
              toolCallId: toolCall.toolCallId,
              content: JSON.stringify({ error: error instanceof Error ? error.message : String(error) })
            } as any)
          }
        }
      }
      
      // Convert the result to a stream for consistency
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(responseText))
          controller.close()
        }
      })

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }

    const result = streamText({
      model: modelInstance as any, // Type assertion to handle union types
      messages: convertToModelMessages(validatedMessages),
      ...(tools && { tools }),
      maxOutputTokens: 40960,
      // enable multi-step tool usage and follow-ups
      stopWhen: stepCountIs(5),
      onFinish: async (message: any) => {
        // Complete telemetry recording
        const endTime = Date.now()
        const latency = endTime - startTime
        
        // Get usage from the result
        const finalResult = await result
        const usage = await finalResult.usage
        
        telemetryCollector.recordRequest({
          provider,
          model: llmProvider.name,
          startTime,
          endTime,
          latency,
          tokensUsed: usage?.totalTokens,
          toolCalls: message.toolCalls?.length || 0,
        })
        
        // Save updated messages to chat store
        const updatedMessages = [...validatedMessages, message]
        await saveChat({ chatId: id, messages: updatedMessages })
      },
    })
    
    console.log('StreamText created, returning response')
    
    const response = result.toTextStreamResponse()
    console.log('Response created:', response)
    
    return response
    
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Check if it's a context length error and provide helpful message as a stream
    if (error instanceof Error && error.message.includes('context_length_exceeded')) {
      const errorMessage = '⚠️ **Context Length Exceeded**\n\nThe conversation has become too long for the model to process (225,510 characters vs 131,000 limit).\n\n**Please try:**\n- Asking a shorter, more focused question\n- Starting a new conversation\n- Simplifying your query\n\nThis helps ensure the model can provide accurate responses within its context limits.'
      
      const encoder = new TextEncoder()
      const errorStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(errorMessage))
          controller.close()
        }
      })
      
      return new Response(errorStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }
    
    // For other errors, return a generic error message as a stream
    const errorMessage = '❌ **Error occurred**\n\nSomething went wrong while processing your request. Please try again.'
    const encoder = new TextEncoder()
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(errorMessage))
        controller.close()
      }
    })
    
    return new Response(errorStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}
