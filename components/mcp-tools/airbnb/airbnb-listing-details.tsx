'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Star, MapPin, Users, Bed, Bath, Wifi, Car, Dumbbell, Coffee, WashingMachine, Shield, Clock, CheckCircle } from 'lucide-react'

interface AirbnbListingDetails {
  id: string
  name: string
  description: string
  price: number
  currency: string
  rating: number
  reviewCount: number
  location: {
    address: string
    coordinates: { lat: number; lng: number }
    neighborhood: string
  }
  images: string[]
  amenities: string[]
  houseRules: string[]
  host: {
    name: string
    avatar: string
    responseRate: number
    responseTime: string
    isSuperhost: boolean
  }
  propertyType: string
  bedrooms: number
  bathrooms: number
  guests: number
  highlights: string[]
  url: string
}

interface AirbnbListingDetailsProps {
  listing: AirbnbListingDetails
}

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-4 h-4" />,
  'Parking': <Car className="w-4 h-4" />,
  'Gym': <Dumbbell className="w-4 h-4" />,
  'Kitchen': <Coffee className="w-4 h-4" />,
  'Washer': <WashingMachine className="w-4 h-4" />,
  'Air conditioning': <Shield className="w-4 h-4" />,
  'Heating': <Shield className="w-4 h-4" />,
  'Dryer': <WashingMachine className="w-4 h-4" />,
}

export function AirbnbListingDetails({ listing }: AirbnbListingDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{listing.name}</h2>
          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{listing.rating}</span>
              <span className="ml-1">({listing.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {listing.location.neighborhood}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">${listing.price}</div>
          <div className="text-muted-foreground">per night</div>
        </div>
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listing.images.slice(0, 4).map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image}
              alt={`${listing.name} - Image ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
              }}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{listing.guests} guest{listing.guests !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  <span>{listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-muted-foreground" />
                  <span>{listing.bathrooms} bathroom{listing.bathrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{listing.propertyType}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About this place</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
            </CardContent>
          </Card>

          {/* Highlights */}
          {listing.highlights && listing.highlights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>What makes this place special</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {listing.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    {amenityIcons[amenity] && (
                      <span className="text-muted-foreground">{amenityIcons[amenity]}</span>
                    )}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* House Rules */}
          <Card>
            <CardHeader>
              <CardTitle>House Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {listing.houseRules.map((rule, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Host Info */}
          <Card>
            <CardHeader>
              <CardTitle>Meet your host</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={listing.host.avatar}
                  alt={listing.host.name}
                  className="w-12 h-12 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
                  }}
                />
                <div>
                  <div className="font-medium">{listing.host.name}</div>
                  {listing.host.isSuperhost && (
                    <Badge variant="secondary" className="text-xs">
                      Superhost
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Response rate: {listing.host.responseRate}%</div>
                <div>Response time: {listing.host.responseTime}</div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <div className="mb-2">{listing.location.address}</div>
                <div className="text-xs">
                  Coordinates: {listing.location.coordinates.lat.toFixed(4)}, {listing.location.coordinates.lng.toFixed(4)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Book Now Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => window.open(listing.url, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Book on Airbnb
          </Button>
        </div>
      </div>
    </div>
  )
}
