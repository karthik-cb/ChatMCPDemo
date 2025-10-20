import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { spawn } from 'child_process'
import path from 'path'
import { tool } from 'ai'
import { z } from 'zod'

// Expedia MCP Server Configuration
const EXPEDIA_MCP_SERVER = {
  command: 'uvx',
  args: [
    'expedia_travel_recommendations_mcp',
    '--protocol',
    'stdio'
  ],
  env: {
    EXPEDIA_API_KEY: process.env.EXPEDIA_API_KEY || ''
  }
}

// Hotel search schema matching Expedia API
const HotelSearchSchema = z.object({
  destination: z.string().describe('The destination city or location'),
  check_in: z.string().describe('Check-in date in YYYY-MM-DD format'),
  check_out: z.string().describe('Check-out date in YYYY-MM-DD format'),
  property_types: z.array(z.string()).optional().describe('Property types: HOTEL, RESORT, etc.'),
  amenities: z.array(z.string()).optional().describe('Desired amenities: POOL, SPA, WIFI, etc.'),
  guest_rating: z.string().optional().describe('Minimum guest rating: WONDERFUL, VERY_GOOD, etc.'),
  sort_type: z.string().optional().describe('Sort type: CHEAPEST, BEST_VALUE, etc.')
})

// Activity search schema
const ActivitySearchSchema = z.object({
  destination: z.string().describe('The destination city or location'),
  start_date: z.string().optional().describe('Start date in YYYY-MM-DD format'),
  end_date: z.string().optional().describe('End date in YYYY-MM-DD format'),
  categories: z.array(z.string()).optional().describe('Activity categories'),
  price_range: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional()
})

// Flight search schema
const FlightSearchSchema = z.object({
  origin: z.string().describe('Origin airport code or city'),
  destination: z.string().describe('Destination airport code or city'),
  departure_date: z.string().describe('Departure date in YYYY-MM-DD format'),
  return_date: z.string().optional().describe('Return date in YYYY-MM-DD format'),
  passengers: z.number().optional().describe('Number of passengers'),
  cabin_class: z.string().optional().describe('Cabin class: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST')
})

// Car rental search schema
const CarRentalSchema = z.object({
  pickup_location: z.string().describe('Pickup location'),
  dropoff_location: z.string().optional().describe('Dropoff location (if different)'),
  pickup_date: z.string().describe('Pickup date in YYYY-MM-DD format'),
  dropoff_date: z.string().describe('Dropoff date in YYYY-MM-DD format'),
  driver_age: z.number().optional().describe('Driver age'),
  car_type: z.string().optional().describe('Car type preference')
})

class ExpediaMCPClient {
  private client: Client | null = null
  private isConnected = false

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return
    }

    if (!process.env.EXPEDIA_API_KEY) {
      throw new Error('EXPEDIA_API_KEY environment variable is required')
    }

    try {
      // Spawn the Expedia MCP server process
      const serverProcess = spawn(EXPEDIA_MCP_SERVER.command, EXPEDIA_MCP_SERVER.args, {
        env: { ...process.env, ...EXPEDIA_MCP_SERVER.env },
        stdio: ['pipe', 'pipe', 'pipe']
      })

      // Create transport and client
      const serverPath = path.join(process.cwd(), 'node_modules', '@expedia', 'expedia-travel-recommendations-mcp', 'dist', 'index.js')
      const transport = new StdioClientTransport({
        command: 'node',
        args: [serverPath],
        env: { ...process.env, EXPEDIA_API_KEY: process.env.EXPEDIA_API_KEY }
      })

      this.client = new Client(
        {
          name: 'expedia-travel-client',
          version: '1.0.0'
        },
        {
          capabilities: {
            tools: {}
          }
        }
      )

      await this.client.connect(transport)
      this.isConnected = true
      console.log('✅ Connected to Expedia MCP Server')
    } catch (error) {
      console.error('❌ Failed to connect to Expedia MCP Server:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.isConnected = false
      console.log('🔌 Disconnected from Expedia MCP Server')
    }
  }

  async callTool(toolName: string, args: any): Promise<any> {
    if (!this.client || !this.isConnected) {
      await this.connect()
    }

    try {
      if (!this.client) {
        throw new Error('MCP client not initialized')
      }
      const result = await this.client.callTool({
        name: toolName,
        arguments: args
      })
      return result
    } catch (error) {
      console.error(`❌ Error calling tool ${toolName}:`, error)
      throw error
    }
  }
}

// Global MCP client instance
const expediaClient = new ExpediaMCPClient()

// Hotel search tool
export const expediaHotelSearchTool: any = {
  description: 'Search for hotels using Expedia MCP server',
  parameters: HotelSearchSchema,
  execute: async (params: any) => {
    try {
      const result = await expediaClient.callTool('expedia_hotels', {
        query: params
      })
      return result
    } catch (error) {
      console.error('Hotel search error:', error)
      return {
        error: 'Failed to search hotels',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Activity search tool
export const expediaActivitySearchTool: any = {
  description: 'Search for activities using Expedia MCP server',
  parameters: ActivitySearchSchema,
  execute: async (params: any) => {
    try {
      const result = await expediaClient.callTool('expedia_activities', {
        query: params
      })
      return result
    } catch (error) {
      console.error('Activity search error:', error)
      return {
        error: 'Failed to search activities',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Flight search tool
export const expediaFlightSearchTool: any = {
  description: 'Search for flights using Expedia MCP server',
  parameters: FlightSearchSchema,
  execute: async (params: any) => {
    try {
      const result = await expediaClient.callTool('expedia_flights', {
        query: params
      })
      return result
    } catch (error) {
      console.error('Flight search error:', error)
      return {
        error: 'Failed to search flights',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Car rental search tool
export const expediaCarRentalTool: any = {
  description: 'Search for car rentals using Expedia MCP server',
  parameters: CarRentalSchema,
  execute: async (params: any) => {
    try {
      const result = await expediaClient.callTool('expedia_cars', {
        query: params
      })
      return result
    } catch (error) {
      console.error('Car rental search error:', error)
      return {
        error: 'Failed to search car rentals',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export all Expedia MCP tools
export const expediaMCPTools: any = {
  hotelSearch: expediaHotelSearchTool,
  activitySearch: expediaActivitySearchTool,
  flightSearch: expediaFlightSearchTool,
  carRental: expediaCarRentalTool
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await expediaClient.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await expediaClient.disconnect()
  process.exit(0)
})
