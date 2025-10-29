'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Route, Search, Image, Navigation, Target } from 'lucide-react'
import { apiKeyManager } from '@/lib/api-key-manager'

interface MapboxStaticImageProps {
  data: {
    success: boolean
    image: {
      url: string
      width: number
      height: number
      style: string
      zoom: number
      coordinates: number[][]
      markers: Array<{
        coordinates: number[]
        color?: string
        label?: string
      }>
    }
  }
}

export function MapboxStaticImage({ data }: MapboxStaticImageProps) {
  if (!data.success || !data.image) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Failed to generate map image.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Inject Mapbox access token into the provided URL if placeholder is present
  const mapboxToken = typeof window !== 'undefined' ? apiKeyManager.getAPIKey('mapbox') : null
  const resolvedImageUrl = React.useMemo(() => {
    if (!data.image?.url) return ''
    if (data.image.url.includes('YOUR_TOKEN') && mapboxToken) {
      return data.image.url.replace('YOUR_TOKEN', encodeURIComponent(mapboxToken))
    }
    return data.image.url
  }, [data.image?.url, mapboxToken])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Static Map Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Map Image */}
            <div className="border rounded-lg overflow-hidden">
              {resolvedImageUrl ? (
                <img
                  src={resolvedImageUrl}
                  alt="Map"
                  className="w-full h-auto"
                  style={{ maxHeight: '400px' }}
                  onError={(e) => {
                    // Fallback for demo purposes
                    e.currentTarget.src = `https://via.placeholder.com/${data.image.width}x${data.image.height}/f0f0f0/666666?text=Map+Image+(${data.image.width}x${data.image.height})`
                  }}
                />
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Map image URL is unavailable.
                </div>
              )}
            </div>

            {/* Token hint if missing */}
            {!mapboxToken && data.image.url?.includes('YOUR_TOKEN') && (
              <div className="text-xs text-amber-600">
                Mapbox token not set. Add `MAPBOX_ACCESS_TOKEN` in Settings → API Keys to render the image.
              </div>
            )}

            {/* Map Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dimensions:</span>
                <p className="font-medium">{data.image.width} × {data.image.height}px</p>
              </div>
              <div>
                <span className="text-muted-foreground">Style:</span>
                <p className="font-medium">{data.image.style}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Zoom:</span>
                <p className="font-medium">{data.image.zoom}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Markers:</span>
                <p className="font-medium">{data.image.markers.length}</p>
              </div>
            </div>

            {/* Markers */}
            {data.image.markers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Markers</h4>
                <div className="space-y-2">
                  {data.image.markers.map((marker, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: marker.color || '#3b82f6' }}
                      />
                      <span>{marker.label || `Marker ${index + 1}`}</span>
                      <span className="text-muted-foreground">
                        ({marker.coordinates[0].toFixed(4)}, {marker.coordinates[1].toFixed(4)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coordinates */}
            <div>
              <h4 className="font-medium mb-2">Coordinates</h4>
              <div className="space-y-1">
                {data.image.coordinates.map((coord, index) => (
                  <div key={index} className="text-sm font-mono bg-muted/50 p-2 rounded">
                    [{coord[0].toFixed(6)}, {coord[1].toFixed(6)}]
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
