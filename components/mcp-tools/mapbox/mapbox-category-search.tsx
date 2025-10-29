'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Search, Star, Clock, Navigation } from 'lucide-react'

interface MapboxCategorySearchProps {
  data: {
    success: boolean
    results: Array<{
      name: string
      coordinates: number[]
      address: string
      rating?: number
      cuisine?: string
      price?: string
    }>
    category: string
    coordinates?: number[]
    radius?: number
  }
}

export function MapboxCategorySearch({ data }: MapboxCategorySearchProps) {
  if (!data.success || !data.results || data.results.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No results found for "{data.category}".</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'restaurant':
        return '🍽️'
      case 'hotel':
        return '🏨'
      case 'gas_station':
        return '⛽'
      case 'shopping':
        return '🛍️'
      case 'entertainment':
        return '🎭'
      default:
        return '📍'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'restaurant':
        return 'bg-orange-100 text-orange-800'
      case 'hotel':
        return 'bg-blue-100 text-blue-800'
      case 'gas_station':
        return 'bg-yellow-100 text-yellow-800'
      case 'shopping':
        return 'bg-pink-100 text-pink-800'
      case 'entertainment':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Category Search Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Summary */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(data.category)}</span>
                <Badge className={getCategoryColor(data.category)}>
                  {data.category.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Found:</span>
                <span className="font-medium ml-1">{data.results.length} results</span>
              </div>
              {data.radius && (
                <div>
                  <span className="text-muted-foreground">Within:</span>
                  <span className="font-medium ml-1">{data.radius}m radius</span>
                </div>
              )}
            </div>

            {/* Results */}
            <div className="space-y-3">
              {data.results.map((result, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{result.name}</h4>
                          {result.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{result.rating}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {result.address}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="font-mono">
                              {result.coordinates[0].toFixed(4)}, {result.coordinates[1].toFixed(4)}
                            </span>
                          </div>
                          {result.cuisine && (
                            <Badge variant="outline" className="text-xs">
                              {result.cuisine}
                            </Badge>
                          )}
                          {result.price && (
                            <span className="text-green-600 font-medium">
                              {result.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search Center */}
            {data.coordinates && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Search Center</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">
                    [{data.coordinates[0].toFixed(6)}, {data.coordinates[1].toFixed(6)}]
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
