'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Users, 
  Heart,
  Share2,
  Calendar,
  Camera,
  Mountain,
  Palette,
  Utensils,
  ShoppingBag,
  BookOpen,
  Music
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ActivityRecommendationsProps {
  args: {
    location: string
    interests?: string[]
    duration?: string
    budget?: number
  }
  result: {
    activities: Array<{
      id: string
      name: string
      category: string
      rating: number
      price: number
      currency: string
      duration: string
      image: string
      description: string
      location: string
      highlights: string[]
      bookingUrl?: string
      availability: boolean
    }>
    totalResults: number
    searchLocation: string
    recommendedItinerary?: {
      day1: string[]
      day2: string[]
      day3: string[]
    }
  }
}

export default function ActivityRecommendations({ args, result }: ActivityRecommendationsProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const toggleFavorite = (activityId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(activityId)) {
      newFavorites.delete(activityId)
    } else {
      newFavorites.add(activityId)
    }
    setFavorites(newFavorites)
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sightseeing': return <Camera className="w-4 h-4" />
      case 'outdoor': return <Mountain className="w-4 h-4" />
      case 'culture': return <Palette className="w-4 h-4" />
      case 'food': return <Utensils className="w-4 h-4" />
      case 'shopping': return <ShoppingBag className="w-4 h-4" />
      case 'education': return <BookOpen className="w-4 h-4" />
      case 'entertainment': return <Music className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sightseeing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'outdoor': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'culture': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'food': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'shopping': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      case 'education': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'entertainment': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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

  const categories = ['all', ...Array.from(new Set(result.activities.map(a => a.category)))]
  const filteredActivities = selectedCategory === 'all' 
    ? result.activities 
    : result.activities.filter(a => a.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-green-900 dark:text-green-100">
            Activities in {result.searchLocation}
          </h3>
        </div>
        <div className="text-sm text-green-700 dark:text-green-300">
          Found {result.totalResults} activities
          {args.interests && args.interests.length > 0 && (
            <span className="ml-2">
              • Interests: {args.interests.join(', ')}
            </span>
          )}
          {args.duration && (
            <span className="ml-2">• Duration: {args.duration}</span>
          )}
          {args.budget && (
            <span className="ml-2">• Budget: ${args.budget}</span>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category === 'all' ? 'All Activities' : category}
          </button>
        ))}
      </div>

      {/* Recommended Itinerary */}
      {result.recommendedItinerary && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recommended 3-Day Itinerary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Day 1</h5>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {result.recommendedItinerary.day1.map((activity, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Day 2</h5>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {result.recommendedItinerary.day2.map((activity, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Day 3</h5>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {result.recommendedItinerary.day3.map((activity, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Activity Results */}
      <div className="grid gap-4">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className={`border rounded-lg overflow-hidden transition-all duration-200 ${
              selectedActivity === activity.id
                ? 'border-green-500 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
            }`}
          >
            <div className="flex">
              {/* Activity Image */}
              <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/192x128/10b981/ffffff?text=${encodeURIComponent(activity.name)}`
                  }}
                />
              </div>

              {/* Activity Details */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-lg">{activity.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                        {getCategoryIcon(activity.category)}
                        <span className="ml-1">{activity.category}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(activity.rating)}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.rating}/5
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {activity.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleFavorite(activity.id)}
                      className={`p-2 rounded-full transition-colors ${
                        favorites.has(activity.id)
                          ? 'text-red-500 bg-red-50 dark:bg-red-950'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(activity.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {activity.highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                        <DollarSign className="w-5 h-5" />
                        {activity.price}
                      </div>
                      <div className="text-sm text-gray-500">per person</div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.availability ? (
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
                      onClick={() => setSelectedActivity(
                        selectedActivity === activity.id ? null : activity.id
                      )}
                    >
                      {selectedActivity === activity.id ? 'Hide Details' : 'View Details'}
                    </Button>
                    <Button
                      size="sm"
                      disabled={!activity.availability}
                    >
                      {activity.availability ? 'Book Now' : 'Check Availability'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedActivity === activity.id && (
              <div className="border-t bg-gray-50 dark:bg-gray-900 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Location</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.location}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">What's Included</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {activity.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {filteredActivities.length < result.totalResults && (
        <div className="text-center pt-4">
          <Button variant="outline">
            Load More Activities ({result.totalResults - filteredActivities.length} remaining)
          </Button>
        </div>
      )}
    </div>
  )
}
