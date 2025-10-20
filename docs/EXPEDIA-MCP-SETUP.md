# 🌍 Expedia MCP Server Setup Guide

This guide will help you connect the ChatMCPDemo to the real Expedia Travel Recommendations MCP Server.

## 📋 Prerequisites

1. **Python 3.11+** installed on your system
2. **Expedia API Key** (see steps below)
3. **uv** package manager (for running the MCP server)

## 🔑 Getting Your Expedia API Key

### Step 1: Visit Expedia Partner Central
1. Go to [Expedia Partner Central](https://partner.expedia.com/)
2. Sign up for a developer account or log in if you already have one
3. Navigate to the API section

### Step 2: Request API Access
1. Look for "Travel Recommendations API" or "Expedia API"
2. Submit an application for API access
3. Wait for approval (this may take a few business days)

### Step 3: Get Your API Key
1. Once approved, you'll receive your API key
2. Copy the key - you'll need it for the next steps

## 🛠 Installation & Setup

### Step 1: Install uv (if not already installed)
```bash
# On macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Step 2: Install the Expedia MCP Server
```bash
# Install the Expedia MCP server package
uvx expedia_travel_recommendations_mcp --help
```

### Step 3: Set Environment Variables
Create a `.env.local` file in your project root:

```bash
# .env.local
EXPEDIA_API_KEY=your_actual_expedia_api_key_here
```

### Step 4: Test the MCP Server Connection
```bash
# Test the MCP server with stdio protocol
export EXPEDIA_API_KEY="your_api_key_here"
uvx expedia_travel_recommendations_mcp --protocol "stdio"
```

## 🔧 Integration with ChatMCPDemo

### Option 1: Use Real Expedia MCP (Recommended)

1. **Update the chat API route** to use real MCP tools:

```typescript
// app/api/chat/route.ts
import { expediaMCPTools } from '@/lib/expedia-mcp-client'

// Add tools to the streamText call
const result = await streamText({
  model: modelInstance as any,
  messages: validatedMessages,
  tools: {
    expediaHotelSearch: expediaMCPTools.hotelSearch,
    expediaActivitySearch: expediaMCPTools.activitySearch,
    expediaFlightSearch: expediaMCPTools.flightSearch,
    expediaCarRental: expediaMCPTools.carRental,
  },
  // ... other options
})
```

### Option 2: Use HTTP Protocol (Alternative)

If you prefer to run the MCP server as a separate HTTP service:

1. **Start the HTTP MCP server**:
```bash
export EXPEDIA_API_KEY="your_api_key_here"
uvx expedia_travel_recommendations_mcp --protocol "streamable-http"
```

2. **Update MCP client configuration**:
```typescript
// lib/expedia-mcp-http-client.ts
const EXPEDIA_MCP_HTTP_URL = 'http://localhost:9900/mcp'

// Use HTTP client instead of stdio
```

## 🧪 Testing the Integration

### Test Hotel Search
```bash
curl -X POST http://localhost:9900/expedia/hotels \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "destination": "Seattle",
      "check_in": "2025-05-01",
      "check_out": "2025-05-05",
      "property_types": ["HOTEL", "RESORT"],
      "amenities": ["POOL", "SPA"],
      "guest_rating": "WONDERFUL",
      "sort_type": "CHEAPEST"
    }
  }'
```

### Test in Chat Interface
1. Start your Next.js app: `npm run dev`
2. Ask: "Find hotels in Seattle for May 1-5, 2025"
3. The AI should now use the real Expedia MCP server

## 🔍 Troubleshooting

### Common Issues

1. **"EXPEDIA_API_KEY not found"**
   - Ensure your `.env.local` file exists and contains the API key
   - Restart your development server after adding the key

2. **"Failed to connect to MCP server"**
   - Check if `uvx` is installed: `uvx --version`
   - Verify the Expedia MCP package: `uvx expedia_travel_recommendations_mcp --help`
   - Check your API key is valid

3. **"Tool not found" errors**
   - Ensure the MCP server is running
   - Check the tool names match exactly: `expedia_hotels`, `expedia_activities`, etc.

4. **Rate limiting errors**
   - Expedia API has rate limits
   - Implement retry logic with exponential backoff
   - Consider caching responses

### Debug Mode

Enable debug logging:
```bash
DEBUG=mcp:* npm run dev
```

## 📊 API Endpoints Available

When using the HTTP protocol, these endpoints are available:

- `POST /expedia/hotels` → Hotel recommendations
- `POST /expedia/flights` → Flight recommendations  
- `POST /expedia/activities` → Activity recommendations
- `POST /expedia/cars` → Car rental recommendations

## 🔐 Security Notes

1. **Never commit your API key** to version control
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** in production
4. **Add error handling** for API failures
5. **Consider caching** to reduce API calls

## 📈 Performance Optimization

1. **Cache responses** for repeated queries
2. **Implement pagination** for large result sets
3. **Use connection pooling** for HTTP clients
4. **Add request timeouts** to prevent hanging requests

## 🆘 Support

- **Expedia API Documentation**: [Partner Central](https://partner.expedia.com/)
- **MCP Server Issues**: [GitHub Repository](https://github.com/ExpediaGroup/expedia-travel-recommendations-mcp)
- **ChatMCPDemo Issues**: Create an issue in this repository

---

## 🎯 Next Steps

Once you have the Expedia MCP server working:

1. **Test all travel tools** (hotels, flights, activities, cars)
2. **Customize the UI components** to match Expedia's data format
3. **Add error handling** for API failures
4. **Implement caching** for better performance
5. **Add more MCP servers** (other travel providers, weather, etc.)

The real Expedia integration will provide actual hotel prices, availability, and booking information, making your demo much more compelling! 🚀
