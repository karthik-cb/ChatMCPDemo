/**
 * Kiwi.com MCP Client
 * Provides tools for comprehensive flight search with flexible options
 */

import { z } from 'zod'

// Flight Search Schema
const FlightSearchSchema = z.object({
  origin: z.string().describe('Departure airport code or city (e.g., JFK, NYC, London)'),
  destination: z.string().describe('Arrival airport code or city (e.g., LHR, London, Paris)'),
  departureDate: z.string().describe('Departure date in YYYY-MM-DD format'),
  returnDate: z.string().optional().describe('Return date in YYYY-MM-DD format (optional for round-trip)'),
  adults: z.number().optional().default(1).describe('Number of adult passengers (1-9)'),
  children: z.number().optional().default(0).describe('Number of child passengers (0-9)'),
  infants: z.number().optional().default(0).describe('Number of infant passengers (0-9)'),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).optional().default('economy').describe('Cabin class preference'),
  dateFlexibility: z.number().optional().default(0).describe('Date flexibility in days (±3 days maximum)'),
  maxStops: z.number().optional().describe('Maximum number of stops (0 for direct flights)'),
  sortBy: z.enum(['price', 'duration', 'departure_time']).optional().default('price').describe('Sort results by criteria')
})

// Flight Details Schema
const FlightDetailsSchema = z.object({
  flightId: z.string().describe('Unique flight identifier from search results'),
  passengers: z.object({
    adults: z.number(),
    children: z.number(),
    infants: z.number()
  }).describe('Passenger configuration')
})

// Airport Search Schema
const AirportSearchSchema = z.object({
  query: z.string().describe('Airport name, city, or IATA code to search for'),
  limit: z.number().optional().default(10).describe('Maximum number of results to return')
})

