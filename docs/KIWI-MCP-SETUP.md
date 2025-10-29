# Kiwi.com MCP Server Setup Guide

This guide explains how to integrate and use the Kiwi.com MCP server in your chat demonstration application.

## Overview

The Kiwi.com MCP server provides comprehensive flight search capabilities with advanced features like date flexibility, cabin class selection, and real-time pricing. It's designed to complement other travel MCP servers like FerryHopper and Airbnb.

## Features

### ✈️ Flight Search
- **One-way and round-trip flights** with flexible date options
- **Date flexibility** of up to ±3 days to find better deals
- **Multiple cabin classes**: Economy, Premium Economy, Business, First
- **Passenger configuration** for adults, children, and infants
- **Real-time pricing** with direct booking links

### 🏢 Airport Search
- Search airports by name, city, or IATA code
- Comprehensive airport database
- Quick airport lookup for flight planning

### 💰 Cheapest Destinations
- Find the most affordable destinations from any origin
- Price filtering and duration information
- Great for discovering new travel opportunities

### 🔍 Flight Details
- Detailed flight information including segments
- Aircraft type and airline information
- Baggage policies and amenities
- Direct booking integration

## Installation

The Kiwi.com MCP server is already integrated into this application. No additional installation is required.

## Configuration

### MCP Server URL
```
https://mcp.kiwi.com
```

### Required Configuration
```json
{
  "mcpServers": {
    "kiwi-com-flight-search": {
      "url": "https://mcp.kiwi.com"
    }
  }
}
```

## Available Tools

### 1. Search Flights (`kiwi.search_flights`)
Search for flights with comprehensive filtering options.

**Parameters:**
- `origin` (required): Departure airport code or city
- `destination` (required): Arrival airport code or city  
- `departureDate` (required): Departure date in YYYY-MM-DD format
- `returnDate` (optional): Return date for round-trip flights
- `adults` (optional): Number of adult passengers (1-9, default: 1)
- `children` (optional): Number of child passengers (0-9, default: 0)
- `infants` (optional): Number of infant passengers (0-9, default: 0)
- `cabinClass` (optional): Economy, Premium Economy, Business, or First
- `dateFlexibility` (optional): Date flexibility in days (±3 days max)
- `maxStops` (optional): Maximum number of stops (0 for direct flights)
- `sortBy` (optional): Sort by price, duration, or departure time

**Example:**
```javascript
{
  "origin": "JFK",
  "destination": "LHR", 
  "departureDate": "2025-02-15",
  "returnDate": "2025-02-22",
  "adults": 2,
  "cabinClass": "business",
  "dateFlexibility": 1
}
```

### 2. Get Flight Details (`kiwi.get_flight_details`)
Get detailed information about a specific flight.

**Parameters:**
- `flightId` (required): Unique flight identifier from search results
- `passengers` (optional): Passenger configuration object

### 3. Search Airports (`kiwi.search_airports`)
Search for airports by name, city, or IATA code.

**Parameters:**
- `query` (required): Airport name, city, or IATA code
- `limit` (optional): Maximum number of results (default: 10)

### 4. Get Cheapest Destinations (`kiwi.get_cheapest_destinations`)
Find the cheapest destinations from a specific origin.

**Parameters:**
- `origin` (required): Departure airport code or city
- `departureDate` (required): Departure date in YYYY-MM-DD format
- `maxPrice` (optional): Maximum price filter
- `duration` (optional): Trip duration in days

## Usage Examples

### Basic Flight Search
```
"Find me a flight from New York to London on February 15th for 2 adults in business class"
```

### Round-trip with Date Flexibility
```
"Search for round-trip flights from JFK to LHR departing February 15th and returning February 22nd, with ±1 day flexibility"
```

### Airport Lookup
```
"Search for airports in London"
```

### Cheapest Destinations
```
"Show me the cheapest destinations from New York for March 1st, under $500"
```

## UI Components

The integration includes specialized UI components for displaying results:

- **KiwiFlightSearchResults**: Displays flight search results with booking options
- **KiwiAirportSearchResults**: Shows airport search results
- **KiwiCheapestDestinations**: Lists cheapest destinations with pricing

## Testing

Run the test script to verify the integration:

```bash
node scripts/test-kiwi-mcp.js
```

This will test all Kiwi.com MCP tools and display sample results.

## Integration with Other MCP Servers

The Kiwi.com MCP server works seamlessly with other travel MCP servers:

- **FerryHopper**: For ferry connections to destinations
- **Airbnb**: For accommodation at destinations
- **Turkish Airlines**: For specific airline bookings
- **Expedia**: For comprehensive travel planning

## Error Handling

The MCP client includes comprehensive error handling:

- Network timeouts and retries
- Invalid parameter validation
- Graceful fallbacks for missing data
- User-friendly error messages

## Performance Considerations

- Flight searches may take 1-2 seconds due to real-time data
- Airport searches are typically faster (< 500ms)
- Results are cached to improve subsequent searches
- Rate limiting is handled automatically

## Security

- No API keys required (public MCP server)
- All data is transmitted over HTTPS
- No sensitive information is stored locally
- Booking redirects use secure Kiwi.com URLs

## Troubleshooting

### Common Issues

1. **No flights found**: Try adjusting date flexibility or expanding search criteria
2. **Invalid airport codes**: Use the airport search tool to find correct codes
3. **Price discrepancies**: Prices are real-time and may change between searches

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=kiwi-mcp
```

## Support

For issues with the Kiwi.com MCP server:

- **Documentation**: https://mcp-install-instructions.alpic.cloud/servers/kiwi-com-flight-search/readme
- **MCP Server**: https://mcp.kiwi.com
- **Kiwi.com Support**: https://www.kiwi.com/en/help

## Changelog

### v1.0.0
- Initial integration of Kiwi.com MCP server
- Flight search with date flexibility
- Airport search functionality
- Cheapest destinations feature
- Flight details and booking integration
- UI components for all tools
- Comprehensive error handling
