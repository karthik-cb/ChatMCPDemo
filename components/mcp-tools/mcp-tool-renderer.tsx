'use client'

import React from 'react'
import { getMCPTool, isToolSupported } from './mcp-tool-registry'
import { ToolInvocationSkeleton } from '@/components/message-skeleton'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface MCPToolRendererProps {
  toolInvocation: {
    toolName: string
    args: Record<string, any>
    result?: any
    state: 'call' | 'result'
  }
}

// Import tool components directly
import HotelSearchResults from './travel/hotel-search-results'
import ActivityRecommendations from './travel/activity-recommendations'
import TravelPlanningSummary from './travel/travel-planning-summary'
import FerrySearchResults from './travel/ferry-search-results'
import { AirbnbSearchResults } from './airbnb/airbnb-search-results'
import { AirbnbListingDetails } from './airbnb/airbnb-listing-details'
import { KiwiFlightSearchResults } from './kiwi/kiwi-flight-search-results'
import { KiwiAirportSearchResults } from './kiwi/kiwi-airport-search-results'
import { KiwiCheapestDestinations } from './kiwi/kiwi-cheapest-destinations'
import { MapboxStaticImage } from './mapbox/mapbox-static-image'
import { MapboxDirections } from './mapbox/mapbox-directions'
import { MapboxCategorySearch } from './mapbox/mapbox-category-search'
import JsonViewer from './generic/json-viewer'
import DataTable from './generic/data-table'

// Tool component mapping
const toolComponents: Record<string, React.ComponentType<any>> = {
  // Ferryhopper MCP Tools
  'getPorts': FerrySearchResults,
  'searchTrips': FerrySearchResults,
  'redirectToBooking': FerrySearchResults,
  
  // Airbnb MCP Tools
  'airbnb.search': AirbnbSearchResults,
  'airbnb.listing_details': AirbnbListingDetails,
  
  // Expedia MCP Tools
  'expedia.hotel_search': HotelSearchResults,
  'expedia.activity_recommendations': ActivityRecommendations,
  'expedia.travel_planning': TravelPlanningSummary,
  
  // Kiwi.com MCP Tools
  'kiwi.search_flights': KiwiFlightSearchResults,
  'kiwi.get_flight_details': KiwiFlightSearchResults,
  'kiwi.search_airports': KiwiAirportSearchResults,
  'kiwi.get_cheapest_destinations': KiwiCheapestDestinations,
  
  // Mapbox MCP Tools
  'mapbox.static_image': MapboxStaticImage,
  'mapbox.directions': MapboxDirections,
  'mapbox.category_search': MapboxCategorySearch,
  'mapbox.matrix': JsonViewer, // Fallback to JSON viewer for complex data
  'mapbox.reverse_geocoding': JsonViewer, // Fallback to JSON viewer
  'mapbox.isochrone': JsonViewer, // Fallback to JSON viewer
  'mapbox.search_geocode': JsonViewer, // Fallback to JSON viewer
  
  // Generic Tools
  'generic.json_viewer': JsonViewer,
  'generic.data_table': DataTable,
}

export default function MCPToolRenderer({ toolInvocation }: MCPToolRendererProps) {
  const { toolName, args, result, state } = toolInvocation

  // Check if tool is supported
  if (!isToolSupported(toolName)) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Unknown Tool: {toolName}
          </div>
        </div>
        <div className="text-sm text-yellow-700 dark:text-yellow-300">
          This tool is not yet supported. Showing raw data:
        </div>
        <pre className="mt-2 text-xs bg-yellow-100 dark:bg-yellow-900 rounded p-2 overflow-x-auto">
          {JSON.stringify({ args, result }, null, 2)}
        </pre>
      </div>
    )
  }

  // Show loading state for tool calls
  if (state === 'call') {
    return (
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
            🔧 Calling tool: {toolName}
          </div>
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 rounded p-2 font-mono">
          {JSON.stringify(args, null, 2)}
        </div>
        <div className="mt-3">
          <ToolInvocationSkeleton />
        </div>
      </div>
    )
  }

  // Show tool result
  if (state === 'result' && result) {
    return (
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="text-sm font-medium text-green-800 dark:text-green-200">
            ✅ Tool Result: {toolName}
          </div>
        </div>
        
        {(() => {
          const ToolComponent = toolComponents[toolName]
          if (!ToolComponent) {
            return (
              <div className="text-sm text-red-600 dark:text-red-400">
                Tool component not found: {toolName}
              </div>
            )
          }
          return <ToolComponent args={args} result={result} />
        })()}
      </div>
    )
  }

  // Fallback for unexpected states
  return (
    <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Tool: {toolName}
      </div>
      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 rounded p-2 overflow-x-auto">
        {JSON.stringify({ args, result, state }, null, 2)}
      </pre>
    </div>
  )
}
