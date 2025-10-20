# 🔐 BYOK (Bring Your Own Key) User Guide

## Overview

The Chat MCP Demo uses a **Bring Your Own Key (BYOK)** system that allows you to use your own API keys for testing different AI providers. This approach ensures your keys never leave your browser and gives you complete control over your data.

## 🔒 Security & Privacy

### **Your Keys Stay Local**
- ✅ **API keys are stored only in your browser** (localStorage)
- ✅ **Keys never leave your device** or get sent to our servers
- ✅ **Direct API calls only** - your keys are only used to make direct calls to the respective AI providers
- ✅ **Complete transparency** - you can see exactly how your data is handled

### **What We Don't Do**
- ❌ We don't store your API keys on our servers
- ❌ We don't log or monitor your API key usage
- ❌ We don't share your keys with third parties
- ❌ We don't require account registration

## 🚀 Getting Started

### **Step 1: Get Your API Keys**

You'll need API keys from the providers you want to test:

#### **Cerebras API Key**
1. Visit [Cerebras Cloud](https://cloud.cerebras.ai/)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it will look like: `your-cerebras-key-here`)

#### **OpenAI API Key**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign in to your account
3. Go to API Keys section
4. Create a new secret key
5. Copy the key (it will look like: `sk-...`)

#### **Anthropic API Key**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign in to your account
3. Go to API Keys section
4. Create a new key
5. Copy the key (it will look like: `sk-ant-...`)

### **Step 2: Add Your API Keys**

1. **Open the Chat MCP Demo** in your browser
2. **Click the "API Keys" button** in the top navigation
3. **For each provider you want to test:**
   - Enter your API key in the password field
   - Click "Save API Key"
   - Click "Validate" to test the key
4. **Close the settings panel** when done

### **Step 3: Start Chatting**

1. **Select your preferred provider** from the dropdown
2. **Choose a model** from the model selector
3. **Start chatting** - your API key will be used automatically

## 🛠️ Using the API Key Manager

### **Adding API Keys**

1. **Click "API Keys"** in the navigation bar
2. **Find the provider** you want to configure (Cerebras, OpenAI, or Anthropic)
3. **Enter your API key** in the password field
4. **Click "Save API Key"** to store it locally
5. **Click "Validate"** to test the key works

### **Validating API Keys**

The validation process:
- Makes a minimal test request to the provider
- Uses only a few tokens (minimal cost)
- Confirms the key is valid and working
- Updates the validation status

### **Managing Stored Keys**

- **View stored keys**: Click the eye icon to show/hide the key
- **Remove keys**: Click "Remove" and confirm deletion
- **Check validation status**: See when the key was last validated

### **Transparency Information**

Click "Show Details" to see:
- How many keys are stored
- Which providers are configured
- Where keys are stored (localStorage)
- When keys were last validated
- How your data is handled

## 🔍 Understanding the Security Model

### **Data Storage**
```
Your Browser (localStorage)
├── API Keys (base64 encoded)
├── Validation Status
└── Last Validated Timestamp
```

### **Data Flow**
```
Your Browser → Direct API Call → AI Provider
     ↑                              ↓
     └── Response ←──────────────────┘
```

### **What Happens When You Chat**
1. You type a message
2. Your API key is retrieved from localStorage
3. A direct API call is made to the selected provider
4. The response is streamed back to you
5. Your key never touches our servers

## 🚨 Troubleshooting

### **"Validation Failed" Error**

**Common causes:**
- Invalid API key format
- Expired or revoked API key
- Insufficient quota/credits
- Network connectivity issues

**Solutions:**
1. **Check your API key** - make sure it's copied correctly
2. **Verify your account** - ensure you have active credits/quota
3. **Try a different provider** - test with another API key
4. **Check your internet connection**

### **"Unknown Provider" Error**

This usually means:
- The provider isn't supported yet
- There's a typo in the provider name

**Solution:** Use one of the supported providers: Cerebras, OpenAI, or Anthropic

### **"Unknown Model" Error**

This means:
- The model isn't available for that provider
- The model name is incorrect

**Solution:** Check the model selector for available models

### **Keys Not Saving**

**Possible causes:**
- Browser localStorage is disabled
- Browser storage is full
- Incognito/private browsing mode

**Solutions:**
1. **Enable localStorage** in your browser settings
2. **Clear browser storage** to make space
3. **Use regular browsing mode** instead of incognito

## 🔧 Advanced Usage

### **Multiple Providers**

You can configure multiple providers and switch between them:
1. Add API keys for multiple providers
2. Use the provider selector to switch
3. Compare performance between providers

### **Model Selection**

Each provider offers different models:
- **Cerebras**: Llama 3.3 70B, Qwen models, GPT-OSS
- **OpenAI**: GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku

### **Performance Comparison**

Use the metrics panel to compare:
- Response times between providers
- Success rates
- Token usage
- Cost efficiency

## 🆘 Getting Help

### **Common Questions**

**Q: Is it safe to enter my API keys?**
A: Yes! Your keys are stored locally in your browser only and never sent to our servers.

**Q: Can I remove my keys?**
A: Yes! Click "Remove" next to any key to delete it immediately.

**Q: What if I want to stop using this demo?**
A: Simply remove all your API keys and close the browser tab.

**Q: Do you track my usage?**
A: No! We don't track or log your API key usage or conversations.

**Q: Can I use this in production?**
A: This is a demo application. For production use, implement proper security measures.

### **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your API keys are valid
3. Ensure you have sufficient quota/credits
4. Try with a different provider

## 🔄 Data Management

### **Clearing All Data**

To completely remove all stored data:
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Find "Local Storage" → your domain
4. Delete the "mcp-demo-api-keys" entry
5. Refresh the page

### **Backing Up Keys**

Your API keys are stored locally, so:
- They're automatically backed up with your browser data
- They sync across devices if you use browser sync
- You can manually copy them from the settings panel

## 📊 Best Practices

### **Security**
- ✅ Use dedicated API keys for testing
- ✅ Regularly rotate your API keys
- ✅ Monitor your API usage and costs
- ✅ Remove keys when done testing

### **Cost Management**
- ✅ Set usage limits on your API keys
- ✅ Monitor token usage in the metrics panel
- ✅ Use smaller models for testing when possible
- ✅ Validate keys before extensive testing

### **Performance Testing**
- ✅ Test the same query with multiple providers
- ✅ Use the metrics panel to compare performance
- ✅ Test different models within each provider
- ✅ Consider latency vs. quality trade-offs

---

## 🎯 Ready to Start?

1. **Get your API keys** from the providers you want to test
2. **Add them to the demo** using the API Keys button
3. **Start comparing** Cerebras with other providers
4. **Use the metrics panel** to analyze performance

**Happy testing!** 🚀
