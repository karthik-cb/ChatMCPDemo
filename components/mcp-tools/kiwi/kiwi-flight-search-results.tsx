'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Plane, MapPin, Users, DollarSign, ExternalLink } from 'lucide-react'

interface Flight {
  id: string
  price: number
  currency: string
  departure: {
    time: string
    airport: string
    date: string
  }
  arrival: {
    time: string
    airport: string
    date: string
  }
  duration: string
  stops: number
  airline: string
  aircraft: string
  cabinClass: string
  bookingUrl: string
  isRoundTrip: boolean
  returnFlight?: {
    departure: {
      time: string
      airport: string
      date: string
    }
    arrival: {
      time: string
      airport: string
      date: string
    }
    duration: string
    airline: string
  }
}

interface KiwiFlightSearchResultsProps {
  data: {
    success: boolean
    searchParams: {
      origin: string
      destination: string
      departureDate: string
      returnDate?: string
      passengers: number
      cabinClass: string
    }
    flights: Flight[]
    searchId: string
    currency: string
    searchTime: string
  }
}

export function KiwiFlightSearchResults({ data }: KiwiFlightSearchResultsProps) {
  if (!data.success || !data.flights || data.flights.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No flights found for your search criteria.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const getCabinClassColor = (cabinClass: string) => {
    switch (cabinClass) {
      case 'first': return 'bg-purple-100 text-purple-800'
      case 'business': return 'bg-blue-100 text-blue-800'
      case 'premium_economy': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCabinClassLabel = (cabinClass: string) => {
    switch (cabinClass) {
      case 'first': return 'First Class'
      case 'business': return 'Business Class'
      case 'premium_economy': return 'Premium Economy'
      default: return 'Economy'
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Flight Search Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Route:</span>
              <p className="font-medium">{data.searchParams.origin} → {data.searchParams.destination}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Departure:</span>
              <p className="font-medium">{formatDate(data.searchParams.departureDate)}</p>
            </div>
            {data.searchParams.returnDate && (
              <div>
                <span className="text-muted-foreground">Return:</span>
                <p className="font-medium">{formatDate(data.searchParams.returnDate)}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Passengers:</span>
              <p className="font-medium">{data.searchParams.passengers} {data.searchParams.passengers === 1 ? 'passenger' : 'passengers'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flight Results */}
      <div className="space-y-3">
        {data.flights.map((flight, index) => (
          <Card key={flight.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Flight Details */}
                <div className="flex-1 space-y-3">
                  {/* Outbound Flight */}
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-2xl font-bold">{formatTime(flight.departure.time)}</p>
                      <p className="text-sm text-muted-foreground">{flight.departure.airport}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(flight.departure.date)}</p>
                    </div>
                    
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="h-px bg-border flex-1"></div>
                        <Plane className="h-4 w-4 text-muted-foreground" />
                        <div className="h-px bg-border flex-1"></div>
                      </div>
                      <p className="text-sm text-muted-foreground">{flight.duration}</p>
                      <p className="text-xs text-muted-foreground">
                        {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    
                    <div className="text-center min-w-[60px]">
                      <p className="text-2xl font-bold">{formatTime(flight.arrival.time)}</p>
                      <p className="text-sm text-muted-foreground">{flight.arrival.airport}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(flight.arrival.date)}</p>
                    </div>
                  </div>

                  {/* Return Flight (if round trip) */}
                  {flight.returnFlight && (
                    <div className="flex items-center gap-4 pt-3 border-t">
                      <div className="text-center min-w-[60px]">
                        <p className="text-2xl font-bold">{formatTime(flight.returnFlight.departure.time)}</p>
                        <p className="text-sm text-muted-foreground">{flight.returnFlight.departure.airport}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(flight.returnFlight.departure.date)}</p>
                      </div>
                      
                      <div className="flex-1 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className="h-px bg-border flex-1"></div>
                          <Plane className="h-4 w-4 text-muted-foreground rotate-180" />
                          <div className="h-px bg-border flex-1"></div>
                        </div>
                        <p className="text-sm text-muted-foreground">{flight.returnFlight.duration}</p>
                        <p className="text-xs text-muted-foreground">Return</p>
                      </div>
                      
                      <div className="text-center min-w-[60px]">
                        <p className="text-2xl font-bold">{formatTime(flight.returnFlight.arrival.time)}</p>
                        <p className="text-sm text-muted-foreground">{flight.returnFlight.arrival.airport}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(flight.returnFlight.arrival.date)}</p>
                      </div>
                    </div>
                  )}

                  {/* Flight Info */}
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Plane className="h-3 w-3" />
                      {flight.airline}
                    </span>
                    <span>•</span>
                    <span>{flight.aircraft}</span>
                    <span>•</span>
                    <Badge variant="secondary" className={getCabinClassColor(flight.cabinClass)}>
                      {getCabinClassLabel(flight.cabinClass)}
                    </Badge>
                  </div>
                </div>

                {/* Price and Booking */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      ${flight.price}
                    </p>
                    <p className="text-sm text-muted-foreground">per person</p>
                  </div>
                  
                  <Button 
                    onClick={() => window.open(flight.bookingUrl, '_blank')}
                    className="w-full lg:w-auto"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Search completed at {new Date(data.searchTime).toLocaleTimeString()}</p>
        <p>Showing {data.flights.length} flight{data.flights.length !== 1 ? 's' : ''} sorted by price</p>
      </div>
    </div>
  )
}
