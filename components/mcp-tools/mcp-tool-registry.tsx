/**
 * MCP Tool Registry
 * Central registry for all MCP tool components and their configurations
 */

import { ComponentType } from 'react'
import { mcpSettingsManager } from '@/lib/mcp-settings-manager'

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
  // Turkish Airlines MCP Tools
  'turkish_airlines.search_flights': {
    id: 'turkish_airlines.search_flights',
    name: 'Search Turkish Airlines Flights',
    description: 'Search Turkish Airlines flights based on origin, destination, dates, and passenger details',
    server: 'turkish-airlines',
    schema: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: 'Departure airport code (e.g., IST, JFK)' },
        destination: { type: 'string', description: 'Arrival airport code (e.g., LHR, CDG)' },
        departureDate: { type: 'string', description: 'Departure date in YYYY-MM-DD format' },
        returnDate: { type: 'string', description: 'Return date in YYYY-MM-DD format (optional)' },
        adults: { type: 'number', description: 'Number of adult passengers (default: 1)' },
        children: { type: 'number', description: 'Number of child passengers (default: 0)' },
        infants: { type: 'number', description: 'Number of infant passengers (default: 0)' }
      },
      required: ['origin', 'destination', 'departureDate']
    },
    category: 'travel'
  },

  'turkish_airlines.flight_status_number': {
    id: 'turkish_airlines.flight_status_number',
    name: 'Get Flight Status by Number',
    description: 'Fetch real-time flight status by flight number and date',
    server: 'turkish-airlines',
    schema: {
      type: 'object',
      properties: {
        flightNumber: { type: 'string', description: 'Flight number (e.g., TK123)' },
        date: { type: 'string', description: 'Flight date in YYYY-MM-DD format' }
      },
      required: ['flightNumber', 'date']
    },
    category: 'travel'
  },

  'turkish_airlines.flight_status_route': {
    id: 'turkish_airlines.flight_status_route',
    name: 'Get Flight Status by Route',
    description: 'Fetch real-time flight status by route (airports and date)',
    server: 'turkish-airlines',
    schema: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: 'Departure airport code' },
        destination: { type: 'string', description: 'Arrival airport code' },
        date: { type: 'string', description: 'Flight date in YYYY-MM-DD format' }
      },
      required: ['origin', 'destination', 'date']
    },
    category: 'travel'
  },

  'turkish_airlines.booking_details': {
    id: 'turkish_airlines.booking_details',
    name: 'Get Booking Details',
    description: 'Retrieve Turkish Airlines flight booking details using PNR and surname',
    server: 'turkish-airlines',
    schema: {
      type: 'object',
      properties: {
        pnr: { type: 'string', description: 'Passenger Name Record (booking reference)' },
        surname: { type: 'string', description: 'Passenger surname' }
      },
      required: ['pnr', 'surname']
    },
    category: 'travel'
  },

  'turkish_airlines.member_details': {
    id: 'turkish_airlines.member_details',
    name: 'Get Member Details',
    description: 'Fetch Miles&Smiles member profile, miles balance, and identity information',
    server: 'turkish-airlines',
    schema: {
      type: 'object',
      properties: {},
      required: []
    },
    category: 'travel'
  },

  'turkish_airlines.member_flights': {
    id: 'turkish_airlines.member_flights',
    name: 'Get Member Flights',
    description: 'Retrieve member\'s upcoming and past flight history',
    server: 'turkish-airlines',
    schema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of flights to return (default: 10)' }
      },
      required: []
    },
    category: 'travel'
  },

  'turkish_airlines.promotions': {
    id: 'turkish_airlines.promotions',
    name: 'Get Airline Promotions',
    description: 'Discover current promotions by country and airports',
    server: 'turkish-airlines',
    schema: {
      type: 'object',
      properties: {
        country: { type: 'string', description: 'Country code (e.g., TR, US, GB)' },
        airport: { type: 'string', description: 'Airport code (e.g., IST, JFK)' }
      },
      required: []
    },
    category: 'travel'
  },

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

  // Kiwi.com MCP Tools
  'kiwi.search_flights': {
    id: 'kiwi.search_flights',
    name: 'Search Flights',
    description: 'Search for flights with comprehensive options including date flexibility and cabin class',
    server: 'kiwi',
    schema: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: 'Departure airport code or city (e.g., JFK, NYC, London)' },
        destination: { type: 'string', description: 'Arrival airport code or city (e.g., LHR, London, Paris)' },
        departureDate: { type: 'string', description: 'Departure date in YYYY-MM-DD format' },
        returnDate: { type: 'string', description: 'Return date in YYYY-MM-DD format (optional for round-trip)' },
        adults: { type: 'number', description: 'Number of adult passengers (1-9, default: 1)' },
        children: { type: 'number', description: 'Number of child passengers (0-9, default: 0)' },
        infants: { type: 'number', description: 'Number of infant passengers (0-9, default: 0)' },
        cabinClass: { type: 'string', enum: ['economy', 'premium_economy', 'business', 'first'], description: 'Cabin class preference (default: economy)' },
        dateFlexibility: { type: 'number', description: 'Date flexibility in days (±3 days maximum, default: 0)' },
        maxStops: { type: 'number', description: 'Maximum number of stops (0 for direct flights)' },
        sortBy: { type: 'string', enum: ['price', 'duration', 'departure_time'], description: 'Sort results by criteria (default: price)' }
      },
      required: ['origin', 'destination', 'departureDate']
    },
    category: 'travel'
  },

  'kiwi.get_flight_details': {
    id: 'kiwi.get_flight_details',
    name: 'Get Flight Details',
    description: 'Get detailed information about a specific flight including booking options',
    server: 'kiwi',
    schema: {
      type: 'object',
      properties: {
        flightId: { type: 'string', description: 'Unique flight identifier from search results' },
        passengers: { 
          type: 'object',
          properties: {
            adults: { type: 'number' },
            children: { type: 'number' },
            infants: { type: 'number' }
          },
          description: 'Passenger configuration'
        }
      },
      required: ['flightId']
    },
    category: 'travel'
  },

  'kiwi.search_airports': {
    id: 'kiwi.search_airports',
    name: 'Search Airports',
    description: 'Search for airports by name, city, or IATA code',
    server: 'kiwi',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Airport name, city, or IATA code to search for' },
        limit: { type: 'number', description: 'Maximum number of results to return (default: 10)' }
      },
      required: ['query']
    },
    category: 'travel'
  },

  'kiwi.get_cheapest_destinations': {
    id: 'kiwi.get_cheapest_destinations',
    name: 'Get Cheapest Destinations',
    description: 'Find the cheapest destinations from a specific origin',
    server: 'kiwi',
    schema: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: 'Departure airport code or city' },
        departureDate: { type: 'string', description: 'Departure date in YYYY-MM-DD format' },
        maxPrice: { type: 'number', description: 'Maximum price filter' },
        duration: { type: 'number', description: 'Trip duration in days' }
      },
      required: ['origin', 'departureDate']
    },
    category: 'travel'
  },

  // Mapbox MCP Tools
  'mapbox.matrix': {
    id: 'mapbox.matrix',
    name: 'Travel Time Matrix',
    description: 'Calculate travel times and distances between multiple points',
    server: 'mapbox',
    schema: {
      type: 'object',
      properties: {
        coordinates: { type: 'array', items: { type: 'array', items: { type: 'number' } }, description: 'Array of coordinate pairs [longitude, latitude]' },
        profile: { type: 'string', enum: ['driving-traffic', 'driving', 'walking', 'cycling'], description: 'Travel profile (default: driving)' },
        departAt: { type: 'string', description: 'Departure time in ISO 8601 format' },
        approaches: { type: 'array', items: { type: 'string', enum: ['curb', 'unrestricted'] }, description: 'Control approach for each coordinate' },
        bearings: { type: 'array', items: { type: 'array', items: { type: 'number' } }, description: 'Range of allowed departure bearings' }
      },
      required: ['coordinates']
    },
    category: 'travel'
  },

  'mapbox.static_image': {
    id: 'mapbox.static_image',
    name: 'Static Map Image',
    description: 'Generate static map images with custom styling and markers',
    server: 'mapbox',
    schema: {
      type: 'object',
      properties: {
        coordinates: { type: 'array', items: { type: 'array', items: { type: 'number' } }, description: 'Array of coordinate pairs [longitude, latitude]' },
        style: { type: 'string', description: 'Map style (default: mapbox/streets-v12)' },
        width: { type: 'number', description: 'Image width in pixels (default: 600)' },
        height: { type: 'number', description: 'Image height in pixels (default: 400)' },
        zoom: { type: 'number', description: 'Zoom level' },
        markers: { 
          type: 'array', 
          items: {
            type: 'object',
            properties: {
              coordinates: { type: 'array', items: { type: 'number' }, description: 'Marker coordinates [longitude, latitude]' },
              color: { type: 'string', description: 'Marker color' },
              label: { type: 'string', description: 'Marker label' }
            }
          },
          description: 'Markers to overlay on the map'
        }
      },
      required: ['coordinates']
    },
    category: 'travel'
  },

  'mapbox.category_search': {
    id: 'mapbox.category_search',
    name: 'Category Search',
    description: 'Search for points of interest by category (restaurants, hotels, etc.)',
    server: 'mapbox',
    schema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Category to search for (e.g., restaurant, hotel, gas_station)' },
        coordinates: { type: 'array', items: { type: 'number' }, description: 'Search center coordinates [longitude, latitude]' },
        radius: { type: 'number', description: 'Search radius in meters' },
        limit: { type: 'number', description: 'Maximum number of results (default: 10)' },
        language: { type: 'string', description: 'Language code for results' }
      },
      required: ['category']
    },
    category: 'travel'
  },

  'mapbox.reverse_geocoding': {
    id: 'mapbox.reverse_geocoding',
    name: 'Reverse Geocoding',
    description: 'Convert geographic coordinates to human-readable addresses',
    server: 'mapbox',
    schema: {
      type: 'object',
      properties: {
        coordinates: { type: 'array', items: { type: 'number' }, description: 'Coordinates [longitude, latitude]' },
        types: { type: 'array', items: { type: 'string' }, description: 'Filter by place type' },
        language: { type: 'string', description: 'Language code for results' },
        limit: { type: 'number', description: 'Maximum number of results (default: 1)' }
      },
      required: ['coordinates']
    },
    category: 'travel'
  },

  'mapbox.directions': {
    id: 'mapbox.directions',
    name: 'Directions',
    description: 'Get routing directions between multiple waypoints',
    server: 'mapbox',
    schema: {
      type: 'object',
      properties: {
        coordinates: { type: 'array', items: { type: 'array', items: { type: 'number' } }, description: 'Array of coordinate pairs for waypoints' },
        profile: { type: 'string', enum: ['driving-traffic', 'driving', 'walking', 'cycling'], description: 'Routing profile (default: driving)' },
        alternatives: { type: 'boolean', description: 'Include alternative routes (default: false)' },
        departAt: { type: 'string', description: 'Departure time in ISO 8601 format' },
        arriveBy: { type: 'string', description: 'Desired arrival time in ISO 8601 format' },
        geometries: { type: 'string', enum: ['geojson', 'polyline', 'polyline6'], description: 'Geometry format (default: geojson)' },
        overview: { type: 'string', enum: ['full', 'simplified', 'false'], description: 'Route overview level (default: simplified)' }
      },
      required: ['coordinates']
    },
    category: 'travel'
  },

  'mapbox.isochrone': {
    id: 'mapbox.isochrone',
    name: 'Isochrone Analysis',
    description: 'Compute areas reachable within specified time/distance from a location',
    server: 'mapbox',
    schema: {
      type: 'object',
      properties: {
        coordinates: { type: 'array', items: { type: 'number' }, description: 'Origin coordinates [longitude, latitude]' },
        profile: { type: 'string', enum: ['driving', 'walking', 'cycling'], description: 'Travel profile (default: driving)' },
        contours: { 
          type: 'array', 
          items: {
            type: 'object',
            properties: {
              time: { type: 'number', description: 'Time in minutes' },
              distance: { type: 'number', description: 'Distance in meters' },
              color: { type: 'string', description: 'Contour color' }
            }
          },
          description: 'Contour definitions'
        },
        departAt: { type: 'string', description: 'Departure time in ISO 8601 format' }
      },
      required: ['coordinates', 'contours']
    },
    category: 'travel'
  },

  'mapbox.search_geocode': {
    id: 'mapbox.search_geocode',
    name: 'Search & Geocode',
    description: 'Search for places and geocode addresses',
    server: 'mapbox',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (address, place name, etc.)' },
        coordinates: { type: 'array', items: { type: 'number' }, description: 'Search center coordinates [longitude, latitude]' },
        radius: { type: 'number', description: 'Search radius in meters' },
        limit: { type: 'number', description: 'Maximum number of results (default: 10)' },
        language: { type: 'string', description: 'Language code for results' },
        types: { type: 'array', items: { type: 'string' }, description: 'Filter by place type' }
      },
      required: ['query']
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
  const tool = mcpToolRegistry[toolName]
  if (!tool) return false
  
  // Check if the server for this tool is enabled
  return mcpSettingsManager.isServerEnabled(tool.server)
}

/**
 * Get all supported tools (filtered by enabled servers)
 */
export function getSupportedTools(): Record<string, MCPTool> {
  const supportedTools: Record<string, MCPTool> = {}
  
  for (const [toolName, tool] of Object.entries(mcpToolRegistry)) {
    if (mcpSettingsManager.isServerEnabled(tool.server)) {
      supportedTools[toolName] = tool
    }
  }
  
  return supportedTools
}
