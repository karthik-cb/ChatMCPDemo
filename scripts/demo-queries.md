# Demo Queries for Chat MCP Demo

Use these sample queries to test the different LLM providers and MCP tool integration:

## Travel Planning Queries

### Hotel Recommendations
- "I need a hotel in Paris for 2 nights, budget $200/night, for 2 guests"
- "Find me a luxury resort in Santorini for a honeymoon, 3 nights"
- "Recommend budget-friendly hotels in Tokyo for a family of 4"

### Activity Suggestions
- "What activities can I do in Rome for 3 days?"
- "Find family-friendly activities in Orlando, Florida"
- "Suggest romantic activities for couples in Venice"

### Complete Travel Planning
- "Plan a 5-day trip to Barcelona including hotels and activities"
- "I want to visit Japan for 10 days, help me plan the itinerary"
- "Create a weekend getaway plan for New York City"

## Performance Testing Queries

### Simple Queries (for latency comparison)
- "Hello, how are you?"
- "What's the weather like today?"
- "Tell me a joke"

### Complex Queries (for tool calling comparison)
- "I need travel recommendations for a business trip to London next week"
- "Find me the best hotels and restaurants in San Francisco for a tech conference"
- "Plan a cultural tour of Italy including accommodations and local experiences"

## Provider Comparison Workflow

1. **Start with Cerebras**: Ask a travel question and note the response time
2. **Switch to OpenAI**: Ask the same question and compare
3. **Try Anthropic**: Repeat the same query
4. **Check Metrics**: Use the metrics panel to see performance differences
5. **Repeat**: Try different types of queries to get comprehensive data

## Expected Results

- **Cerebras**: Should show faster response times (typically 2-5x faster)
- **OpenAI**: Good quality responses with moderate latency
- **Anthropic**: High-quality responses with similar latency to OpenAI
- **Tool Calls**: All providers should successfully use MCP tools for travel recommendations

## Troubleshooting

If you encounter issues:
1. Check that all API keys are properly set in `.env.local`
2. Verify the MCP tools are working by looking for tool call indicators in the chat
3. Check the metrics panel for error rates
4. Try simpler queries first to test basic functionality
