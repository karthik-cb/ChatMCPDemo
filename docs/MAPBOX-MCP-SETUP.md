# Mapbox MCP Server Setup Guide

This guide explains how to integrate and use the Mapbox MCP server in your chat demonstration application.

## Overview

The Mapbox MCP server provides powerful geospatial capabilities that enhance your travel planning ecosystem. It offers comprehensive mapping, routing, and location services that complement existing MCP servers like Kiwi.com, FerryHopper, and Airbnb.

## Features

### 🗺️ Static Map Generation
- **Custom map images** with various styles and zoom levels
- **Marker overlays** with custom colors and labels
- **Multiple coordinate support** for route visualization
- **High-resolution output** for detailed maps

### 🛣️ Routing & Directions
- **Multi-waypoint routing** with up to 25 coordinate pairs
- **Multiple travel profiles**: driving (with traffic), walking, cycling
- **Alternative routes** for comparison
- **Real-time traffic** integration
- **Route optimization** and scheduling

### 🔍 Location Services
- **Category-based POI search** (restaurants, hotels, gas stations, etc.)
- **Reverse geocoding** - convert coordinates to addresses
- **Forward geocoding** - convert addresses to coordinates
- **Proximity search** with radius filtering
- **Multi-language support**

### ⏱️ Advanced Analytics
- **Travel time matrices** for multiple points
- **Isochrone analysis** - areas reachable within time/distance
- **Distance calculations** between multiple locations
- **Traffic-aware routing** with departure times

## Installation

The Mapbox MCP server is already integrated into this application. No additional installation is required.

## Configuration

### API Key Setup
Mapbox requires an API key for full functionality:

