'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Route, Search } from 'lucide-react'

interface MapboxDirectionsProps {
  data: {
    success: boolean
    routes: Array<{
      duration: number
      distance: number
      geometry: {
        type: string
        coordinates: number[][]
      }
      legs: Array<{
        duration: number
        distance: number
        summary: string
        steps: any[]
      }>
    }>
    waypoints: number[][]
    profile: string
    alternatives: boolean
  }
}

export function MapboxDirections({ data }: MapboxDirectionsProps) {
  if (!data.success || !data.routes || data.routes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No routes found.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${meters} m`
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Directions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Route Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Profile:</span>
                <p className="font-medium capitalize">{data.profile.replace('-', ' ')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Waypoints:</span>
                <p className="font-medium">{data.waypoints.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Alternatives:</span>
                <p className="font-medium">{data.alternatives ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Routes:</span>
                <p className="font-medium">{data.routes.length}</p>
              </div>
            </div>

            {/* Routes */}
            <div className="space-y-3">
              {data.routes.map((route, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">
                        Route {index + 1}
                      </h4>
                      <Badge variant="secondary">
                        {data.profile.replace('-', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="text-muted-foreground">Duration:</span> {formatDuration(route.duration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="text-muted-foreground">Distance:</span> {formatDistance(route.distance)}
                        </span>
                      </div>
                    </div>

                    {/* Route Legs */}
                    {route.legs.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Route Legs</h5>
                        <div className="space-y-2">
                          {route.legs.map((leg, legIndex) => (
                            <div key={legIndex} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                              <span>{leg.summary}</span>
                              <div className="flex items-center gap-4 text-muted-foreground">
                                <span>{formatDuration(leg.duration)}</span>
                                <span>{formatDistance(leg.distance)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coordinates */}
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Route Coordinates</h5>
                      <div className="text-xs font-mono bg-muted/50 p-2 rounded max-h-32 overflow-y-auto">
                        {route.geometry.coordinates.map((coord, coordIndex) => (
                          <div key={coordIndex}>
                            [{coord[0].toFixed(6)}, {coord[1].toFixed(6)}]
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Waypoints */}
            <div>
              <h4 className="font-medium mb-2">Waypoints</h4>
              <div className="space-y-1">
                {data.waypoints.map((waypoint, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-mono">
                      [{waypoint[0].toFixed(6)}, {waypoint[1].toFixed(6)}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