// Kiwi.com MCP Tools
export const kiwi_search_flights: any = {
  description: 'Search for flights with comprehensive options including date flexibility and cabin class',
  parameters: FlightSearchSchema,
  execute: async (params: any) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const isRoundTrip = !!params.returnDate
      const totalPassengers = (params.adults || 1) + (params.children || 0) + (params.infants || 0)
      
      return {
        success: true,
        searchParams: {
          origin: params.origin,
          destination: params.destination,
          departureDate: params.departureDate,
          returnDate: params.returnDate,
          passengers: totalPassengers,
          cabinClass: params.cabinClass || 'economy'
        },
        flights: generateMockFlights(params),
        searchId: `kiwi_${Date.now()}`,
        currency: 'USD',
        searchTime: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search flights',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const kiwi_get_flight_details: any = {
  description: 'Get detailed information about a specific flight including booking options',
  parameters: FlightDetailsSchema,
  execute: async (params: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        flight: {
          id: params.flightId,
          airline: 'Multiple Airlines',
          aircraft: 'Boeing 737-800',
          duration: '8h 45m',
          stops: 1,
          segments: [
            {
              origin: 'JFK',
              destination: 'LHR',
              departure: '2025-01-20T14:30:00Z',
              arrival: '2025-01-21T06:15:00Z',
              airline: 'American Airlines',
              flightNumber: 'AA100',
              aircraft: 'Boeing 777-300ER'
            }
          ],
          pricing: {
            basePrice: 650,
            taxes: 150,
            total: 800,
            currency: 'USD'
          },
          bookingUrl: `https://www.kiwi.com/deep?from=${params.flightId}`,
          baggage: {
            carryOn: 'Included',
            checked: 'Additional fee'
          },
          amenities: ['WiFi', 'Entertainment', 'Meals', 'Power outlets']
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get flight details',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const kiwi_search_airports: any = {
  description: 'Search for airports by name, city, or IATA code',
  parameters: AirportSearchSchema,
  execute: async (params: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        success: true,
        airports: generateMockAirports(params.query, params.limit || 10)
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search airports',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const kiwi_get_cheapest_destinations: any = {
  description: 'Find the cheapest destinations from a specific origin',
  parameters: z.object({
    origin: z.string().describe('Departure airport code or city'),
    departureDate: z.string().describe('Departure date in YYYY-MM-DD format'),
    maxPrice: z.number().optional().describe('Maximum price filter'),
    duration: z.number().optional().describe('Trip duration in days')
  }),
  execute: async (params: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        success: true,
        origin: params.origin,
        departureDate: params.departureDate,
        destinations: generateMockDestinations(params.maxPrice)
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get cheapest destinations',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Helper functions to generate mock data
function generateMockFlights(params: any) {
  const flights = []
  const basePrice = params.cabinClass === 'business' ? 1200 : params.cabinClass === 'first' ? 2500 : 400
  const isRoundTrip = !!params.returnDate
  
  for (let i = 0; i < 5; i++) {
    const priceVariation = (Math.random() - 0.5) * 200
    const duration = 4 + Math.random() * 8 // 4-12 hours
    const stops = Math.random() > 0.6 ? Math.floor(Math.random() * 2) : 0
    
    flights.push({
      id: `kiwi_flight_${i + 1}`,
      price: Math.round(basePrice + priceVariation),
      currency: 'USD',
      departure: {
        time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        airport: params.origin,
        date: params.departureDate
      },
      arrival: {
        time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        airport: params.destination,
        date: params.departureDate
      },
      duration: `${Math.floor(duration)}h ${Math.floor((duration % 1) * 60)}m`,
      stops: stops,
      airline: ['American Airlines', 'Delta', 'United', 'Lufthansa', 'British Airways'][i % 5],
      aircraft: ['Boeing 737', 'Boeing 777', 'Airbus A320', 'Airbus A350'][i % 4],
      cabinClass: params.cabinClass || 'economy',
      bookingUrl: `https://www.kiwi.com/deep?from=kiwi_flight_${i + 1}`,
      isRoundTrip: isRoundTrip,
      returnFlight: isRoundTrip ? {
        departure: {
          time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          airport: params.destination,
          date: params.returnDate
        },
        arrival: {
          time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          airport: params.origin,
          date: params.returnDate
        },
        duration: `${Math.floor(duration)}h ${Math.floor((duration % 1) * 60)}m`,
        airline: ['American Airlines', 'Delta', 'United', 'Lufthansa', 'British Airways'][(i + 1) % 5]
      } : null
    })
  }
  
  return flights.sort((a, b) => a.price - b.price)
}

function generateMockAirports(query: string, limit: number) {
  const mockAirports = [
    { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
    { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom' },
    { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
    { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
    { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
    { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States' },
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE' },
    { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
    { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong' }
  ]
  
  return mockAirports
    .filter(airport => 
      airport.code.toLowerCase().includes(query.toLowerCase()) ||
      airport.name.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, limit)
}

function generateMockDestinations(maxPrice?: number) {
  const destinations = [
    { city: 'Barcelona', country: 'Spain', price: 320, currency: 'USD', duration: '7h 30m' },
    { city: 'Rome', country: 'Italy', price: 380, currency: 'USD', duration: '8h 15m' },
    { city: 'Amsterdam', country: 'Netherlands', price: 450, currency: 'USD', duration: '6h 45m' },
    { city: 'Prague', country: 'Czech Republic', price: 280, currency: 'USD', duration: '9h 20m' },
    { city: 'Budapest', country: 'Hungary', price: 350, currency: 'USD', duration: '8h 50m' },
    { city: 'Lisbon', country: 'Portugal', price: 420, currency: 'USD', duration: '7h 10m' },
    { city: 'Vienna', country: 'Austria', price: 390, currency: 'USD', duration: '8h 30m' },
    { city: 'Berlin', country: 'Germany', price: 410, currency: 'USD', duration: '7h 45m' }
  ]
  
  return destinations
    .filter(dest => !maxPrice || dest.price <= maxPrice)
    .sort((a, b) => a.price - b.price)
    .slice(0, 8)
}

// Export all tools as an object for easy access
export const kiwiMCPTools = {
  kiwi_search_flights,
  kiwi_get_flight_details,
  kiwi_search_airports,
  kiwi_get_cheapest_destinations
}
