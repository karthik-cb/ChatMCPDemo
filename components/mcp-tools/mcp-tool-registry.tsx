/**
 * MCP Tool Registry
 * Central registry for all MCP tool components and their configurations
 */

import { ComponentType } from 'react'

export interface MCPTool {
  id: string
  name: string
  description: string
  server: string
  schema: any
  category: 'travel' | 'productivity' | 'generic'
}

export interface MCPToolInvocation {
  toolName: string
  args: Record<string, any>
  result?: any
  state: 'call' | 'result'
}

// Tool Registry - easily extensible for new MCP servers
export const mcpToolRegistry: Record<string, MCPTool> = {
  // Ferryhopper MCP Tools
  'getPorts': {
    id: 'getPorts',
    name: 'Get Ports',
    description: 'Get a list of global ferry ports and their details',
    server: 'ferryhopper',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for ports (optional)' }
      }
    },
    category: 'travel'
  },

  'searchTrips': {
    id: 'searchTrips',
    name: 'Search Ferry Trips',
    description: 'Search for available ferry trips between two ports on a specific date',
    server: 'ferryhopper',
    schema: {
      type: 'object',
      properties: {
        departurePort: { type: 'string', description: 'Departure port name or code' },
        arrivalPort: { type: 'string', description: 'Arrival port name or code' },
        date: { type: 'string', description: 'Travel date in YYYY-MM-DD format' }
      },
      required: ['departurePort', 'arrivalPort', 'date']
    },
    category: 'travel'
  },

  'redirectToBooking': {
    id: 'redirectToBooking',
    name: 'Redirect to Booking',
    description: 'Get a redirection URL to Ferryhopper booking page',
    server: 'ferryhopper',
    schema: {
      type: 'object',
      properties: {
        departurePort: { type: 'string', description: 'Departure port name' },
        arrivalPort: { type: 'string', description: 'Arrival port name' },
        ownerCompany: { type: 'string', description: 'Ferry company name' },
        departureDateTime: { type: 'string', description: 'Departure date and time' },
        arrivalDateTime: { type: 'string', description: 'Arrival date and time' },
        vesselID: { type: 'string', description: 'Vessel identifier' }
      },
      required: ['departurePort', 'arrivalPort', 'ownerCompany', 'departureDateTime', 'arrivalDateTime', 'vesselID']
    },
    category: 'travel'
  },

  // Airbnb MCP Tools
  'airbnb.search': {
    id: 'airbnb.search',
    name: 'Airbnb Search',
    description: 'Search for Airbnb listings with comprehensive filtering options',
    server: 'airbnb',
    schema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'Location to search (e.g., "San Francisco, CA")' },
        placeId: { type: 'string', description: 'Google Maps Place ID (overrides location)' },
        checkin: { type: 'string', description: 'Check-in date in YYYY-MM-DD format' },
        checkout: { type: 'string', description: 'Check-out date in YYYY-MM-DD format' },
        adults: { type: 'number', description: 'Number of adults (default: 1)' },
        children: { type: 'number', description: 'Number of children (default: 0)' },
        infants: { type: 'number', description: 'Number of infants (default: 0)' },
        pets: { type: 'number', description: 'Number of pets (default: 0)' },
        minPrice: { type: 'number', description: 'Minimum price per night' },
        maxPrice: { type: 'number', description: 'Maximum price per night' },
        cursor: { type: 'string', description: 'Pagination cursor for browsing results' },
        ignoreRobotsText: { type: 'boolean', description: 'Override robots.txt for this request' }
      },
      required: ['location']
    },
    category: 'travel'
  },

  'airbnb.listing_details': {
    id: 'airbnb.listing_details',
    name: 'Airbnb Listing Details',
    description: 'Get detailed information about a specific Airbnb listing',
    server: 'airbnb',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Airbnb listing ID' },
        checkin: { type: 'string', description: 'Check-in date in YYYY-MM-DD format' },
        checkout: { type: 'string', description: 'Check-out date in YYYY-MM-DD format' },
        adults: { type: 'number', description: 'Number of adults (default: 1)' },
        children: { type: 'number', description: 'Number of children (default: 0)' },
        infants: { type: 'number', description: 'Number of infants (default: 0)' },
        pets: { type: 'number', description: 'Number of pets (default: 0)' },
        ignoreRobotsText: { type: 'boolean', description: 'Override robots.txt for this request' }
      },
      required: ['id']
    },
    category: 'travel'
  },

  // Travel Tools (Expedia MCP Server)
  'expedia.hotel_search': {
    id: 'expedia.hotel_search',
    name: 'Hotel Search',
    description: 'Search for hotels based on location, dates, and preferences',
    server: 'expedia',
    schema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City or destination' },
        checkIn: { type: 'string', description: 'Check-in date' },
        checkOut: { type: 'string', description: 'Check-out date' },
        guests: { type: 'number', description: 'Number of guests' },
        budget: { type: 'number', description: 'Budget per night' }
      },
      required: ['location']
    },
    category: 'travel'
  },

  'expedia.activity_recommendations': {
    id: 'expedia.activity_recommendations',
    name: 'Activity Recommendations',
    description: 'Get personalized activity recommendations for your destination',
    server: 'expedia',
    schema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City or destination' },
        interests: { type: 'array', items: { type: 'string' }, description: 'Activity interests' },
        duration: { type: 'string', description: 'Trip duration' },
        budget: { type: 'number', description: 'Activity budget' }
      },
      required: ['location']
    },
    category: 'travel'
  },

  'expedia.travel_planning': {
    id: 'expedia.travel_planning',
    name: 'Travel Planning',
    description: 'Comprehensive travel planning with itinerary suggestions',
    server: 'expedia',
    schema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Travel destination' },
        startDate: { type: 'string', description: 'Travel start date' },
        endDate: { type: 'string', description: 'Travel end date' },
        travelers: { type: 'number', description: 'Number of travelers' },
        interests: { type: 'array', items: { type: 'string' }, description: 'Travel interests' },
        budget: { type: 'number', description: 'Total travel budget' }
      },
      required: ['destination', 'startDate', 'endDate']
    },
    category: 'travel'
  },

  // Generic Tools (Fallback)
  'generic.json_viewer': {
    id: 'generic.json_viewer',
    name: 'JSON Viewer',
    description: 'Display structured data in a readable format',
    server: 'generic',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'object', description: 'Data to display' }
      },
      required: ['data']
    },
    category: 'generic'
  },

  'generic.data_table': {
    id: 'generic.data_table',
    name: 'Data Table',
    description: 'Display tabular data with sorting and filtering',
    server: 'generic',
    schema: {
      type: 'object',
      properties: {
        columns: { type: 'array', items: { type: 'string' }, description: 'Column headers' },
        rows: { type: 'array', items: { type: 'array' }, description: 'Table rows' }
      },
      required: ['columns', 'rows']
    },
    category: 'generic'
  }
}

/**
 * Get tool configuration by tool name
 */
export function getMCPTool(toolName: string): MCPTool | undefined {
  return mcpToolRegistry[toolName]
}

/**
 * Get all tools for a specific server
 */
export function getMCPToolsByServer(server: string): MCPTool[] {
  return Object.values(mcpToolRegistry).filter(tool => tool.server === server)
}

/**
 * Get all tools by category
 */
export function getMCPToolsByCategory(category: string): MCPTool[] {
  return Object.values(mcpToolRegistry).filter(tool => tool.category === category)
}

/**
 * Get all available MCP servers
 */
export function getMCPServers(): string[] {
  const servers = new Set(Object.values(mcpToolRegistry).map(tool => tool.server))
  return Array.from(servers)
}

/**
 * Check if a tool is supported
 */
export function isToolSupported(toolName: string): boolean {
  return toolName in mcpToolRegistry
}
