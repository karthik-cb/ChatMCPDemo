# 🚀 Vercel Deployment Guide

This guide ensures a smooth one-click deployment to Vercel with all dependencies properly captured.

## ✅ Pre-Deployment Checklist

### 1. Dependencies Captured
All required packages are properly listed in `package.json`:

**Core Dependencies:**
- ✅ `react-markdown` (^10.1.0) - For table rendering
- ✅ `remark-gfm` (^4.0.1) - GitHub Flavored Markdown support
- ✅ `@ai-sdk/cerebras` (^1.0.25) - Cerebras integration
- ✅ `@ai-sdk/anthropic` (^1.0.0) - Anthropic integration
- ✅ `@ai-sdk/openai` (^1.0.0) - OpenAI integration
- ✅ `@ai-sdk/react` (^1.0.0) - AI SDK React components
- ✅ `ai` (^5.0.76) - Core AI SDK
- ✅ `@modelcontextprotocol/sdk` (^1.20.1) - MCP integration
- ✅ `next` (^15.5.5) - Next.js framework
- ✅ `react` (^18.2.0) - React library
- ✅ `react-dom` (^18.2.0) - React DOM

**UI Dependencies:**
- ✅ `@radix-ui/*` - UI components
- ✅ `lucide-react` - Icons
- ✅ `tailwindcss` - Styling
- ✅ `next-themes` - Dark mode support
- ✅ `recharts` - Metrics visualization

### 2. Environment Variables
Required environment variables are documented in `env.example`:

```env
# Required for deployment
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CEREBRAS_API_KEY=your_cerebras_api_key_here

# Optional for real Expedia integration
EXPEDIA_API_KEY=your_expedia_api_key_here
```

### 3. Vercel Configuration
`vercel.json` is properly configured:

```json
{
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 30
    },
    "app/api/metrics/route.ts": {
      "maxDuration": 10
    }
  },
  "env": {
    "OPENAI_API_KEY": "@openai_api_key",
    "ANTHROPIC_API_KEY": "@anthropic_api_key",
    "CEREBRAS_API_KEY": "@cerebras_api_key"
  }
}
```

### 4. Build Configuration
- ✅ `next.config.js` exists and is properly configured
- ✅ `tailwind.config.js` exists for styling
- ✅ `tsconfig.json` exists for TypeScript
- ✅ `postcss.config.js` exists for CSS processing

## 🚀 One-Click Vercel Deployment

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project

### Step 2: Configure Environment Variables
In the Vercel dashboard, add these environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |
| `CEREBRAS_API_KEY` | Your Cerebras API key | Yes |
| `EXPEDIA_API_KEY` | Your Expedia API key | Optional |

### Step 3: Deploy
1. Click "Deploy" button
2. Vercel will automatically:
   - Install all dependencies from `package.json`
   - Build the Next.js application
   - Deploy to global CDN
   - Provide a live URL

## 🔧 Post-Deployment Verification

### 1. Test Core Functionality
- [ ] Chat interface loads correctly
- [ ] Provider selection works
- [ ] Messages are sent and received
- [ ] Tool calls execute properly
- [ ] Tables render with proper formatting

### 2. Test MCP Integration
- [ ] Ferry search tools work
- [ ] Travel recommendation tools work
- [ ] Tool results display correctly
- [ ] Multi-turn tool use functions

### 3. Test Performance
- [ ] Metrics panel shows data
- [ ] Response times are reasonable
- [ ] No console errors
- [ ] Dark mode works

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**
- Check that all dependencies are in `package.json`
- Verify TypeScript compilation passes locally
- Check for any missing imports

**Runtime Errors:**
- Verify environment variables are set correctly
- Check API key validity
- Review Vercel function logs

**Table Rendering Issues:**
- Ensure `react-markdown` and `remark-gfm` are installed
- Check that markdown content is properly formatted
- Verify CSS classes are applied correctly

### Debug Commands

```bash
# Test build locally
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Test production build
npm start
```

## 📊 Performance Optimization

### Vercel-Specific Optimizations
- ✅ Edge functions for API routes
- ✅ Automatic image optimization
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ Preview deployments for branches

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

## 🔄 Continuous Deployment

### Automatic Deployments
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from feature branches
- **Development**: Deploys from pull requests

### Environment Management
- **Production**: Use production API keys
- **Preview**: Use staging/test API keys
- **Development**: Use local `.env.local`

## 📈 Monitoring

### Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Monitor Core Web Vitals
- Track user interactions

### Custom Metrics
- The app includes built-in telemetry
- Performance metrics are collected automatically
- View metrics in the app's metrics panel

## 🎯 Success Criteria

A successful deployment should have:
- ✅ All dependencies installed correctly
- ✅ Environment variables configured
- ✅ Chat interface fully functional
- ✅ MCP tools working properly
- ✅ Tables rendering correctly
- ✅ Performance metrics showing
- ✅ No console errors
- ✅ Fast loading times

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review the troubleshooting section
3. Test locally with `npm run build && npm start`
4. Verify all environment variables are set
5. Check API key validity and quotas

---

**Ready for deployment!** 🚀

All dependencies are captured, configuration is complete, and the application is optimized for Vercel's platform.
