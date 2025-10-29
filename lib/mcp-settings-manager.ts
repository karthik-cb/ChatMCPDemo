/**
 * MCP Settings Manager
 * Manages which MCP servers are enabled/disabled
 */

export interface MCPServerSettings {
  id: string
  name: string
  enabled: boolean
  category: 'travel' | 'productivity' | 'generic'
}

export interface MCPSettings {
  servers: Record<string, MCPServerSettings>
  lastUpdated: string
}

const DEFAULT_MCP_SERVERS: Record<string, MCPServerSettings> = {
  'turkish-airlines': {
    id: 'turkish-airlines',
    name: 'Turkish Airlines MCP',
    enabled: false,
    category: 'travel'
  },
  'expedia': {
    id: 'expedia',
    name: 'Expedia Travel Recommendations',
    enabled: true,
    category: 'travel'
  },
  'ferryhopper': {
    id: 'ferryhopper',
    name: 'Ferryhopper Ferry Routes',
    enabled: true,
    category: 'travel'
  },
  'airbnb': {
    id: 'airbnb',
    name: 'Airbnb Listings',
    enabled: true,
    category: 'travel'
  },
  'kiwi': {
    id: 'kiwi',
    name: 'Kiwi.com Flight Search',
    enabled: true,
    category: 'travel'
  },
  'mapbox': {
    id: 'mapbox',
    name: 'Mapbox Geospatial Services',
    enabled: true,
    category: 'travel'
  }
}

class MCPSettingsManager {
  private settings: MCPSettings

  constructor() {
    this.settings = this.loadSettings()
  }

  private loadSettings(): MCPSettings {
    if (typeof window === 'undefined') {
      // Server-side: return default settings
      return {
        servers: DEFAULT_MCP_SERVERS,
        lastUpdated: new Date().toISOString()
      }
    }

    try {
      const stored = localStorage.getItem('mcp-settings')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to ensure all servers are present
        const mergedServers = { ...DEFAULT_MCP_SERVERS, ...parsed.servers }
        return {
          servers: mergedServers,
          lastUpdated: parsed.lastUpdated || new Date().toISOString()
        }
      }
    } catch (error) {
      console.warn('Failed to load MCP settings:', error)
    }

    return {
      servers: DEFAULT_MCP_SERVERS,
      lastUpdated: new Date().toISOString()
    }
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('mcp-settings', JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Failed to save MCP settings:', error)
    }
  }

  getSettings(): MCPSettings {
    return { ...this.settings }
  }

  getServerSettings(serverId: string): MCPServerSettings | undefined {
    return this.settings.servers[serverId]
  }

  isServerEnabled(serverId: string): boolean {
    const server = this.settings.servers[serverId]
    return server ? server.enabled : true // Default to enabled if not found
  }

  setServerEnabled(serverId: string, enabled: boolean): void {
    if (this.settings.servers[serverId]) {
      this.settings.servers[serverId].enabled = enabled
      this.settings.lastUpdated = new Date().toISOString()
      this.saveSettings()
    }
  }

  toggleServer(serverId: string): boolean {
    const currentState = this.isServerEnabled(serverId)
    this.setServerEnabled(serverId, !currentState)
    return !currentState
  }

  getEnabledServers(): string[] {
    return Object.entries(this.settings.servers)
      .filter(([_, server]) => server.enabled)
      .map(([id, _]) => id)
  }

  getDisabledServers(): string[] {
    return Object.entries(this.settings.servers)
      .filter(([_, server]) => !server.enabled)
      .map(([id, _]) => id)
  }

  resetToDefaults(): void {
    this.settings = {
      servers: { ...DEFAULT_MCP_SERVERS },
      lastUpdated: new Date().toISOString()
    }
    this.saveSettings()
  }

  // Get server settings for UI display
  getAllServerSettings(): MCPServerSettings[] {
    return Object.values(this.settings.servers)
  }

  // Get settings by category
  getServersByCategory(category: string): MCPServerSettings[] {
    return Object.values(this.settings.servers)
      .filter(server => server.category === category)
  }

  // Get enabled servers by category
  getEnabledServersByCategory(category: string): string[] {
    return Object.entries(this.settings.servers)
      .filter(([_, server]) => server.enabled && server.category === category)
      .map(([id, _]) => id)
  }
}

// Create singleton instance
export const mcpSettingsManager = new MCPSettingsManager()

// Export types and manager
export { mcpSettingsManager as default }
