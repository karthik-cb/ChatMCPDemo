# ⛴️ Ferryhopper MCP Server Setup Guide

This guide will help you test the MCP integration using the **free Ferryhopper MCP Server** that requires no authentication.

## 🌟 Why Ferryhopper MCP?

- ✅ **Free to use** - No API keys required
- ✅ **No authentication** - Works immediately
- ✅ **Real ferry data** - Live ferry schedules and routes
- ✅ **Perfect for testing** - Ideal for validating MCP integration
- ✅ **European coverage** - 33 countries, 190+ ferry operators

## 🚀 Quick Start

### 1. Test the Connection

```bash
# Test Ferryhopper MCP server
node scripts/test-ferryhopper-mcp.js
```

### 2. Start the Application

```bash
npm run dev
```

### 3. Try Ferry Queries

Ask questions like:
- "What ferries go from Piraeus to Aegina tomorrow?"
- "Find ferries from Ibiza to Barcelona on July 11th"
- "Show me islands within 3 hours of Athens"
- "What ferries depart from Santorini to Mykonos?"

## 🔧 Technical Details

### Available Tools

The Ferryhopper MCP server provides three tools:

1. **`get_ports`** - Get a list of global ports
2. **`search_trips`** - Search for ferry trips between ports
3. **`redirect_to_search_results_page`** - Get booking redirect URLs

### API Endpoints

- **Base URL**: `https://mcp.ferryhopper.com/mcp`
- **Get Ports**: `POST /tools/get_ports`
- **Search Trips**: `POST /tools/search_trips`
- **Redirect**: `POST /tools/redirect_to_search_results_page`

### Example API Calls

#### Get Ports
```bash
curl -X POST https://mcp.ferryhopper.com/mcp/tools/get_ports \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Search Trips
```bash
curl -X POST https://mcp.ferryhopper.com/mcp/tools/search_trips \
  -H "Content-Type: application/json" \
  -d '{
    "departurePort": "Piraeus",
    "arrivalPort": "Aegina", 
    "date": "2025-06-15"
  }'
```

## 🧪 Testing Scenarios

### 1. Greek Islands
- **Piraeus → Aegina**: Classic day trip from Athens
- **Piraeus → Santorini**: Popular tourist route
- **Mykonos → Santorini**: Island hopping

### 2. Spanish Routes
- **Ibiza → Barcelona**: Balearic to mainland
- **Palma → Valencia**: Mallorca to mainland
- **Barcelona → Menorca**: Mainland to Balearics

### 3. Italian Routes
- **Naples → Capri**: Classic day trip
- **Genoa → Corsica**: International route
- **Venice → Croatia**: Adriatic crossing

### 4. French Routes
- **Nice → Corsica**: Mediterranean crossing
- **Marseille → Sardinia**: International ferry
- **Toulon → Corsica**: Alternative route

## 📊 Expected Results

When you ask about ferry routes, you should get:

- **Real ferry schedules** with departure/arrival times
- **Ferry company names** (Blue Star, Hellenic Seaways, etc.)
- **Pricing information** (when available)
- **Vessel details** and journey duration
- **Booking redirect URLs** for completing reservations

## 🔍 Debugging

### Check Tool Availability

```bash
# Test if tools are loaded
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What tools do you have available?"}],
    "provider": "openai"
  }'
```

### Monitor Console Logs

Look for these log messages:
- `Using tools for provider: openai Yes`
- `Available tools: [list of tool names]`
- `ferryhopperGetPorts` or `ferryhopperSearchTrips` in tool calls

### Common Issues

1. **Tools not loading**: Check if provider supports tools (OpenAI/Anthropic)
2. **Network errors**: Verify internet connection
3. **CORS issues**: Ferryhopper server should handle CORS properly
4. **Rate limiting**: Ferryhopper may have usage limits

## 🎯 Integration Benefits

### For Cerebras Showcase

- **Real MCP Integration**: Demonstrates actual MCP server connectivity
- **Live Data**: Shows real ferry schedules and pricing
- **Tool Calling**: Validates AI model's ability to use external tools
- **Performance Comparison**: Compare how fast Cerebras processes ferry queries vs other providers

### For Travel Applications

- **Ferry Planning**: Help users plan island-hopping trips
- **Route Discovery**: Find connections between ports
- **Booking Integration**: Direct users to Ferryhopper for reservations
- **Multi-leg Journeys**: Plan complex ferry itineraries

## 📈 Next Steps

Once Ferryhopper MCP is working:

1. **Test with different providers** (Cerebras, OpenAI, Anthropic)
2. **Compare response times** for ferry queries
3. **Add more MCP servers** (weather, hotels, etc.)
4. **Implement caching** for better performance
5. **Add error handling** for network failures

## 🔗 Resources

- **Ferryhopper MCP Documentation**: [https://ferryhopper.github.io/fh-mcp/](https://ferryhopper.github.io/fh-mcp/)
- **Ferryhopper Website**: [https://www.ferryhopper.com](https://www.ferryhopper.com)
- **Contact**: ferryhapi@ferryhopper.com

## 🎉 Success Indicators

You'll know the integration is working when:

- ✅ Test script runs without errors
- ✅ Chat interface responds to ferry queries
- ✅ AI model calls Ferryhopper tools
- ✅ Real ferry data is returned
- ✅ Booking redirects work properly

The Ferryhopper MCP integration provides a perfect way to test and demonstrate the power of MCP servers with real, live data! 🚢
