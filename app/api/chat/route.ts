import { 
  convertToModelMessages, 
  streamText, 
  generateId,
  createUIMessageStream,
  stepCountIs,
  generateText,
  dynamicTool
} from 'ai'
import type { UIMessage } from 'ai'
import { loadChat, saveChat } from '@/lib/chat-store'
import { getCurrentMCPTools } from '@/lib/mcp-client'
import { ferryhopperMCPTools } from '@/lib/ferryhopper-mcp-client'
import { airbnbMCPTools } from '@/lib/airbnb-mcp-client'
import { turkishAirlinesMCPTools } from '@/lib/turkish-airlines-mcp-client'
import { kiwiMCPTools } from '@/lib/kiwi-mcp-client'
import { mapboxMCPTools } from '@/lib/mapbox-mcp-client'
import { getProvider, getModelInstance } from '@/lib/llm-providers'
import { telemetryCollector } from '@/lib/telemetry'
import { getAITracer } from '@/lib/ai-otel'
import { createSafeLogger } from '@/lib/safe-logger'
import { mcpUseManager } from '@/lib/mcp-use-manager'

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
  
  // Remove unsupported top-level keys (but keep description for tools)
  const cleaned = { ...jsonSchema }
  const removedKeys = []
  
  if ('$schema' in cleaned) { delete cleaned.$schema; removedKeys.push('$schema') }
  if ('$id' in cleaned) { delete cleaned.$id; removedKeys.push('$id') }
  if ('title' in cleaned) { delete cleaned.title; removedKeys.push('title') }
  // Keep description for tool parameters - it's important for AI understanding
  // if ('description' in cleaned) { delete cleaned.description; removedKeys.push('description') }
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
    // Get current enabled MCP tools dynamically
    const currentMCPTools = getCurrentMCPTools()
    
    // Build all available tools first
    const allAvailableTools: any = {}
    
    // Add travel recommendation tool
    if (currentMCPTools.travelRecommendation) {
      allAvailableTools.travelRecommendation = currentMCPTools.travelRecommendation
    }
    
    // Add enabled MCP server tools
    if (currentMCPTools.ferryhopper) {
      Object.assign(allAvailableTools, ferryhopperMCPTools)
    }
    
    if (currentMCPTools.airbnb) {
      Object.assign(allAvailableTools, airbnbMCPTools)
    }
    
    if (currentMCPTools.kiwi) {
      Object.assign(allAvailableTools, kiwiMCPTools)
    }
    
    if (currentMCPTools.mapbox) {
      Object.assign(allAvailableTools, mapboxMCPTools)
    }
    
    // Only include Turkish Airlines tools if enabled
    if (currentMCPTools.turkishAirlines) {
      Object.assign(allAvailableTools, turkishAirlinesMCPTools)
    }

    // Use MCP Use Dynamic Server Selection to prevent context overflow
    const userQuery = validatedMessages[validatedMessages.length - 1]?.content || ''
    const queryText = typeof userQuery === 'string' ? userQuery : JSON.stringify(userQuery)
    
    logger.debug('User query for tool selection:', queryText)
    logger.debug('Total available tools:', Object.keys(allAvailableTools).length)
    
    // Get context-aware tool selection (max 8 tools to prevent context overflow)
    const allTools = await mcpUseManager.getContextAwareTools(queryText, allAvailableTools, 8)
    
    logger.debug('Selected tools for this query:', Object.keys(allTools))
    
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
              description: (tool as any).description || `Tool: ${toolName}`,
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
      // Keep tools as an object - the AI SDK expects tool names as keys
      tools = cleanedTools
      logger.debug('Final cleaned tools object:', tools)
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

    // For Cerebras with tools, use AI SDK's built-in multi-step tool calling
    if (provider === 'cerebras' && tools) {
      logger.debug('Using AI SDK multi-step tool calling with dynamicTool')
      
      // Convert MCP tools to dynamicTool format for better MCP integration
      const dynamicTools: Record<string, any> = {}
      for (const [toolName, tool] of Object.entries(allTools)) {
        if (tool && typeof tool === 'object' && 'execute' in tool && 'parameters' in tool) {
          dynamicTools[toolName] = dynamicTool({
            description: (tool as any).description || `Execute ${toolName}`,
            inputSchema: (tool as any).parameters,
            execute: async (args: any) => {
              logger.debug(`Executing dynamic tool - ${toolName}:`, args)
              try {
                const result = await (tool as any).execute(args)
                logger.debug(`Dynamic tool result - ${toolName}:`, result)
                return result
              } catch (error) {
                logger.error(`Dynamic tool error - ${toolName}:`, error)
                throw error
              }
            }
          })
        }
      }
      
      logger.debug('Dynamic tools created:', Object.keys(dynamicTools))
      
      // System prompt for better tool selection
      const systemPrompt = `You are a helpful travel assistant with access to various MCP (Model Context Protocol) tools for travel planning.

Available tool categories:
- **Mapbox**: For mapping, routing, and location services (mapbox_static_image, mapbox_directions, mapbox_category_search, mapbox_reverse_geocoding, mapbox_matrix, mapbox_isochrone, mapbox_search_geocode)
- **Kiwi.com**: For flight search and booking (kiwi_search_flights, kiwi_get_flight_details, kiwi_search_airports, kiwi_get_cheapest_destinations)
- **FerryHopper**: For ferry routes and booking (getPorts, getRoutes, getSchedules, bookFerry)
- **Airbnb**: For accommodation search (airbnb_search_listings, airbnb_get_listing_details)
- **Turkish Airlines**: For Turkish Airlines specific services (if enabled)
- **Expedia**: For general travel recommendations (travelRecommendation)

When users ask about:
- **Gas stations along routes**: Use mapbox_directions to get the route, then mapbox_category_search with category "gas_station" along the route
- **Maps and locations**: Use mapbox_static_image, mapbox_directions, or mapbox_category_search
- **Flights**: Use kiwi_search_flights or kiwi_get_flight_details
- **Ferries**: Use FerryHopper tools
- **Accommodation**: Use Airbnb tools
- **General travel**: Use Expedia travelRecommendation

Always use the exact tool names provided. Never use generic tool names like "0" or "search".`

      // Track successful results and failed tools for synthesis
      let successfulResults: any[] = []
      let failedTools: string[] = []
      
      // Use AI SDK's built-in multi-step calling with proper structure
      const result = await generateText({
        model: modelInstance as any,
        system: systemPrompt,
        messages: validatedMessages,
        tools: dynamicTools,
        maxOutputTokens: 40960,
        stopWhen: stepCountIs(4), // Conservative limit for travel planning
        onStepFinish: ({ text, toolCalls, toolResults, finishReason, usage }) => {
          logger.debug('Step finished:', { 
            text: text?.substring(0, 100) + '...', 
            toolCalls: toolCalls?.length, 
            toolResults: toolResults?.length, 
            finishReason
          })
          
          // Track successful and failed tools for synthesis
          if (toolResults) {
            toolResults.forEach((result: any, index: number) => {
              const toolCall = toolCalls?.[index]
              if (toolCall) {
                if (result && !result.isError) {
                  successfulResults.push({
                    toolName: toolCall.toolName,
                    result: result,
                    step: successfulResults.length + 1
                  })
                  logger.debug(`✅ Tool ${toolCall.toolName} succeeded`)
                } else {
                  failedTools.push(toolCall.toolName)
                  logger.debug(`❌ Tool ${toolCall.toolName} failed:`, result)
                }
              }
            })
          }
        }
      })
      
      logger.debug('Multi-step result:', result)
      let responseText = result.text || ''
      
      // If we have successful results but no final text, provide synthesis
      if (successfulResults.length > 0 && !responseText) {
        try {
          const synthesisPrompt = `Based on the successful tool results below, provide a comprehensive summary for the user. 
          
Successful results:
${successfulResults.map(r => `- ${r.toolName}: ${JSON.stringify(r.result)}`).join('\n')}

${failedTools.length > 0 ? `\nNote: Some tools failed (${failedTools.join(', ')}) but focus on the successful results.` : ''}

Provide a helpful, actionable response based on the available data.`
          
          const synthesisResult = await generateText({
            model: modelInstance as any,
            messages: [
              { role: 'system' as const, content: synthesisPrompt },
              { role: 'user' as const, content: 'Please synthesize the results and provide a helpful response.' }
            ],
            maxOutputTokens: 40960,
          })
          
          responseText = synthesisResult.text || 'I found some information for you, but some tools encountered issues.'
          
        } catch (error) {
          logger.error('Synthesis error:', error)
          responseText = `I found ${successfulResults.length} successful result(s) but encountered some issues. Here's what I found: ${successfulResults.map(r => r.toolName).join(', ')}`
        }
      }
      
      logger.debug('Multi-step completed:', { 
        steps: result.steps?.length || 0, 
        successful: successfulResults.length, 
        failed: failedTools.length 
      })
      
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

    // For streaming providers, also use dynamicTool for better MCP integration
    let finalTools = tools
    if (tools) {
      logger.debug('Converting tools to dynamicTool format for streaming')
      const dynamicTools: Record<string, any> = {}
      for (const [toolName, tool] of Object.entries(allTools)) {
        if (tool && typeof tool === 'object' && 'execute' in tool && 'parameters' in tool) {
          dynamicTools[toolName] = dynamicTool({
            description: (tool as any).description || `Execute ${toolName}`,
            inputSchema: (tool as any).parameters,
            execute: async (args: any) => {
              logger.debug(`Executing streaming dynamic tool - ${toolName}:`, args)
              try {
                const result = await (tool as any).execute(args)
                logger.debug(`Streaming dynamic tool result - ${toolName}:`, result)
                return result
              } catch (error) {
                logger.error(`Streaming dynamic tool error - ${toolName}:`, error)
                throw error
              }
            }
          })
        }
      }
      finalTools = dynamicTools
    }

    // System prompt for better tool selection
    const systemPrompt = `You are a helpful travel assistant with access to various MCP (Model Context Protocol) tools for travel planning.

Available tool categories:
- **Mapbox**: For mapping, routing, and location services (mapbox_static_image, mapbox_directions, mapbox_category_search, mapbox_reverse_geocoding, mapbox_matrix, mapbox_isochrone, mapbox_search_geocode)
- **Kiwi.com**: For flight search and booking (kiwi_search_flights, kiwi_get_flight_details, kiwi_search_airports, kiwi_get_cheapest_destinations)
- **FerryHopper**: For ferry routes and booking (getPorts, getRoutes, getSchedules, bookFerry)
- **Airbnb**: For accommodation search (airbnb_search_listings, airbnb_get_listing_details)
- **Turkish Airlines**: For Turkish Airlines specific services (if enabled)
- **Expedia**: For general travel recommendations (travelRecommendation)

When users ask about:
- **Gas stations along routes**: Use mapbox_directions to get the route, then mapbox_category_search with category "gas_station" along the route
- **Maps and locations**: Use mapbox_static_image, mapbox_directions, or mapbox_category_search
- **Flights**: Use kiwi_search_flights or kiwi_get_flight_details
- **Ferries**: Use FerryHopper tools
- **Accommodation**: Use Airbnb tools
- **General travel**: Use Expedia travelRecommendation

Always use the exact tool names provided. Never use generic tool names like "0" or "search".`

    // Convert messages first, then add system prompt
    const convertedMessages = convertToModelMessages(validatedMessages)
    const messagesWithSystem = [
      { role: 'system' as const, content: systemPrompt },
      ...convertedMessages
    ]

    // Use proven stepCountIs approach for streaming providers too
    const customStopWhenStreaming = stepCountIs(4) // Conservative limit for travel planning

    const tracer = getAITracer()
    const result = streamText({
      model: modelInstance as any, // Type assertion to handle union types
      messages: messagesWithSystem,
      ...(finalTools && { tools: finalTools }),
      maxOutputTokens: 40960,
      // enable multi-step tool usage and follow-ups with custom stopping logic
      stopWhen: customStopWhenStreaming,
      // Enable OpenTelemetry via AI SDK experimental telemetry to capture spans and usage
      experimental_telemetry: {
        isEnabled: true,
        functionId: `chat:${provider}:${selectedModel}`,
        metadata: {
          hasTools: Boolean(finalTools),
        },
        // Avoid recording full inputs/outputs for privacy; spans still capture timing/usage
        recordInputs: false,
        recordOutputs: false,
        tracer,
      },
      onFinish: async (message: any) => {
        // Spans will be exported via OpenTelemetry exporter; only persist chat
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