1. **Get Mapbox Access Token**:
   - Visit [Mapbox Account](https://account.mapbox.com/)
   - Create a free account or sign in
   - Generate an access token (can be custom tokens with different prefixes)
   - Copy your access token

2. **Configure in Settings**:
   - Open Settings → API Keys tab
   - Add `MAPBOX_ACCESS_TOKEN` with your token
   - The system will validate the token by making a test API call to Mapbox Search Box API
   - Status should show "Valid" ✅

**Note**: The system validates tokens by making a real API call to Mapbox, so it works with any valid access token regardless of format (not just tokens starting with "pk.").

## Available Tools

### 1. Static Map Image (`mapbox.static_image`)
Generate static map images with custom styling and markers.

**Parameters:**
- `coordinates` (required): Array of coordinate pairs [longitude, latitude]
- `style` (optional): Map style (default: mapbox/streets-v12)
- `width` (optional): Image width in pixels (default: 600)
- `height` (optional): Image height in pixels (default: 400)
- `zoom` (optional): Zoom level
- `markers` (optional): Array of markers with coordinates, colors, and labels

**Example:**
```javascript
{
  "coordinates": [[-74.0059, 40.7128], [-73.9352, 40.7306]],
  "style": "mapbox/satellite-v9",
  "width": 800,
  "height": 600,
  "zoom": 12,
  "markers": [
    { "coordinates": [-74.0059, 40.7128], "color": "red", "label": "Start" },
    { "coordinates": [-73.9352, 40.7306], "color": "blue", "label": "End" }
  ]
}
```

### 2. Directions (`mapbox.directions`)
Get routing directions between multiple waypoints.

**Parameters:**
- `coordinates` (required): Array of coordinate pairs for waypoints
- `profile` (optional): driving-traffic, driving, walking, cycling
- `alternatives` (optional): Include alternative routes
- `departAt` (optional): Departure time in ISO 8601 format
- `arriveBy` (optional): Desired arrival time
- `geometries` (optional): geojson, polyline, polyline6
- `overview` (optional): full, simplified, false

### 3. Category Search (`mapbox.category_search`)
Search for points of interest by category.

**Parameters:**
- `category` (required): Category to search (restaurant, hotel, gas_station, etc.)
- `coordinates` (optional): Search center coordinates
- `radius` (optional): Search radius in meters
- `limit` (optional): Maximum results (default: 10)
- `language` (optional): Language code

### 4. Reverse Geocoding (`mapbox.reverse_geocoding`)
Convert geographic coordinates to human-readable addresses.

**Parameters:**
- `coordinates` (required): Coordinates [longitude, latitude]
- `types` (optional): Filter by place type
- `language` (optional): Language code
- `limit` (optional): Maximum results (default: 1)

### 5. Travel Time Matrix (`mapbox.matrix`)
Calculate travel times and distances between multiple points.

**Parameters:**
- `coordinates` (required): Array of coordinate pairs
- `profile` (optional): Travel profile
- `departAt` (optional): Departure time
- `approaches` (optional): Control approach for each coordinate
- `bearings` (optional): Range of allowed departure bearings

### 6. Isochrone Analysis (`mapbox.isochrone`)
Compute areas reachable within specified time/distance.

**Parameters:**
- `coordinates` (required): Origin coordinates
- `profile` (optional): Travel profile
- `contours` (required): Array of contour definitions with time/distance
- `departAt` (optional): Departure time

### 7. Search & Geocode (`mapbox.search_geocode`)
Search for places and geocode addresses.

**Parameters:**
- `query` (required): Search query
- `coordinates` (optional): Search center coordinates
- `radius` (optional): Search radius
- `limit` (optional): Maximum results
- `language` (optional): Language code
- `types` (optional): Filter by place type

## Usage Examples

### Basic Map Generation
```
"Generate a map of Manhattan with key landmarks marked"
"Create a map showing the route from JFK Airport to Times Square"
```

### Location Search
```
"Find restaurants within 1 mile of Central Park"
"Search for hotels near the Brooklyn Bridge"
"Find gas stations along Route 66"
```

### Route Planning
```
"Get directions from LAX to Hollywood with traffic"
"Plan a walking route through Central Park"
"Find the fastest cycling route from downtown to the beach"
```

### Advanced Analysis
```
"Show me areas reachable within 30 minutes of downtown Portland by car"
"Calculate travel times between these 3 hotel locations and the convention center"
"Find the optimal route visiting these tourist attractions in San Francisco"
```

## UI Components

The integration includes specialized UI components:

- **MapboxStaticImage**: Displays generated map images with metadata
- **MapboxDirections**: Shows route information with legs and timing
- **MapboxCategorySearch**: Lists POI results with ratings and details
- **JsonViewer**: Fallback for complex data structures

## Integration with Other MCP Servers

Mapbox works seamlessly with other travel MCP servers:

- **Kiwi.com**: Generate maps showing flight routes and destinations
- **FerryHopper**: Map ferry routes and port locations
- **Airbnb**: Show property locations on maps
- **Turkish Airlines**: Visualize flight paths and destinations

## Error Handling

The MCP client includes comprehensive error handling:

- **API key validation** and error messages
- **Rate limiting** and retry logic
- **Invalid coordinate** validation
- **Network timeout** handling
- **Graceful fallbacks** for missing data

## Performance Considerations

- **Static images** are cached for better performance
- **Matrix calculations** may take 2-3 seconds for large datasets
- **Real-time traffic** adds processing time
- **High-resolution images** require more bandwidth

## Security

- **API key protection** - tokens are stored securely
- **HTTPS only** - all requests use secure connections
- **Rate limiting** - prevents abuse
- **Input validation** - coordinates and parameters are validated

## Troubleshooting

### Common Issues

1. **Invalid API key**: Check your Mapbox access token
2. **No results found**: Try expanding search radius or adjusting coordinates
3. **Image generation failed**: Verify coordinates are valid
4. **Rate limit exceeded**: Wait before making more requests

### Debug Mode

Enable debug logging:
```bash
DEBUG=mapbox-mcp
```

## Support

For issues with the Mapbox MCP server:

- **Documentation**: https://github.com/mapbox/mcp-server
- **Mapbox Support**: https://support.mapbox.com/
- **API Documentation**: https://docs.mapbox.com/
- **Status Page**: https://status.mapbox.com/

## Changelog

### v1.0.0
- Initial integration of Mapbox MCP server
- Static map image generation
- Routing and directions
- Category-based POI search
- Reverse geocoding
- Travel time matrices
- Isochrone analysis
- Search and geocoding
- UI components for all tools
- API key management
- Comprehensive error handling

## Benefits for Travel Planning

The Mapbox integration provides significant benefits:

1. **Visual Context**: Generate maps to visualize destinations and routes
2. **Location Intelligence**: Find nearby services and attractions
3. **Route Optimization**: Plan efficient multi-stop itineraries
4. **Accessibility Analysis**: Understand reachable areas from accommodations
5. **Multi-modal Planning**: Combine different transportation methods
6. **Real-time Updates**: Account for traffic and current conditions

This makes your travel planning chat much more comprehensive and visually informative! 🗺️✨
