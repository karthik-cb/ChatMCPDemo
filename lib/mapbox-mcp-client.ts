/**
 * Mapbox MCP Client
 * Provides tools for geospatial operations, mapping, and location services
 */

import { z } from 'zod'

// Matrix Tool Schema - Calculate travel times and distances between multiple points
const MatrixSchema = z.object({
  coordinates: z.array(z.array(z.number())).describe('Array of coordinate pairs [longitude, latitude]'),
  profile: z.enum(['driving-traffic', 'driving', 'walking', 'cycling']).optional().default('driving').describe('Travel profile'),
  departAt: z.string().optional().describe('Departure time in ISO 8601 format'),
  approaches: z.array(z.enum(['curb', 'unrestricted'])).optional().describe('Control approach for each coordinate'),
  bearings: z.array(z.array(z.number())).optional().describe('Range of allowed departure bearings for each coordinate')
})

// Static Image Tool Schema - Generate static map images
const StaticImageSchema = z.object({
  coordinates: z.array(z.array(z.number())).describe('Array of coordinate pairs [longitude, latitude]'),
  style: z.string().optional().default('mapbox/streets-v12').describe('Map style'),
  width: z.number().optional().default(600).describe('Image width in pixels'),
  height: z.number().optional().default(400).describe('Image height in pixels'),
  zoom: z.number().optional().describe('Zoom level'),
  markers: z.array(z.object({
    coordinates: z.array(z.number()).describe('Marker coordinates [longitude, latitude]'),
    color: z.string().optional().describe('Marker color'),
    label: z.string().optional().describe('Marker label')
  })).optional().describe('Markers to overlay on the map')
})

// Category Search Tool Schema - Search for points of interest by category
const CategorySearchSchema = z.object({
  category: z.string().describe('Category to search for (e.g., restaurant, hotel, gas_station)'),
  coordinates: z.array(z.number()).optional().describe('Search center coordinates [longitude, latitude]'),
  radius: z.number().optional().describe('Search radius in meters'),
  limit: z.number().optional().default(10).describe('Maximum number of results'),
  language: z.string().optional().describe('Language code for results')
})

// Reverse Geocoding Tool Schema - Convert coordinates to addresses
const ReverseGeocodingSchema = z.object({
  coordinates: z.array(z.number()).describe('Coordinates [longitude, latitude]'),
  types: z.array(z.string()).optional().describe('Filter by place type'),
  language: z.string().optional().describe('Language code for results'),
  limit: z.number().optional().default(1).describe('Maximum number of results')
})

// Directions Tool Schema - Get routing directions
const DirectionsSchema = z.object({
  coordinates: z.array(z.array(z.number())).optional().describe('Array of coordinate pairs for waypoints'),
  origin: z.string().optional().describe('Origin place name (e.g., "Boston, MA")'),
  destination: z.string().optional().describe('Destination place name (e.g., "New York, NY")'),
  profile: z.enum(['driving-traffic', 'driving', 'walking', 'cycling']).optional().default('driving').describe('Routing profile'),
  alternatives: z.boolean().optional().default(false).describe('Include alternative routes'),
  departAt: z.string().optional().describe('Departure time in ISO 8601 format'),
  arriveBy: z.string().optional().describe('Desired arrival time in ISO 8601 format'),
  geometries: z.enum(['geojson', 'polyline', 'polyline6']).optional().default('geojson').describe('Geometry format'),
  overview: z.enum(['full', 'simplified', 'false']).optional().default('simplified').describe('Route overview level')
}).refine(
  (data) => data.coordinates || (data.origin && data.destination),
  {
    message: "Either 'coordinates' array or both 'origin' and 'destination' must be provided"
  }
)

// Isochrone Tool Schema - Compute reachable areas within time/distance
const IsochroneSchema = z.object({
  coordinates: z.array(z.number()).describe('Origin coordinates [longitude, latitude]'),
  profile: z.enum(['driving', 'walking', 'cycling']).optional().default('driving').describe('Travel profile'),
  contours: z.array(z.object({
    time: z.number().optional().describe('Time in minutes'),
    distance: z.number().optional().describe('Distance in meters'),
    color: z.string().optional().describe('Contour color')
  })).describe('Contour definitions'),
  departAt: z.string().optional().describe('Departure time in ISO 8601 format')
})

