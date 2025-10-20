import { tool } from 'ai'
import { z } from 'zod'
import { experimental_createMCPClient } from 'ai'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { spawn } from 'child_process'

// Airbnb MCP Server Configuration
const AIRBNB_MCP_COMMAND = 'npx'
const AIRBNB_MCP_ARGS = ['-y', '@openbnb/mcp-server-airbnb']

// Airbnb search schema
const AirbnbSearchSchema = z.object({
  location: z.string().describe('Location to search (e.g., "San Francisco, CA")'),
  placeId: z.string().optional().describe('Google Maps Place ID (overrides location)'),
  checkin: z.string().optional().describe('Check-in date in YYYY-MM-DD format'),
  checkout: z.string().optional().describe('Check-out date in YYYY-MM-DD format'),
  adults: z.number().optional().describe('Number of adults (default: 1)'),
  children: z.number().optional().describe('Number of children (default: 0)'),
  infants: z.number().optional().describe('Number of infants (default: 0)'),
  pets: z.number().optional().describe('Number of pets (default: 0)'),
  minPrice: z.number().optional().describe('Minimum price per night'),
  maxPrice: z.number().optional().describe('Maximum price per night'),
  cursor: z.string().optional().describe('Pagination cursor for browsing results'),
  ignoreRobotsText: z.boolean().optional().describe('Override robots.txt for this request')
})

// Airbnb listing details schema
const AirbnbListingDetailsSchema = z.object({
  id: z.string().describe('Airbnb listing ID'),
  checkin: z.string().optional().describe('Check-in date in YYYY-MM-DD format'),
  checkout: z.string().optional().describe('Check-out date in YYYY-MM-DD format'),
  adults: z.number().optional().describe('Number of adults (default: 1)'),
  children: z.number().optional().describe('Number of children (default: 0)'),
  infants: z.number().optional().describe('Number of infants (default: 0)'),
  pets: z.number().optional().describe('Number of pets (default: 0)'),
  ignoreRobotsText: z.boolean().optional().describe('Override robots.txt for this request')
})

// Initialize MCP Client for Airbnb
let airbnbMCPClient: any = null

async function initializeAirbnbMCPClient() {
  if (airbnbMCPClient) return airbnbMCPClient

  try {
    console.log('Initializing Airbnb MCP client...')
    
    // Create stdio transport for the Airbnb MCP server
    const transport = new StdioClientTransport({
      command: AIRBNB_MCP_COMMAND,
      args: AIRBNB_MCP_ARGS
    })
    
    airbnbMCPClient = await experimental_createMCPClient({
      transport
    })
    
    console.log('✅ Airbnb MCP client initialized successfully')
    return airbnbMCPClient
  } catch (error) {
    console.error('❌ Failed to initialize Airbnb MCP client:', error)
    return null
  }
}

async function callAirbnbTool(toolName: string, args: any): Promise<any> {
  try {
    const client = await initializeAirbnbMCPClient()
    if (!client) {
      console.warn('Airbnb MCP client not available, using mock data')
      return getMockData(toolName, args)
    }

    // Get tools from MCP client
    const tools = await client.tools()
    
    // Find the specific tool
    const tool = tools[toolName]
    if (!tool) {
      console.warn(`Tool ${toolName} not found in Airbnb MCP server, using mock data`)
      return getMockData(toolName, args)
    }

    // Execute the tool
    console.log(`🔧 Calling Airbnb MCP tool: ${toolName}`)
    const result = await tool.execute(args)
    console.log(`✅ Airbnb ${toolName} successful`)
    return result
    
  } catch (error) {
    console.error(`Error calling Airbnb tool ${toolName}:`, error)
    console.warn(`Falling back to mock data for ${toolName}`)
    return getMockData(toolName, args)
  }
}

