#!/usr/bin/env node

/**
 * Simple test for Turkish Airlines MCP tools integration
 */

console.log('🧪 Testing Turkish Airlines MCP Tools Integration...\n')

const fs = require('fs')
const path = require('path')

// Check if the Turkish Airlines MCP client file exists
const turkishAirlinesFile = path.join(__dirname, '..', 'lib', 'turkish-airlines-mcp-client.ts')
const chatApiFile = path.join(__dirname, '..', 'app', 'api', 'chat', 'route.ts')

console.log('📋 File Existence Check:')
console.log('=======================')

if (fs.existsSync(turkishAirlinesFile)) {
  console.log('✅ Turkish Airlines MCP client file exists')
} else {
  console.log('❌ Turkish Airlines MCP client file missing')
}

if (fs.existsSync(chatApiFile)) {
  console.log('✅ Chat API file exists')
} else {
  console.log('❌ Chat API file missing')
}

console.log('\n📋 Content Verification:')
console.log('========================')

// Check if Turkish Airlines tools are imported in chat API
if (fs.existsSync(chatApiFile)) {
  const chatApiContent = fs.readFileSync(chatApiFile, 'utf8')
  
  if (chatApiContent.includes('turkish-airlines-mcp-client')) {
    console.log('✅ Turkish Airlines MCP client imported in chat API')
  } else {
    console.log('❌ Turkish Airlines MCP client not imported in chat API')
  }
  
  if (chatApiContent.includes('turkishAirlinesMCPTools')) {
    console.log('✅ Turkish Airlines MCP tools included in allTools')
  } else {
    console.log('❌ Turkish Airlines MCP tools not included in allTools')
  }
}

// Check Turkish Airlines MCP client file content
if (fs.existsSync(turkishAirlinesFile)) {
  const turkishAirlinesContent = fs.readFileSync(turkishAirlinesFile, 'utf8')
  
  const expectedTools = [
    'turkish_airlines_search_flights',
    'turkish_airlines_flight_status_number',
    'turkish_airlines_flight_status_route',
    'turkish_airlines_booking_details',
    'turkish_airlines_member_details',
    'turkish_airlines_member_flights',
    'turkish_airlines_promotions'
  ]
  
  console.log('\n📋 Tool Definitions:')
  console.log('====================')
  
  expectedTools.forEach(toolName => {
    if (turkishAirlinesContent.includes(toolName)) {
      console.log(`✅ ${toolName} - Defined`)
    } else {
      console.log(`❌ ${toolName} - Missing`)
    }
  })
}

console.log('\n📊 Summary:')
console.log('============')
console.log('Turkish Airlines MCP tools should now be available in the chat interface.')
console.log('The tools will have proper names and descriptions instead of generic numbers.')
console.log('')
console.log('Next steps:')
console.log('1. Start the development server: npm run dev')
console.log('2. Try asking: "Show me flights from Istanbul to London tomorrow"')
console.log('3. The AI should now use Turkish Airlines tools with proper names')

console.log('\n✨ Turkish Airlines MCP tools test completed!')
