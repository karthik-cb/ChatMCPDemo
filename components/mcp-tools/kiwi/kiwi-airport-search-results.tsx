'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plane, Search } from 'lucide-react'

interface Airport {
  code: string
  name: string
  city: string
  country: string
}

interface KiwiAirportSearchResultsProps {
  data: {
    success: boolean
    airports: Airport[]
  }
}

export function KiwiAirportSearchResults({ data }: KiwiAirportSearchResultsProps) {
  if (!data.success || !data.airports || data.airports.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No airports found for your search.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Airport Search Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {data.airports.map((airport, index) => (
              <div 
                key={`${airport.code}-${index}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                    <Plane className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {airport.code}
                      </Badge>
                      <h3 className="font-semibold">{airport.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {airport.city}, {airport.country}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">
                    {airport.code}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