function getMockData(toolName: string, args: any): any {
  switch (toolName) {
    case 'airbnb_search':
      return {
        listings: [
          {
            id: '12345678',
            name: 'Cozy Downtown Apartment',
            price: 89,
            currency: 'USD',
            rating: 4.8,
            reviewCount: 127,
            location: args.location || 'San Francisco, CA',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
            amenities: ['WiFi', 'Kitchen', 'Parking', 'Gym'],
            host: 'Sarah M.',
            propertyType: 'Apartment',
            bedrooms: 2,
            bathrooms: 1,
            guests: 4,
            url: 'https://airbnb.com/rooms/12345678'
          },
          {
            id: '87654321',
            name: 'Modern Loft with City Views',
            price: 145,
            currency: 'USD',
            rating: 4.9,
            reviewCount: 89,
            location: args.location || 'San Francisco, CA',
            image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
            amenities: ['WiFi', 'Kitchen', 'Balcony', 'Workspace'],
            host: 'Michael R.',
            propertyType: 'Loft',
            bedrooms: 1,
            bathrooms: 1,
            guests: 2,
            url: 'https://airbnb.com/rooms/87654321'
          },
          {
            id: '11223344',
            name: 'Charming Victorian House',
            price: 199,
            currency: 'USD',
            rating: 4.7,
            reviewCount: 203,
            location: args.location || 'San Francisco, CA',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
            amenities: ['WiFi', 'Kitchen', 'Garden', 'Fireplace'],
            host: 'Emma L.',
            propertyType: 'House',
            bedrooms: 3,
            bathrooms: 2,
            guests: 6,
            url: 'https://airbnb.com/rooms/11223344'
          }
        ],
        pagination: {
          hasNext: true,
          cursor: 'next_page_cursor'
        },
        searchUrl: `https://airbnb.com/s/${encodeURIComponent(args.location || 'San Francisco, CA')}`
      }
    
    case 'airbnb_listing_details':
      return {
        id: args.id,
        name: 'Cozy Downtown Apartment',
        description: 'A beautiful, modern apartment in the heart of downtown with easy access to public transportation and local attractions.',
        price: 89,
        currency: 'USD',
        rating: 4.8,
        reviewCount: 127,
        location: {
          address: '123 Main Street, San Francisco, CA',
          coordinates: { lat: 37.7749, lng: -122.4194 },
          neighborhood: 'Downtown'
        },
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
        ],
        amenities: [
          'WiFi',
          'Kitchen',
          'Parking',
          'Gym',
          'Air conditioning',
          'Heating',
          'Washer',
          'Dryer'
        ],
        houseRules: [
          'No smoking',
          'No pets',
          'No parties or events',
          'Check-in after 3:00 PM',
          'Check-out before 11:00 AM'
        ],
        host: {
          name: 'Sarah M.',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
          responseRate: 95,
          responseTime: 'within an hour',
          isSuperhost: true
        },
        propertyType: 'Apartment',
        bedrooms: 2,
        bathrooms: 1,
        guests: 4,
        highlights: [
          'Prime downtown location',
          'Recently renovated',
          'High-speed WiFi',
          'Fully equipped kitchen'
        ],
        url: `https://airbnb.com/rooms/${args.id}`
      }
    
    default:
      return { error: 'Unknown tool', toolName, args }
  }
}

// Airbnb search tool
export const airbnbSearchTool: any = {
  description: 'Search for Airbnb listings with comprehensive filtering options',
  parameters: AirbnbSearchSchema,
  execute: async (params: any) => {
    try {
      const result = await callAirbnbTool('airbnb_search', params)
      return result
    } catch (error) {
      console.error('Airbnb search error:', error)
      return {
        error: 'Failed to search Airbnb listings',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Airbnb listing details tool
export const airbnbListingDetailsTool: any = {
  description: 'Get detailed information about a specific Airbnb listing',
  parameters: AirbnbListingDetailsSchema,
  execute: async (params: any) => {
    try {
      const result = await callAirbnbTool('airbnb_listing_details', params)
      return result
    } catch (error) {
      console.error('Airbnb listing details error:', error)
      return {
        error: 'Failed to get listing details',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export all Airbnb MCP tools
export const airbnbMCPTools = {
  search: airbnbSearchTool,
  listingDetails: airbnbListingDetailsTool
}
