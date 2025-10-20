'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Plane, 
  Hotel, 
  Car,
  Utensils,
  Camera,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Share2,
  Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TravelPlanningSummaryProps {
  args: {
    destination: string
    startDate: string
    endDate: string
    travelers: number
    interests?: string[]
    budget?: number
  }
  result: {
    destination: string
    tripDuration: number
    totalBudget: number
    breakdown: {
      flights: { cost: number; details: string }
      accommodation: { cost: number; details: string }
      activities: { cost: number; details: string }
      food: { cost: number; details: string }
      transportation: { cost: number; details: string }
      miscellaneous: { cost: number; details: string }
    }
    itinerary: Array<{
      day: number
      date: string
      activities: Array<{
        time: string
        activity: string
        location: string
        cost: number
        duration: string
        type: 'flight' | 'hotel' | 'activity' | 'food' | 'transport'
      }>
    }>
    recommendations: {
      bestTimeToVisit: string
      weather: string
      currency: string
      language: string
      visaRequirements: string
      healthRecommendations: string
    }
    bookingLinks: {
      flights: string
      hotels: string
      activities: string
    }
  }
}

export default function TravelPlanningSummary({ args, result }: TravelPlanningSummaryProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'budget' | 'tips'>('overview')
  const [selectedDay, setSelectedDay] = useState<number>(1)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="w-4 h-4" />
      case 'hotel': return <Hotel className="w-4 h-4" />
      case 'activity': return <Camera className="w-4 h-4" />
      case 'food': return <Utensils className="w-4 h-4" />
      case 'transport': return <Car className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'flight': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'hotel': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'activity': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'food': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'transport': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'tips', label: 'Travel Tips', icon: CheckCircle }
  ]

  const selectedDayData = result.itinerary.find(day => day.day === selectedDay)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
              {result.destination} Travel Plan
            </h2>
            <div className="flex items-center gap-4 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {args.startDate} - {args.endDate}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {args.travelers} travelers
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {result.tripDuration} days
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${result.totalBudget.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Budget</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share Plan
          </Button>
          <Button variant="outline" size="sm">
            <Edit3 className="w-4 h-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-4 text-center">
              <Plane className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">${result.breakdown.flights.cost}</div>
              <div className="text-sm text-muted-foreground">Flights</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <Hotel className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">${result.breakdown.accommodation.cost}</div>
              <div className="text-sm text-muted-foreground">Accommodation</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <Camera className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">${result.breakdown.activities.cost}</div>
              <div className="text-sm text-muted-foreground">Activities</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <Utensils className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">${result.breakdown.food.cost}</div>
              <div className="text-sm text-muted-foreground">Food</div>
            </div>
          </div>

          {/* Travel Recommendations */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Travel Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Best Time to Visit:</span>
                  <span className="text-sm text-muted-foreground">{result.recommendations.bestTimeToVisit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Weather:</span>
                  <span className="text-sm text-muted-foreground">{result.recommendations.weather}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Currency:</span>
                  <span className="text-sm text-muted-foreground">{result.recommendations.currency}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Language:</span>
                  <span className="text-sm text-muted-foreground">{result.recommendations.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Visa:</span>
                  <span className="text-sm text-muted-foreground">{result.recommendations.visaRequirements}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Health:</span>
                  <span className="text-sm text-muted-foreground">{result.recommendations.healthRecommendations}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'itinerary' && (
        <div className="space-y-6">
          {/* Day Selector */}
          <div className="flex flex-wrap gap-2">
            {result.itinerary.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDay === day.day
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>

          {/* Day Itinerary */}
          {selectedDayData && (
            <div className="bg-card border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">
                Day {selectedDayData.day} - {selectedDayData.date}
              </h3>
              <div className="space-y-4">
                {selectedDayData.activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{activity.activity}</h4>
                        <span className="text-sm text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{activity.location}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Duration: {activity.duration}</span>
                        <span>Cost: ${activity.cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Budget Breakdown */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Budget Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(result.breakdown).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      {getActivityIcon(category)}
                    </div>
                    <div>
                      <h4 className="font-medium capitalize">{category}</h4>
                      <p className="text-sm text-muted-foreground">{data.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">${data.cost.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {((data.cost / result.totalBudget) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Links */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Quick Booking</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="w-full" variant="outline">
                <Plane className="w-4 h-4 mr-2" />
                Book Flights
              </Button>
              <Button className="w-full" variant="outline">
                <Hotel className="w-4 h-4 mr-2" />
                Book Hotels
              </Button>
              <Button className="w-full" variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Book Activities
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="space-y-6">
          {/* Travel Tips */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Essential Travel Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 text-green-600 dark:text-green-400">Before You Go</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check visa requirements and passport validity</li>
                  <li>• Get travel insurance</li>
                  <li>• Download offline maps and translation apps</li>
                  <li>• Notify your bank about travel plans</li>
                  <li>• Pack appropriate clothing for the weather</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-blue-600 dark:text-blue-400">During Your Trip</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep copies of important documents</li>
                  <li>• Stay hydrated and eat local cuisine</li>
                  <li>• Respect local customs and traditions</li>
                  <li>• Keep emergency contacts handy</li>
                  <li>• Take lots of photos and enjoy the experience!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Emergency Information */}
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Emergency Information</h4>
            <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <p>• Emergency Services: 911 (or local equivalent)</p>
              <p>• Embassy/Consulate: Check your country's embassy website</p>
              <p>• Travel Insurance: Keep policy number and contact info handy</p>
              <p>• Medical: Research local hospitals and pharmacies</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
