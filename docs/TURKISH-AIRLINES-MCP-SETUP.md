# ✈️ Turkish Airlines MCP Server Setup Guide

This guide will help you integrate the Turkish Airlines MCP server into your ChatMCPDemo application, providing access to real-time flight information, booking management, and personalized travel services.

## 🌟 Why Turkish Airlines MCP?

- ✅ **Real-time flight data** - Live flight status, schedules, and availability
- ✅ **Booking management** - Access to booking details, check-in, and baggage information
- ✅ **Personalized services** - Miles&Smiles integration with member profiles and flight history
- ✅ **13 powerful tools** - Comprehensive suite of airline services
- ✅ **Enterprise-grade security** - OAuth 2.0 authentication and cloud-native infrastructure

## 📋 Prerequisites

1. **Miles&Smiles Account** - Required for full access to personalized features
2. **Internet Connection** - For real-time data access
3. **Claude Pro Plan** (optional) - For direct integration via Claude.ai

## 🔑 Getting Your Miles&Smiles Account

### Step 1: Create Miles&Smiles Account
1. Visit [Turkish Airlines Miles&Smiles](https://www.turkishairlines.com/en-int/miles-and-smiles/)
2. Click "Join Miles&Smiles" and create your account
3. Complete the registration process
4. Note your account number for MCP integration

### Step 2: Account Verification
1. Verify your email address
2. Complete your profile information
3. Ensure your account is active and in good standing

## 🛠 Integration Methods

### Option 1: Claude.ai Integration (Recommended for Pro Users)

1. **Navigate to Claude Settings**
   - Go to [Claude.ai Settings](https://claude.ai/settings/integrations)
   - Click "Add Integration"

2. **Add Turkish Airlines MCP Server**
   - Integration URL: `https://mcp.turkishtechlab.com/sse`
   - Complete the OAuth authentication flow
   - Sign in with your Miles&Smiles credentials

3. **Test the Integration**
   - Ask Claude: "Show me flights from Istanbul to London tomorrow"
   - Verify that Turkish Airlines tools are available

### Option 2: Claude Desktop Integration

1. **Install MCP Remote Client**
   ```bash
   npm install -g mcp-remote
   ```

2. **Configure Claude Desktop**
   - Go to **Settings > Developer** in Claude Desktop
   - Click "Edit Config" to open `claude_desktop_config.json`
   - Add the following configuration:

   ```json
   {
     "mcpServers": {
       "turkish-airlines": {
         "command": "npx",
         "args": [
           "-y",
           "mcp-remote",
           "https://mcp.turkishtechlab.com/mcp"
         ]
       }
     }
   }
   ```

3. **Restart Claude Desktop**
   - Close and reopen Claude Desktop
   - Authenticate with your Miles&Smiles account when prompted

### Option 3: VS Code Copilot Integration

1. **Create MCP Configuration**
   - Create `.vscode/mcp.json` in your project root
   - Add the following configuration:

   ```json
   {
     "servers": {
       "turkish-airlines": {
         "command": "npx",
         "args": [
           "-y",
           "mcp-remote",
           "https://mcp.turkishtechlab.com/mcp"
         ]
       }
     }
   }
   ```

2. **Start the MCP Server**
   - Click "Start" in VS Code Copilot
   - Authenticate with your Miles&Smiles account

## 🔧 ChatMCPDemo Integration

### Step 1: Update API Key Manager

The Turkish Airlines MCP server is already integrated into the ChatMCPDemo API key manager:

1. **Open Settings Panel**
   - Click "Settings" in the chat interface
   - Navigate to "MCP Servers" tab

2. **Configure Turkish Airlines**
   - Find "Turkish Airlines MCP" in the server list
   - Click "Setup" to configure your Miles&Smiles account
   - Enter your account credentials when prompted

### Step 2: Test the Integration

Try these example queries in your chat interface:

```
"Show me flights from Istanbul to New York next week"
"What's the status of flight TK123?"
"Check my Miles&Smiles account balance"
"Find flights from London to Istanbul for a family of 4"
```

## 🧪 Available Tools

The Turkish Airlines MCP server provides 13 powerful tools:

### Flight Information & Services
- **Search Flights** - Search Turkish Airlines flights by origin, destination, and dates
- **Get Flight Status by Number** - Real-time flight status by flight number
- **Get Flight Status by Route** - Flight status by route and date
- **Create Flight Booking Link** - Generate booking deeplinks

### Booking & Check-in Services
- **Get Booking Details** - Retrieve booking information using PNR
- **Get Check-in Booking Details** - Access check-in information
- **Get Booking Baggage Allowance** - Detailed baggage allowance information

### Travel & Promotions
- **Get Airline Promotions** - Current promotions by country and airports
- **Get City Guide** - Travel guides with promotions for arrival cities

### Member Account Services (Requires Authentication)
- **Get Current User Details** - Member profile and miles balance
- **Get Member Flights** - Upcoming and past flight history
- **Get Expiring Miles** - Calculate expiring miles information
- **Logout** - Securely logout from MCP system

## 🧪 Testing Scenarios

### 1. Flight Search
- **Istanbul → London**: Popular business route
- **New York → Istanbul**: Transatlantic connection
- **Domestic routes**: Istanbul to Ankara, Izmir, Antalya

### 2. Flight Status
- **Real-time status**: Check current flight delays and cancellations
- **Route-based status**: Status by departure/arrival airports
- **Historical data**: Past flight performance

### 3. Member Services
- **Account balance**: Check Miles&Smiles balance
- **Flight history**: Review past and upcoming flights
- **Promotions**: Discover current offers and deals

## 🔍 Troubleshooting

### Common Issues

1. **"Authentication required" errors**
   - Ensure you have a valid Miles&Smiles account
   - Check that your account is active and verified
   - Try logging out and back in

2. **"Tool not found" errors**
   - Verify the MCP server is running
   - Check your internet connection
   - Ensure you're using the correct server URL

3. **"Access denied" errors**
   - Some tools require full authentication
   - Ensure you're signed in with your Miles&Smiles account
   - Check that your account has the necessary permissions

### Debug Mode

Enable debug logging to troubleshoot issues:
```bash
DEBUG=mcp:* npm run dev
```

## 📊 Expected Results

When you ask about Turkish Airlines services, you should get:

- **Real flight schedules** with departure/arrival times
- **Current flight status** with delays and gate information
- **Booking details** with passenger information and seat assignments
- **Personalized recommendations** based on your travel history
- **Promotional offers** and destination guides

## 🔐 Security Notes

1. **OAuth 2.0 Authentication** - Secure access to member-specific features
2. **Data Privacy** - Personal information is handled according to Turkish Airlines privacy policy
3. **Secure Infrastructure** - Enterprise-level security on cloud-native platforms
4. **Session Management** - Automatic logout and session timeout

## 📈 Performance Optimization

1. **Caching** - Responses are cached to reduce API calls
2. **Rate Limiting** - Built-in rate limiting to prevent abuse
3. **Error Handling** - Graceful fallbacks for service unavailability
4. **Monitoring** - Real-time monitoring of server performance

## 🆘 Support

- **Turkish Airlines MCP Documentation**: [https://mcp.turkishtechlab.com](https://mcp.turkishtechlab.com)
- **Turkish Airlines Support**: [digitallab@thy.com](mailto:digitallab@thy.com)
- **Miles&Smiles Support**: [Turkish Airlines Customer Service](https://www.turkishairlines.com/en-int/any-questions/)

## 🎯 Next Steps

Once you have the Turkish Airlines MCP server working:

1. **Test all flight tools** (search, status, booking)
2. **Explore member services** (profile, history, promotions)
3. **Compare with other providers** (Expedia, Ferryhopper, Airbnb)
4. **Build travel workflows** combining multiple MCP servers
5. **Add more airline integrations** (other carriers' MCP servers)

## 🔗 Resources

- **Turkish Airlines MCP Server**: [https://mcp.turkishtechlab.com](https://mcp.turkishtechlab.com)
- **Turkish Airlines Website**: [https://www.turkishairlines.com](https://www.turkishairlines.com)
- **Miles&Smiles Program**: [https://www.turkishairlines.com/en-int/miles-and-smiles/](https://www.turkishairlines.com/en-int/miles-and-smiles/)
- **Turkish Technology Digital Lab**: [https://turkishtechnology.com](https://turkishtechnology.com)

---

## 🎉 Success Indicators

You'll know the integration is working when:

- ✅ Turkish Airlines MCP server appears in the MCP Servers dashboard
- ✅ Miles&Smiles authentication completes successfully
- ✅ Chat interface responds to Turkish Airlines queries
- ✅ Real flight data is returned for searches
- ✅ Member services show your account information

The Turkish Airlines MCP integration provides a powerful way to demonstrate real-world AI applications in the travel industry, showcasing how MCP servers can bridge the gap between AI assistants and enterprise airline systems! ✈️
