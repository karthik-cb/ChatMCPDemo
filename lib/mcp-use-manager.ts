import { createSafeLogger } from './safe-logger'

const logger = createSafeLogger('MCP_USE_MANAGER')

/**
 * MCP Use Dynamic Server Selection Manager
 * 
 * This manager implements intelligent server selection based on user queries
 * to prevent context length overflow by only loading relevant MCP servers.
 * 
 * Based on: https://github.com/mcp-use/mcp-use/blob/main/libraries/python/README.md#dynamic-server-selection-server-manager
 */

export interface MCPServerConfig {
  id: string
  name: string
  description: string
  keywords: string[]
  category: 'travel' | 'mapping' | 'accommodation' | 'transport' | 'general'
  enabled: boolean
}

export class MCPUseManager {
  private serverConfigs: MCPServerConfig[] = [
    {
      id: 'ferryhopper',
      name: 'FerryHopper',
      description: 'Ferry routes and booking for European destinations',
      keywords: ['ferry', 'boat', 'island', 'greek', 'greece', 'santorini', 'mykonos', 'port', 'maritime', 'sea travel'],
      category: 'transport',
      enabled: true
    },
    {
      id: 'airbnb',
      name: 'Airbnb',
      description: 'Accommodation search and booking',
      keywords: ['airbnb', 'accommodation', 'hotel', 'stay', 'lodging', 'rental', 'apartment', 'house', 'room'],
      category: 'accommodation',
      enabled: true
    },
    {
      id: 'mapbox',
      name: 'Mapbox',
      description: 'Mapping, routing, and location services',
      keywords: ['map', 'route', 'directions', 'location', 'gas station', 'restaurant', 'nearby', 'distance', 'navigation'],
      category: 'mapping',
      enabled: true
    },
    {
      id: 'kiwi',
      name: 'Kiwi.com',
      description: 'Flight search and booking',
      keywords: ['flight', 'airline', 'airport', 'plane', 'travel', 'booking', 'ticket', 'departure', 'arrival'],
      category: 'travel',
      enabled: true
    },
    {
      id: 'turkish-airlines',
      name: 'Turkish Airlines',
      description: 'Turkish Airlines specific services',
      keywords: ['turkish airlines', 'turkish', 'istanbul', 'turkey'],
      category: 'travel',
      enabled: false // Disabled by default
    }
  ]

  constructor() {
    logger.debug('MCP Use Manager initialized')
  }

  /**
   * Analyze user query to determine which MCP servers are relevant
   */
  private analyzeQuery(query: string): string[] {
    const queryLower = query.toLowerCase()
    const relevantServers: string[] = []

    for (const config of this.serverConfigs) {
      if (!config.enabled) continue

      // Check if any keywords match
      const hasKeywordMatch = config.keywords.some(keyword => 
        queryLower.includes(keyword.toLowerCase())
      )

      if (hasKeywordMatch) {
        relevantServers.push(config.id)
        logger.debug(`Query matches ${config.name}: ${config.keywords.filter(k => queryLower.includes(k.toLowerCase()))}`)
      }
    }

    // If no specific matches, include general travel servers
    if (relevantServers.length === 0) {
      const generalServers = this.serverConfigs
        .filter(config => config.enabled && config.category === 'travel')
        .map(config => config.id)
      relevantServers.push(...generalServers)
      logger.debug('No specific matches, including general travel servers:', generalServers)
    }

    return relevantServers
  }

  /**
   * Get dynamically selected MCP tools based on user query
   */
  async getRelevantTools(query: string, allTools: Record<string, any>): Promise<Record<string, any>> {
    const relevantServerIds = this.analyzeQuery(query)
    logger.debug('Relevant servers for query:', relevantServerIds)

    const relevantTools: Record<string, any> = {}

    // Filter tools based on relevant servers
    for (const [toolName, tool] of Object.entries(allTools)) {
      // Check if this tool belongs to a relevant server
      const isRelevant = relevantServerIds.some(serverId => {
        // Tool naming patterns for different servers
        switch (serverId) {
          case 'ferryhopper':
            return toolName.includes('ferry') || toolName.includes('port') || toolName.includes('route')
          case 'airbnb':
            return toolName.includes('airbnb') || toolName.includes('search') || toolName.includes('listing')
          case 'mapbox':
            return toolName.includes('mapbox') || toolName.includes('directions') || toolName.includes('category')
          case 'kiwi':
            return toolName.includes('kiwi') || toolName.includes('flight') || toolName.includes('airport')
          case 'turkish-airlines':
            return toolName.includes('turkish') || toolName.includes('airline')
          default:
            return false
        }
      })

      if (isRelevant) {
        relevantTools[toolName] = tool
        logger.debug(`Including tool: ${toolName}`)
      }
    }

    logger.debug(`Selected ${Object.keys(relevantTools).length} relevant tools from ${Object.keys(allTools).length} total`)
    return relevantTools
  }

  /**
   * Get context-aware tool selection with size limits
   */
  async getContextAwareTools(
    query: string, 
    allTools: Record<string, any>,
    maxTools: number = 8
  ): Promise<Record<string, any>> {
    const relevantTools = await this.getRelevantTools(query, allTools)
    
    // If we have too many tools, prioritize by relevance score
    if (Object.keys(relevantTools).length > maxTools) {
      const prioritizedTools = this.prioritizeTools(relevantTools, query, maxTools)
      logger.debug(`Prioritized to ${Object.keys(prioritizedTools).length} tools`)
      return prioritizedTools
    }

    return relevantTools
  }

  /**
   * Prioritize tools based on relevance to query
   */
  private prioritizeTools(
    tools: Record<string, any>, 
    query: string, 
    maxTools: number
  ): Record<string, any> {
    const queryLower = query.toLowerCase()
    const toolScores: Array<{ name: string; tool: any; score: number }> = []

    for (const [toolName, tool] of Object.entries(tools)) {
      let score = 0

      // Score based on tool name relevance
      if (queryLower.includes('ferry') && toolName.includes('ferry')) score += 10
      if (queryLower.includes('hotel') && toolName.includes('airbnb')) score += 10
      if (queryLower.includes('map') && toolName.includes('mapbox')) score += 10
      if (queryLower.includes('flight') && toolName.includes('kiwi')) score += 10

      // Score based on tool description
      if (tool.description) {
        const descLower = tool.description.toLowerCase()
        for (const keyword of queryLower.split(' ')) {
          if (descLower.includes(keyword)) score += 2
        }
      }

      toolScores.push({ name: toolName, tool, score })
    }

    // Sort by score and take top tools
    toolScores.sort((a, b) => b.score - a.score)
    const topTools = toolScores.slice(0, maxTools)

    const result: Record<string, any> = {}
    for (const { name, tool } of topTools) {
      result[name] = tool
    }

    return result
  }

  /**
   * Update server configuration
   */
  updateServerConfig(serverId: string, config: Partial<MCPServerConfig>): void {
    const index = this.serverConfigs.findIndex(s => s.id === serverId)
    if (index !== -1) {
      this.serverConfigs[index] = { ...this.serverConfigs[index], ...config }
      logger.debug(`Updated server config for ${serverId}:`, config)
    }
  }

  /**
   * Get current server configurations
   */
  getServerConfigs(): MCPServerConfig[] {
    return [...this.serverConfigs]
  }
}

// Export singleton instance
export const mcpUseManager = new MCPUseManager()
