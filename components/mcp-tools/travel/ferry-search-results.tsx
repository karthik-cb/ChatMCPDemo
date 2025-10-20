'use client'

import React from 'react'
import { 
  MapPin, 
  Clock, 
  Ship, 
  Euro, 
  Users, 
  Calendar,
  ExternalLink,
  Anchor
} from 'lucide-react'

interface FerrySearchResultsProps {
  args: {
    departurePort?: string
    arrivalPort?: string
    date?: string
  }
  result: {
    trips?: Array<{
      departurePort: string
      arrivalPort: string
      departureTime: string
      arrivalTime: string
      company: string
      price: number
      duration: string
      vessel: string
    }>
    ports?: Array<{
      name: string
      country: string
      code: string
    }>
    redirectUrl?: string
  }
}

export default function FerrySearchResults({ args, result }: FerrySearchResultsProps) {
  if (result.trips && result.trips.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Ship className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Ferry Search Results</h3>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
            <MapPin className="h-4 w-4" />
            <span><strong>Route:</strong> {args.departurePort} → {args.arrivalPort}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 mt-1">
            <Calendar className="h-4 w-4" />
            <span><strong>Date:</strong> {args.date}</span>
          </div>
        </div>

        <div className="space-y-3">
          {result.trips.map((trip, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Anchor className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm text-gray-600 dark:text-gray-400">
                      {trip.company}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">Departure</div>
                        <div className="text-gray-600 dark:text-gray-400">{trip.departureTime}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-600" />
                      <div>
                        <div className="font-medium">Arrival</div>
                        <div className="text-gray-600 dark:text-gray-400">{trip.arrivalTime}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Vessel:</span> {trip.vessel} • 
                    <span className="font-medium ml-1">Duration:</span> {trip.duration}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                    <Euro className="h-4 w-4" />
                    <span>{trip.price}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    per person
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {result.redirectUrl && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <a 
              href={result.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Book this ferry on Ferryhopper
            </a>
          </div>
        )}
      </div>
    )
  }

  if (result.ports && result.ports.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Available Ports</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.ports.map((port, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Anchor className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium">{port.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {port.country} ({port.code})
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Fallback for empty results
  return (
    <div className="text-center py-6">
      <Ship className="h-12 w-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
        No ferry routes found
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Try adjusting your search criteria or check back later for updated schedules.
      </p>
    </div>
  )
}
