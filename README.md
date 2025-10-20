# Chat MCP Demo - Fast Inference with Cerebras

A demonstration application showcasing how fast inference platforms like Cerebras can accelerate agentic applications using Model Context Protocol (MCP) servers. This demo compares performance between Cerebras, OpenAI, and Anthropic providers while using MCP tools for travel recommendations.

## Features

- 🚀 **Fast Inference Comparison**: Compare Cerebras Llama 3.3 70B with OpenAI GPT-5 and Anthropic Claude Sonnet 4.5
- 🔧 **MCP Server Integration**: Travel recommendation tools via [Expedia MCP server](https://github.com/ExpediaGroup/expedia-travel-recommendations-mcp)
- 💬 **Persistent Chat**: Message persistence with AI SDK 5
- 📊 **Real-time Metrics**: Performance telemetry and comparison dashboard
- 🎯 **Agentic Loop Control**: Multi-step tool calling and conversation management
- 🌐 **Vercel Deployment**: One-click deployment with environment variable management

## Architecture

This demo uses:
- **Frontend**: Next.js 15 with AI SDK 5 and React
- **Backend**: Vercel Edge Functions with AI SDK
- **MCP Integration**: Model Context Protocol for tool calling
- **Providers**: Cerebras (Llama 3.3 70B), OpenAI (GPT-5), Anthropic (Claude Sonnet 4.5)
- **Telemetry**: Custom performance metrics collection

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ChatMCPDemo
npm install
```

### 2. Environment Setup

Copy the environment template and add your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local` with your API keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CEREBRAS_API_KEY=your_cerebras_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## Usage

1. **Start a Conversation**: The app automatically creates a new chat session
2. **Select Provider**: Choose between Cerebras, OpenAI, or Anthropic
3. **Ask Travel Questions**: Try queries like:
   - "I need a hotel in Paris for 2 nights, budget $200/night"
   - "Find activities in Tokyo for a family of 4"
   - "Recommend a romantic getaway in Santorini"
4. **Compare Performance**: Use the metrics panel to see response times and success rates
5. **Switch Providers**: Test the same query with different providers to compare

## MCP Tools

The demo includes travel recommendation tools that can connect to the real [Expedia MCP server](https://github.com/ExpediaGroup/expedia-travel-recommendations-mcp):

- **Hotel Search**: Find accommodations based on location, dates, and budget
- **Activity Recommendations**: Discover local attractions and experiences
- **Flight Search**: Search for flights between destinations
- **Car Rentals**: Find rental car options

### 🔗 Real Expedia Integration

To use the real Expedia MCP server (instead of mock data):

1. **Get an Expedia API Key**: Visit [Expedia Partner Central](https://partner.expedia.com/)
2. **Follow the Setup Guide**: See [docs/EXPEDIA-MCP-SETUP.md](docs/EXPEDIA-MCP-SETUP.md)
3. **Test the Connection**: Run `node scripts/test-expedia-mcp.js`
4. **Update Environment**: Add `EXPEDIA_API_KEY=your_key_here` to `.env.local`

The real integration provides actual hotel prices, availability, and booking information!

## Performance Metrics

The application tracks:
- **Latency**: Average response time per provider
- **Success Rate**: Percentage of successful requests
- **Tool Call Success**: Success rate for MCP tool executions
- **Token Usage**: Average tokens consumed per request

## Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Set Environment Variables**: Add your API keys in Vercel dashboard
3. **Deploy**: One-click deployment with automatic builds

### Manual Deployment

```bash
npm run build
npm start
```

## API Endpoints

- `POST /api/chat` - Chat completion with MCP tools
- `GET /api/metrics` - Performance metrics
- `DELETE /api/metrics` - Clear metrics data

## Development

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── chat/[id]/         # Chat pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── chat-interface.tsx # Main chat UI
│   ├── message-list.tsx   # Message display
│   ├── message-input.tsx  # Input component
│   ├── provider-selector.tsx # Provider selection
│   └── metrics-panel.tsx  # Performance metrics
├── lib/                   # Utilities
│   ├── chat-store.ts      # Message persistence
│   ├── mcp-client.ts      # MCP integration
│   ├── llm-providers.ts   # Provider configuration
│   ├── telemetry.ts       # Metrics collection
│   └── utils.ts           # Helper functions
└── .chats/               # Chat storage (local)
```

### Adding New Providers

1. Add provider configuration in `lib/llm-providers.ts`
2. Update the provider selector component
3. Add API key to environment variables

### Adding New MCP Tools

1. Define tool schema in `lib/mcp-client.ts`
2. Add tool to the `mcpTools` export
3. Update the chat API route to include the tool

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Vercel AI SDK](https://ai-sdk.dev/) for the chat framework
- [Model Context Protocol](https://modelcontextprotocol.io/) for tool integration
- [Expedia MCP Server](https://github.com/ExpediaGroup/expedia-travel-recommendations-mcp) for travel tools inspiration
- [Cerebras](https://www.cerebras.net/) for fast inference capabilities
