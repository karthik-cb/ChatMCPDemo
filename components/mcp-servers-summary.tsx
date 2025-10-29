'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, CheckCircle, AlertCircle, Info, Key, Globe, Zap, Home, Plane, Car, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiKeyManager, type ProviderConfig } from '@/lib/api-key-manager'

interface MCPServerInfo {
  id: string
  name: string
  description: string
  category: 'travel' | 'productivity' | 'generic'
  status: 'enabled' | 'disabled' | 'requires_key'
  apiKeyRequired: boolean
  apiKeyName?: string
  documentationUrl: string
  features: string[]
  tools: {
    name: string
    description: string
  }[]
  icon: React.ReactNode
  color: string
}

const mcpServers: MCPServerInfo[] = [
  {
    id: 'turkish-airlines',
    name: 'Turkish Airlines MCP',
    description: 'Real-time access to Turkish Airlines services including flight search, booking management, and personalized travel experiences',
    category: 'travel',
    status: 'requires_key',
    apiKeyRequired: true,
    apiKeyName: 'TURKISH_AIRLINES_ACCOUNT',
    documentationUrl: 'https://mcp.turkishtechlab.com',
    features: [
      'Flight search and status',
      'Booking management',
      'Check-in services',
      'Baggage information',
      'Miles&Smiles integration',
      'Personalized recommendations',
      'Travel guides and promotions'
    ],
    tools: [
      { name: 'Search Flights', description: 'Search Turkish Airlines flights by origin, destination, and dates' },
      { name: 'Flight Status', description: 'Get real-time flight status by number or route' },
      { name: 'Booking Details', description: 'Retrieve booking information using PNR and surname' },
      { name: 'Member Services', description: 'Access Miles&Smiles profile and flight history' }
    ],
    icon: <Plane className="w-6 h-6" />,
    color: 'bg-red-500'
  },
  {
    id: 'expedia',
    name: 'Expedia Travel Recommendations',
    description: 'Comprehensive travel recommendations including hotels, flights, activities, and car rentals',
    category: 'travel',
    status: 'requires_key',
    apiKeyRequired: true,
    apiKeyName: 'EXPEDIA_API_KEY',
    documentationUrl: 'https://github.com/ExpediaGroup/expedia-travel-recommendations-mcp',
    features: [
      'Hotel search and booking',
      'Flight recommendations',
      'Activity suggestions',
      'Car rental options',
      'Real-time pricing',
      'Comprehensive travel planning'
    ],
    tools: [
      { name: 'Hotel Search', description: 'Find hotels based on location, dates, and preferences' },
      { name: 'Activity Recommendations', description: 'Get personalized activity suggestions' },
      { name: 'Travel Planning', description: 'Comprehensive travel planning with itinerary suggestions' }
    ],
    icon: <Plane className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  {
    id: 'ferryhopper',
    name: 'Ferryhopper Ferry Routes',
    description: 'Real-time ferry schedules and routes across 33 countries with 190+ ferry operators',
    category: 'travel',
    status: 'enabled',
    apiKeyRequired: false,
    documentationUrl: 'https://ferryhopper.github.io/fh-mcp/',
    features: [
      'Free to use',
      'No API key required',
      'Real ferry schedules',
      'European coverage',
      'Booking redirects',
      'Multi-leg journey planning'
    ],
    tools: [
      { name: 'Get Ports', description: 'Get a list of global ferry ports and their details' },
      { name: 'Search Ferry Trips', description: 'Search for available ferry trips between ports' },
      { name: 'Redirect to Booking', description: 'Get redirection URLs to Ferryhopper booking page' }
    ],
    icon: <Globe className="w-6 h-6" />,
    color: 'bg-green-500'
  },
  {
    id: 'airbnb',
    name: 'Airbnb Listings',
    description: 'Search and explore Airbnb listings with comprehensive filtering and detailed property information',
    category: 'travel',
    status: 'enabled',
    apiKeyRequired: false,
    documentationUrl: 'https://github.com/openbnb-org/mcp-server-airbnb',
    features: [
      'Location-based search',
      'Google Maps integration',
      'Date filtering',
      'Guest configuration',
      'Price range filtering',
      'Detailed property information'
    ],
    tools: [
      { name: 'Airbnb Search', description: 'Search for Airbnb listings with comprehensive filtering' },
      { name: 'Listing Details', description: 'Get detailed information about specific Airbnb listings' }
    ],
    icon: <Home className="w-6 h-6" />,
    color: 'bg-pink-500'
  },
  {
    id: 'kiwi',
    name: 'Kiwi.com Flight Search',
    description: 'Comprehensive flight search with flexible date options, cabin class selection, and real-time pricing',
    category: 'travel',
    status: 'enabled',
    apiKeyRequired: false,
    documentationUrl: 'https://mcp-install-instructions.alpic.cloud/servers/kiwi-com-flight-search/readme',
    features: [
      'One-way and round-trip flights',
      'Date flexibility (±3 days)',
      'Multiple cabin classes',
      'Passenger configuration',
      'Airport search',
      'Cheapest destinations',
      'Direct booking links'
    ],
    tools: [
      { name: 'Search Flights', description: 'Search for flights with comprehensive options and date flexibility' },
      { name: 'Get Flight Details', description: 'Get detailed information about specific flights' },
      { name: 'Search Airports', description: 'Search for airports by name, city, or IATA code' },
      { name: 'Cheapest Destinations', description: 'Find the cheapest destinations from a specific origin' }
    ],
    icon: <Plane className="w-6 h-6" />,
    color: 'bg-orange-500'
  },
  {
    id: 'mapbox',
    name: 'Mapbox Geospatial Services',
    description: 'Powerful geospatial tools for mapping, routing, and location services',
    category: 'travel',
    status: 'requires_key',
    apiKeyRequired: true,
    apiKeyName: 'MAPBOX_ACCESS_TOKEN',
    documentationUrl: 'https://github.com/mapbox/mcp-server',
    features: [
      'Static map generation',
      'Routing and directions',
      'Category-based POI search',
      'Reverse geocoding',
      'Travel time matrices',
      'Isochrone analysis',
      'Address geocoding'
    ],
    tools: [
      { name: 'Static Map Image', description: 'Generate static map images with custom styling and markers' },
      { name: 'Directions', description: 'Get routing directions between multiple waypoints' },
      { name: 'Category Search', description: 'Search for points of interest by category' },
      { name: 'Reverse Geocoding', description: 'Convert coordinates to human-readable addresses' },
      { name: 'Travel Time Matrix', description: 'Calculate travel times between multiple points' },
      { name: 'Isochrone Analysis', description: 'Compute reachable areas within time/distance' },
      { name: 'Search & Geocode', description: 'Search for places and geocode addresses' }
    ],
    icon: <MapPin className="w-6 h-6" />,
    color: 'bg-green-500'
  }
]

interface MCPServersSummaryProps {
  onApiKeyUpdate?: (configs: Record<string, ProviderConfig>) => void
}

export default function MCPServersSummary({ onApiKeyUpdate }: MCPServersSummaryProps) {
  const [apiKeys, setApiKeys] = useState<Record<string, ProviderConfig>>({})
  const [showApiKeyManager, setShowApiKeyManager] = useState(false)

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = () => {
    const configs = apiKeyManager.getStoredConfigs()
    setApiKeys(configs)
    onApiKeyUpdate?.(configs)
  }

  const getServerStatus = (server: MCPServerInfo) => {
    if (!server.apiKeyRequired) {
      return { status: 'enabled', message: 'Ready to use' }
    }

    // Map server ID to provider name for API key lookup
    const providerMap: Record<string, string> = {
      'turkish-airlines': 'turkish-airlines',
      'expedia': 'expedia',
      'mapbox': 'mapbox'
    }
    
    const providerName = providerMap[server.id]
    const hasApiKey = providerName && apiKeys[providerName]?.apiKey
    
    if (hasApiKey) {
      const validationStatus = apiKeys[providerName]?.validationStatus
      if (validationStatus === 'valid') {
        if (server.id === 'turkish-airlines') {
          return { status: 'enabled', message: 'Miles&Smiles account configured - OAuth required for full access' }
        }
        return { status: 'enabled', message: 'API key configured and valid' }
      } else if (validationStatus === 'invalid') {
        return { status: 'disabled', message: 'API key is invalid' }
      } else {
        return { status: 'disabled', message: 'API key needs validation' }
      }
    }

    if (server.id === 'turkish-airlines') {
      return { status: 'disabled', message: 'Miles&Smiles account required' }
    }
    return { status: 'disabled', message: 'API key required' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'disabled':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enabled':
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case 'disabled':
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">MCP Servers Overview</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and monitor your Model Context Protocol server integrations
        </p>
      </div>

      {/* API Key Management Toggle */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowApiKeyManager(!showApiKeyManager)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Key className="w-4 h-4" />
          {showApiKeyManager ? 'Hide' : 'Show'} API Key Manager
        </Button>
      </div>

      {/* API Key Manager */}
      {showApiKeyManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Key Configuration
            </CardTitle>
            <CardDescription>
              Configure API keys for MCP servers that require authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mcpServers
                .filter(server => server.apiKeyRequired)
                .map(server => {
                  // Map server ID to provider name for API key lookup
                  const providerMap: Record<string, string> = {
                    'turkish-airlines': 'turkish-airlines',
                    'expedia': 'expedia',
                    'mapbox': 'mapbox'
                  }
                  const providerName = providerMap[server.id]
                  const config = providerName ? apiKeys[providerName] : null
                  const hasKey = !!config?.apiKey
                  
                  return (
                    <div key={server.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${server.color} text-white`}>
                          {server.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{server.name}</h4>
                          <p className="text-sm text-gray-500">
                            {server.apiKeyName} {hasKey ? '✓ Configured' : '✗ Missing'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasKey ? (
                          <Badge variant="default" className="bg-green-500">
                            Configured
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Missing
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MCP Servers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mcpServers.map(server => {
          const serverStatus = getServerStatus(server)
          
          // Map server ID to provider name for API key lookup
          const providerMap: Record<string, string> = {
            'turkish-airlines': 'turkish-airlines',
            'expedia': 'expedia',
            'mapbox': 'mapbox'
          }
          const providerName = providerMap[server.id]
          
          return (
            <Card key={server.id} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${server.color} text-white`}>
                      {server.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{server.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {server.category.charAt(0).toUpperCase() + server.category.slice(1)} • MCP Server
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(serverStatus.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {server.description}
                </p>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(serverStatus.status)}
                  <span className="text-sm font-medium">{serverStatus.message}</span>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {server.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {server.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{server.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Tools */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Available Tools</h4>
                  <div className="space-y-1">
                    {server.tools.map((tool, index) => (
                      <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{tool.name}:</span> {tool.description}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(server.documentationUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Docs
                  </Button>
                  
                  {server.apiKeyRequired && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowApiKeyManager(true)}
                    >
                      <Key className="w-4 h-4 mr-1" />
                      {providerName && apiKeys[providerName]?.apiKey ? 'Manage' : 'Setup'}
                    </Button>
                  )}
                </div>

                {/* Special note for Turkish Airlines */}
                {server.id === 'turkish-airlines' && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>Note:</strong> This MCP server uses OAuth authentication. 
                      Configure your Miles&Smiles account number here, but full authentication 
                      happens when connecting to the actual MCP server.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Integration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {mcpServers.filter(s => getServerStatus(s).status === 'enabled').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Servers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {mcpServers.reduce((acc, s) => acc + s.tools.length, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {mcpServers.filter(s => s.category === 'travel').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Travel Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {mcpServers.filter(s => !s.apiKeyRequired).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Free Services</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
