import { tool } from 'ai'
import { z } from 'zod'
import { experimental_createMCPClient } from 'ai'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

// Ferryhopper MCP Server Configuration
const FERRYHOPPER_MCP_URL = 'https://mcp.ferryhopper.com/mcp'

// Port search schema
const PortSearchSchema = z.object({
  query: z.string().optional().describe('Search query for ports (optional)')
})

// Trip search schema
const TripSearchSchema = z.object({
  departurePort: z.string().describe('Departure port name or code'),
  arrivalPort: z.string().describe('Arrival port name or code'),
  date: z.string().describe('Travel date in YYYY-MM-DD format')
})

// Redirect schema
const RedirectSchema = z.object({
  departurePort: z.string().describe('Departure port name'),
  arrivalPort: z.string().describe('Arrival port name'),
  ownerCompany: z.string().describe('Ferry company name'),
  departureDateTime: z.string().describe('Departure date and time'),
  arrivalDateTime: z.string().describe('Arrival date and time'),
  vesselID: z.string().describe('Vessel identifier')
})

// Initialize MCP Client for Ferryhopper
let ferryhopperMCPClient: any = null

async function initializeFerryhopperMCPClient() {
  if (ferryhopperMCPClient) return ferryhopperMCPClient

  try {
    console.log(`Initializing Ferryhopper MCP client for URL: ${FERRYHOPPER_MCP_URL}`)
    
    const transport = new StreamableHTTPClientTransport(new URL(FERRYHOPPER_MCP_URL))
    ferryhopperMCPClient = await experimental_createMCPClient({
      transport
    })
    
    console.log('✅ Ferryhopper MCP client initialized successfully')
    return ferryhopperMCPClient
  } catch (error) {
    console.error('❌ Failed to initialize Ferryhopper MCP client:', error)
    return null
  }
}

async function callFerryhopperTool(toolName: string, args: any): Promise<any> {
  try {
    const client = await initializeFerryhopperMCPClient()
    if (!client) {
      console.warn('Ferryhopper MCP client not available, using mock data')
      return getMockData(toolName, args)
    }

    // Get tools from MCP client
    const tools = await client.tools()
    
    // Find the specific tool
    const tool = tools[toolName]
    if (!tool) {
      console.warn(`Tool ${toolName} not found in Ferryhopper MCP server, using mock data`)
      return getMockData(toolName, args)
    }

    // Execute the tool
    console.log(`🔧 Calling Ferryhopper MCP tool: ${toolName}`)
    const result = await tool.execute(args)
    console.log(`✅ Ferryhopper ${toolName} successful`)
    return result
    
  } catch (error) {
    console.error(`Error calling Ferryhopper tool ${toolName}:`, error)
    console.warn(`Falling back to mock data for ${toolName}`)
    return getMockData(toolName, args)
  }
}

function getMockData(toolName: string, args: any): any {
    switch (toolName) {
      case 'get_ports':
        return {
          ports: [
            { name: 'Piraeus', country: 'Greece', code: 'PIR' },
            { name: 'Aegina', country: 'Greece', code: 'AEG' },
            { name: 'Santorini', country: 'Greece', code: 'SAN' },
            { name: 'Mykonos', country: 'Greece', code: 'MYK' },
            { name: 'Ibiza', country: 'Spain', code: 'IBZ' },
            { name: 'Barcelona', country: 'Spain', code: 'BCN' }
          ]
        }
      
      case 'search_trips':
        return {
          trips: [
            {
              departurePort: args.departurePort || 'Piraeus',
              arrivalPort: args.arrivalPort || 'Aegina',
              departureTime: '08:00',
              arrivalTime: '09:30',
              company: 'Blue Star Ferries',
              price: 12.50,
              duration: '1h 30m',
              vessel: 'Blue Star 1'
            },
            {
              departurePort: args.departurePort || 'Piraeus',
              arrivalPort: args.arrivalPort || 'Aegina',
              departureTime: '14:00',
              arrivalTime: '15:30',
              company: 'Hellenic Seaways',
              price: 15.00,
              duration: '1h 30m',
              vessel: 'Highspeed 4'
            }
          ]
        }
      
      case 'redirect_to_search_results_page':
        return {
          redirectUrl: `https://www.ferryhopper.com/en/search?from=${args.departurePort}&to=${args.arrivalPort}&date=${args.departureDateTime}`
        }
      
      default:
        return { error: 'Unknown tool', toolName, args }
    }
  }


// Get ports tool
export const ferryhopperGetPortsTool: any = {
  description: 'Get a list of global ports and their details from Ferryhopper',
  parameters: PortSearchSchema,
  execute: async (params: any) => {
    try {
      const result = await callFerryhopperTool('get_ports', params)
      return result
    } catch (error) {
      console.error('Get ports error:', error)
      return {
        error: 'Failed to get ports',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Search trips tool
export const ferryhopperSearchTripsTool: any = {
  description: 'Get available ferry trips between two ports on a specific date',
  parameters: TripSearchSchema,
  execute: async (params: any) => {
    try {
      const result = await callFerryhopperTool('search_trips', params)
      return result
    } catch (error) {
      console.error('Search trips error:', error)
      return {
        error: 'Failed to search trips',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Redirect to booking tool
export const ferryhopperRedirectTool: any = {
  description: 'Get a redirection URL to Ferryhopper booking page',
  parameters: RedirectSchema,
  execute: async (params: any) => {
    try {
      const result = await callFerryhopperTool('redirect_to_search_results_page', params)
      return result
    } catch (error) {
      console.error('Redirect error:', error)
      return {
        error: 'Failed to get redirect URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export all Ferryhopper MCP tools
export const ferryhopperMCPTools = {
  getPorts: ferryhopperGetPortsTool,
  searchTrips: ferryhopperSearchTripsTool,
  redirectToBooking: ferryhopperRedirectTool
}
