'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, DollarSign, Clock, Plane, ExternalLink } from 'lucide-react'

interface Destination {
  city: string
  country: string
  price: number
  currency: string
  duration: string
}

interface KiwiCheapestDestinationsProps {
  data: {
    success: boolean
    origin: string
    departureDate: string
    destinations: Destination[]
  }
}

export function KiwiCheapestDestinations({ data }: KiwiCheapestDestinationsProps) {
  if (!data.success || !data.destinations || data.destinations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No destinations found for your search.</p>
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Cheapest Destinations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">From:</span> {data.origin} • 
              <span className="font-medium ml-2">Departure:</span> {formatDate(data.departureDate)}
            </p>
          </div>
          
          <div className="grid gap-3">
            {data.destinations.map((destination, index) => (
              <Card key={`${destination.city}-${index}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {destination.city}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {destination.country}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {destination.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">
                          ${destination.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {destination.currency}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // This would trigger a flight search to this destination
                          console.log(`Search flights to ${destination.city}`)
                        }}
                      >
                        <Plane className="h-3 w-3 mr-1" />
                        Search Flights
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Showing {data.destinations.length} destination{data.destinations.length !== 1 ? 's' : ''} sorted by price</p>
      </div>
    </div>
  )
}
