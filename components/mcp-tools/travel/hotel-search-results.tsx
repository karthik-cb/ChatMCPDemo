'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Star, 
  Wifi, 
  Car, 
  Coffee, 
  Dumbbell, 
  Waves,
  Utensils,
  Heart,
  Share2,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HotelSearchResultsProps {
  args: {
    location: string
    checkIn?: string
    checkOut?: string
    guests?: number
    budget?: number
  }
  result: {
    hotels: Array<{
      id: string
      name: string
      rating: number
      price: number
      currency: string
      image: string
      amenities: string[]
      location: string
      distance: string
      description: string
      availability: boolean
    }>
    totalResults: number
    searchLocation: string
  }
}

export default function HotelSearchResults({ args, result }: HotelSearchResultsProps) {
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFavorite = (hotelId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(hotelId)) {
      newFavorites.delete(hotelId)
    } else {
      newFavorites.add(hotelId)
    }
    setFavorites(newFavorites)
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />
      case 'parking': return <Car className="w-4 h-4" />
      case 'restaurant': return <Utensils className="w-4 h-4" />
      case 'gym': return <Dumbbell className="w-4 h-4" />
      case 'pool': return <Waves className="w-4 h-4" />
      case 'breakfast': return <Coffee className="w-4 h-4" />
      default: return <div className="w-4 h-4 rounded-full bg-gray-300" />
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="space-y-4">
      {/* Search Summary */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Hotels in {result.searchLocation}
          </h3>
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          Found {result.totalResults} hotels
          {args.checkIn && args.checkOut && (
            <span className="ml-2">
              • {args.checkIn} to {args.checkOut}
            </span>
          )}
          {args.guests && (
            <span className="ml-2">• {args.guests} guests</span>
          )}
          {args.budget && (
            <span className="ml-2">• Under ${args.budget}/night</span>
          )}
        </div>
      </div>

      {/* Hotel Results */}
      <div className="grid gap-4">
        {result.hotels.map((hotel) => (
          <div
            key={hotel.id}
            className={`border rounded-lg overflow-hidden transition-all duration-200 ${
              selectedHotel === hotel.id
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
            }`}
          >
            <div className="flex">
              {/* Hotel Image */}
              <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/192x128/6366f1/ffffff?text=${encodeURIComponent(hotel.name)}`
                  }}
                />
              </div>

              {/* Hotel Details */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{hotel.name}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(hotel.rating)}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {hotel.rating}/5
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {hotel.distance} from center
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {hotel.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleFavorite(hotel.id)}
                      className={`p-2 rounded-full transition-colors ${
                        favorites.has(hotel.id)
                          ? 'text-red-500 bg-red-50 dark:bg-red-950'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(hotel.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex items-center gap-4 mb-3">
                  {hotel.amenities.slice(0, 6).map((amenity, index) => (
                    <div key={index} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                  {hotel.amenities.length > 6 && (
                    <span className="text-sm text-gray-500">
                      +{hotel.amenities.length - 6} more
                    </span>
                  )}
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${hotel.price}
                      </div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {hotel.availability ? (
                        <span className="text-green-600 dark:text-green-400">Available</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Limited availability</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedHotel(
                        selectedHotel === hotel.id ? null : hotel.id
                      )}
                    >
                      {selectedHotel === hotel.id ? 'Hide Details' : 'View Details'}
                    </Button>
                    <Button
                      size="sm"
                      disabled={!hotel.availability}
                    >
                      {hotel.availability ? 'Book Now' : 'Check Availability'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedHotel === hotel.id && (
              <div className="border-t bg-gray-50 dark:bg-gray-900 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Location Details</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {hotel.location}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">All Amenities</h5>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {result.hotels.length < result.totalResults && (
        <div className="text-center pt-4">
          <Button variant="outline">
            Load More Hotels ({result.totalResults - result.hotels.length} remaining)
          </Button>
        </div>
      )}
    </div>
  )
}