// Search and Geocode Tool Schema - Search for places and geocode addresses
const SearchGeocodeSchema = z.object({
  query: z.string().describe('Search query (address, place name, etc.)'),
  coordinates: z.array(z.number()).optional().describe('Search center coordinates [longitude, latitude]'),
  radius: z.number().optional().describe('Search radius in meters'),
  limit: z.number().optional().default(10).describe('Maximum number of results'),
  language: z.string().optional().describe('Language code for results'),
  types: z.array(z.string()).optional().describe('Filter by place type')
})

// Mapbox MCP Tools
export const mapbox_matrix: any = {
  description: 'Calculate travel times and distances between multiple points using Mapbox Matrix API',
  parameters: MatrixSchema,
  execute: async (params: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      return {
        success: true,
        matrix: {
          durations: generateMockDurations(params.coordinates.length),
          distances: generateMockDistances(params.coordinates.length),
          sources: params.coordinates.map((coord: number[], i: number) => ({
            coordinates: coord,
            duration: generateMockDurations(params.coordinates.length)[i],
            distance: generateMockDistances(params.coordinates.length)[i]
          }))
        },
        profile: params.profile || 'driving',
        departAt: params.departAt
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to calculate matrix',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const mapbox_static_image: any = {
  description: 'Generate static map images using Mapbox static image API',
  parameters: StaticImageSchema,
  execute: async (params: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        image: {
          url: generateMockMapImageUrl(params),
          width: params.width || 600,
          height: params.height || 400,
          style: params.style || 'mapbox/streets-v12',
          zoom: params.zoom || 12,
          coordinates: params.coordinates,
          markers: params.markers || []
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate static image',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const mapbox_category_search: any = {
  description: 'Search for points of interest by category using Mapbox Search Box API',
  parameters: CategorySearchSchema,
  execute: async (params: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      return {
        success: true,
        results: generateMockPOIResults(params.category, params.limit || 10),
        category: params.category,
        coordinates: params.coordinates,
        radius: params.radius
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const mapbox_reverse_geocoding: any = {
  description: 'Convert geographic coordinates to human-readable addresses',
  parameters: ReverseGeocodingSchema,
  execute: async (params: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      return {
        success: true,
        results: generateMockAddressResults(params.coordinates),
        coordinates: params.coordinates,
        language: params.language
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to reverse geocode',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const mapbox_directions: any = {
  description: 'Get routing directions between multiple waypoints',
  parameters: DirectionsSchema,
  execute: async (params: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Handle both coordinate arrays and place names
      let coordinates = params.coordinates
      
      if (!coordinates && params.origin && params.destination) {
        // Convert place names to mock coordinates
        coordinates = [
          [-71.0589, 42.3601], // Boston, MA
          [-74.0060, 40.7128]  // New York, NY
        ]
      }
      
      if (!coordinates || coordinates.length < 2) {
        throw new Error('At least 2 waypoints are required for directions')
      }
      
      return {
        success: true,
        routes: generateMockRouteResults(coordinates),
        waypoints: coordinates,
        profile: params.profile || 'driving',
        alternatives: params.alternatives || false
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get directions',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const mapbox_isochrone: any = {
  description: 'Compute areas reachable within specified time/distance from a location',
  parameters: IsochroneSchema,
  execute: async (params: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1800))
      
      return {
        success: true,
        contours: generateMockIsochroneResults(params.contours),
        coordinates: params.coordinates,
        profile: params.profile || 'driving'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to compute isochrone',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const mapbox_search_geocode: any = {
  description: 'Search for places and geocode addresses using Mapbox Search Box API',
  parameters: SearchGeocodeSchema,
  execute: async (params: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        results: generateMockSearchResults(params.query, params.limit || 10),
        query: params.query,
        coordinates: params.coordinates,
        radius: params.radius
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search and geocode',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Helper functions to generate mock data
function generateMockDurations(pointCount: number): number[][] {
  const durations: number[][] = []
  for (let i = 0; i < pointCount; i++) {
    const row: number[] = []
    for (let j = 0; j < pointCount; j++) {
      if (i === j) {
        row.push(0)
      } else {
        row.push(Math.floor(Math.random() * 3600) + 300) // 5 minutes to 1 hour in seconds
      }
    }
    durations.push(row)
  }
  return durations
}

function generateMockDistances(pointCount: number): number[][] {
  const distances: number[][] = []
  for (let i = 0; i < pointCount; i++) {
    const row: number[] = []
    for (let j = 0; j < pointCount; j++) {
      if (i === j) {
        row.push(0)
      } else {
        row.push(Math.floor(Math.random() * 50000) + 1000) // 1km to 50km in meters
      }
    }
    distances.push(row)
  }
  return distances
}

function generateMockMapImageUrl(params: any): string {
  const baseUrl = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static'
  const coordinates = params.coordinates[0]
  const zoom = params.zoom || 12
  const width = params.width || 600
  const height = params.height || 400
  
  return `${baseUrl}/${coordinates[0]},${coordinates[1]},${zoom}/${width}x${height}@2x?access_token=YOUR_TOKEN`
}

function generateMockPOIResults(category: string, limit: number): any[] {
  const mockPOIs = {
    restaurant: [
      { name: 'The Golden Spoon', coordinates: [-74.0059, 40.7128], address: '123 Main St, New York, NY', rating: 4.5, cuisine: 'Italian' },
      { name: 'Bistro Central', coordinates: [-74.0060, 40.7129], address: '456 Oak Ave, New York, NY', rating: 4.2, cuisine: 'French' },
      { name: 'Sushi Zen', coordinates: [-74.0061, 40.7130], address: '789 Pine St, New York, NY', rating: 4.8, cuisine: 'Japanese' }
    ],
    hotel: [
      { name: 'Grand Plaza Hotel', coordinates: [-74.0059, 40.7128], address: '100 Broadway, New York, NY', rating: 4.3, price: '$200/night' },
      { name: 'Metropolitan Inn', coordinates: [-74.0060, 40.7129], address: '200 5th Ave, New York, NY', rating: 4.1, price: '$150/night' },
      { name: 'Central Suites', coordinates: [-74.0061, 40.7130], address: '300 Park Ave, New York, NY', rating: 4.6, price: '$300/night' }
    ],
    gas_station: [
      { name: 'Shell Station', coordinates: [-74.0059, 40.7128], address: '400 Main St, New York, NY', price: '$3.45/gal' },
      { name: 'Exxon Mobil', coordinates: [-74.0060, 40.7129], address: '500 Oak Ave, New York, NY', price: '$3.42/gal' },
      { name: 'BP Gas Station', coordinates: [-74.0061, 40.7130], address: '600 Pine St, New York, NY', price: '$3.48/gal' }
    ]
  }
  
  const categoryPOIs = mockPOIs[category as keyof typeof mockPOIs] || []
  return categoryPOIs.slice(0, limit)
}

function generateMockAddressResults(coordinates: number[]): any[] {
  return [{
    address: '123 Main Street, New York, NY 10001, United States',
    coordinates: coordinates,
    components: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postcode: '10001',
      country: 'United States'
    },
    confidence: 0.9
  }]
}

function generateMockRouteResults(waypoints: number[][]): any[] {
  return [{
    duration: Math.floor(Math.random() * 3600) + 1800, // 30 minutes to 1.5 hours
    distance: Math.floor(Math.random() * 50000) + 10000, // 10km to 60km
    geometry: {
      type: 'LineString',
      coordinates: waypoints
    },
    legs: waypoints.slice(0, -1).map((waypoint, i) => ({
      duration: Math.floor(Math.random() * 1800) + 600,
      distance: Math.floor(Math.random() * 25000) + 5000,
      summary: `Leg ${i + 1}`,
      steps: []
    }))
  }]
}

function generateMockIsochroneResults(contours: any[]): any[] {
  return contours.map((contour, i) => ({
    time: contour.time,
    distance: contour.distance,
    color: contour.color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-74.0059 + (i * 0.01), 40.7128 + (i * 0.01)],
        [-74.0059 + (i * 0.01), 40.7128 - (i * 0.01)],
        [-74.0059 - (i * 0.01), 40.7128 - (i * 0.01)],
        [-74.0059 - (i * 0.01), 40.7128 + (i * 0.01)],
        [-74.0059 + (i * 0.01), 40.7128 + (i * 0.01)]
      ]]
    }
  }))
}

function generateMockSearchResults(query: string, limit: number): any[] {
  return [
    {
      name: `${query} Location 1`,
      coordinates: [-74.0059, 40.7128],
      address: `123 ${query} St, New York, NY`,
      type: 'poi',
      confidence: 0.9
    },
    {
      name: `${query} Location 2`,
      coordinates: [-74.0060, 40.7129],
      address: `456 ${query} Ave, New York, NY`,
      type: 'address',
      confidence: 0.8
    }
  ].slice(0, limit)
}

// Export all tools as an object for easy access
export const mapboxMCPTools = {
  mapbox_matrix,
  mapbox_static_image,
  mapbox_category_search,
  mapbox_reverse_geocoding,
  mapbox_directions,
  mapbox_isochrone,
  mapbox_search_geocode
}
