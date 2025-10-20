# Airbnb MCP Integration Setup

This document describes how to set up and use the Airbnb MCP (Model Context Protocol) integration in the ChatMCPDemo application.

## Overview

The Airbnb MCP integration allows users to search for Airbnb listings and get detailed information about specific properties directly through the chat interface. This integration uses the [OpenBnB MCP server](https://github.com/openbnb-org/mcp-server-airbnb) to provide real-time access to Airbnb data.

## Features

### 🔍 Airbnb Search
- **Location-based search** with support for cities, states, and regions
- **Google Maps Place ID** integration for precise location targeting
- **Date filtering** with check-in and check-out date support
- **Guest configuration** including adults, children, infants, and pets
- **Price range filtering** with minimum and maximum price constraints
- **Pagination support** for browsing through large result sets

### 🏠 Detailed Property Information
- **Comprehensive listing details** including amenities, policies, and highlights
- **Location information** with coordinates and neighborhood details
- **House rules and policies** for informed booking decisions
- **Property descriptions** and key features
- **Direct links** to Airbnb listings for easy booking

## Installation

The Airbnb MCP integration is already included in the ChatMCPDemo application. No additional installation steps are required.

### Dependencies

The integration uses the following packages:
- `@openbnb/mcp-server-airbnb` - The official Airbnb MCP server
- `@modelcontextprotocol/sdk` - MCP SDK for client communication
- `ai` - AI SDK for tool integration

## Configuration

### MCP Server Configuration

The Airbnb MCP server is configured to run using `npx` with the following settings:

```typescript
const AIRBNB_MCP_COMMAND = 'npx'
const AIRBNB_MCP_ARGS = ['-y', '@openbnb/mcp-server-airbnb']
```

### Environment Variables

No additional environment variables are required for the basic Airbnb MCP integration. The server runs with default settings that respect robots.txt compliance.

### Optional Configuration

To ignore robots.txt for testing purposes, you can modify the MCP args:

```typescript
const AIRBNB_MCP_ARGS = ['-y', '@openbnb/mcp-server-airbnb', '--ignore-robots-txt']
```

## Usage

### Available Tools

The integration provides two main tools:

#### 1. `airbnb.search`
Search for Airbnb listings with comprehensive filtering options.

**Parameters:**
- `location` (required): Location to search (e.g., "San Francisco, CA")
- `placeId` (optional): Google Maps Place ID (overrides location)
- `checkin` (optional): Check-in date in YYYY-MM-DD format
- `checkout` (optional): Check-out date in YYYY-MM-DD format
- `adults` (optional): Number of adults (default: 1)
- `children` (optional): Number of children (default: 0)
- `infants` (optional): Number of infants (default: 0)
- `pets` (optional): Number of pets (default: 0)
- `minPrice` (optional): Minimum price per night
- `maxPrice` (optional): Maximum price per night
- `cursor` (optional): Pagination cursor for browsing results
- `ignoreRobotsText` (optional): Override robots.txt for this request

#### 2. `airbnb.listing_details`
Get detailed information about a specific Airbnb listing.

**Parameters:**
- `id` (required): Airbnb listing ID
- `checkin` (optional): Check-in date in YYYY-MM-DD format
- `checkout` (optional): Check-out date in YYYY-MM-DD format
- `adults` (optional): Number of adults (default: 1)
- `children` (optional): Number of children (default: 0)
- `infants` (optional): Number of infants (default: 0)
- `pets` (optional): Number of pets (default: 0)
- `ignoreRobotsText` (optional): Override robots.txt for this request

### Example Usage

#### Search for Listings
```
User: "Find Airbnb listings in Paris for 2 adults from March 15-20, 2024, budget $100-300 per night"
```

The system will automatically call the `airbnb.search` tool with the appropriate parameters and display the results in a user-friendly format.

#### Get Listing Details
```
User: "Show me details for listing ID 12345678"
```

The system will call the `airbnb.listing_details` tool and display comprehensive information about the specific listing.

## UI Components

### AirbnbSearchResults
Displays search results in a card-based layout with:
- Property images and basic information
- Pricing and ratings
- Amenities and property details
- Direct links to Airbnb for booking

### AirbnbListingDetails
Shows detailed information about a specific listing including:
- Comprehensive property description
- Full amenity list
- House rules and policies
- Host information
- Location details
- High-quality images

## Error Handling

The integration includes comprehensive error handling:

- **MCP Client Initialization**: Falls back to mock data if the MCP server fails to initialize
- **Tool Execution**: Gracefully handles tool execution errors with fallback responses
- **Network Issues**: Provides user-friendly error messages for network-related problems
- **Data Validation**: Validates input parameters and provides helpful error messages

## Mock Data

When the MCP server is unavailable, the integration falls back to realistic mock data that demonstrates the expected functionality. This ensures the application remains functional even when the external service is down.

## Security Considerations

- **Robots.txt Compliance**: The integration respects Airbnb's robots.txt by default
- **Rate Limiting**: Implements appropriate delays to avoid overwhelming Airbnb's servers
- **Data Privacy**: No sensitive user data is stored or transmitted
- **Secure Communication**: Uses secure protocols for MCP communication

## Troubleshooting

### Common Issues

1. **MCP Server Not Starting**
   - Ensure Node.js is installed and `npx` is available
   - Check network connectivity
   - Verify the `@openbnb/mcp-server-airbnb` package is accessible

2. **No Search Results**
   - Verify the location parameter is correctly formatted
   - Check if the search criteria are too restrictive
   - Ensure the MCP server is running properly

3. **Tool Execution Errors**
   - Check the browser console for detailed error messages
   - Verify all required parameters are provided
   - Ensure the MCP server is responding correctly

### Debug Mode

To enable debug logging, set the log level to debug in the application configuration. This will provide detailed information about MCP client initialization and tool execution.

## Testing

Run the test script to verify the integration:

```bash
node scripts/test-airbnb-mcp.js
```

This will test both the search and listing details functionality with mock data.

## Legal and Ethical Considerations

- **Respect Airbnb's Terms of Service**: This integration is for legitimate research and booking assistance
- **Robots.txt Compliance**: The integration respects robots.txt by default
- **Rate Limiting**: Be mindful of request frequency to avoid overwhelming Airbnb's servers
- **Data Usage**: Only extract publicly available information for legitimate purposes

## Support

For issues related to the Airbnb MCP integration:

1. Check the troubleshooting section above
2. Review the [OpenBnB MCP server documentation](https://github.com/openbnb-org/mcp-server-airbnb)
3. Check the application logs for detailed error information
4. Ensure all dependencies are properly installed

## License

This integration uses the OpenBnB MCP server which is licensed under the MIT License. See the [original repository](https://github.com/openbnb-org/mcp-server-airbnb) for details.
