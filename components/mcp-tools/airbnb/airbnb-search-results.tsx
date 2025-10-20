'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Star, MapPin, Users, Bed, Bath, Wifi, Car, Dumbbell, Coffee, WashingMachine } from 'lucide-react'

interface AirbnbListing {
  id: string
  name: string
  price: number
  currency: string
  rating: number
  reviewCount: number
  location: string
  image: string
  amenities: string[]
  host: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  guests: number
  url: string
}

interface AirbnbSearchResultsProps {
  listings: AirbnbListing[]
  searchUrl?: string
  pagination?: {
    hasNext: boolean
    cursor?: string
  }
  onLoadMore?: () => void
}

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-4 h-4" />,
  'Parking': <Car className="w-4 h-4" />,
  'Gym': <Dumbbell className="w-4 h-4" />,
  'Kitchen': <Coffee className="w-4 h-4" />,
  'Washer': <WashingMachine className="w-4 h-4" />,
}

export function AirbnbSearchResults({ 
  listings, 
  searchUrl, 
  pagination, 
  onLoadMore 
}: AirbnbSearchResultsProps) {
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No Airbnb listings found for your search criteria.</p>
        {searchUrl && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.open(searchUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Search on Airbnb
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Found {listings.length} Airbnb listing{listings.length !== 1 ? 's' : ''}
        </h3>
        {searchUrl && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(searchUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Airbnb
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={listing.image}
                alt={listing.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
                }}
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 text-black">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {listing.rating}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-tight line-clamp-2">
                  {listing.name}
                </CardTitle>
                <div className="text-right ml-2">
                  <div className="text-lg font-semibold">
                    ${listing.price}
                    <span className="text-sm text-muted-foreground">/night</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                {listing.location}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {listing.guests} guest{listing.guests !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hosted by {listing.host}</span>
                  <span className="text-muted-foreground">
                    {listing.reviewCount} review{listing.reviewCount !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {listing.amenities.slice(0, 4).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenityIcons[amenity] && (
                        <span className="mr-1">{amenityIcons[amenity]}</span>
                      )}
                      {amenity}
                    </Badge>
                  ))}
                  {listing.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{listing.amenities.length - 4} more
                    </Badge>
                  )}
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => window.open(listing.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Airbnb
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination?.hasNext && onLoadMore && (
        <div className="text-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Results
          </Button>
        </div>
      )}
    </div>
  )
}
