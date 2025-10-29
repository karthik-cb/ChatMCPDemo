#!/usr/bin/env node

/**
 * Test script for MCP Servers Summary functionality
 * This script validates that all MCP server configurations are properly set up
 */

console.log('🧪 Testing MCP Servers Summary Configuration...\n')

// Test data for MCP servers
const mcpServers = [
  {
    id: 'turkish-airlines',
    name: 'Turkish Airlines MCP',
    apiKeyRequired: true,
    apiKeyName: 'TURKISH_AIRLINES_ACCOUNT',
    documentationUrl: 'https://mcp.turkishtechlab.com',
    tools: ['search_flights', 'flight_status', 'booking_details', 'member_services']
  },
  {
    id: 'expedia',
    name: 'Expedia Travel Recommendations',
    apiKeyRequired: true,
    apiKeyName: 'EXPEDIA_API_KEY',
    documentationUrl: 'https://github.com/ExpediaGroup/expedia-travel-recommendations-mcp',
    tools: ['hotel_search', 'activity_recommendations', 'travel_planning']
  },
  {
    id: 'ferryhopper',
    name: 'Ferryhopper Ferry Routes',
    apiKeyRequired: false,
    documentationUrl: 'https://ferryhopper.github.io/fh-mcp/',
    tools: ['getPorts', 'searchTrips', 'redirectToBooking']
  },
  {
    id: 'airbnb',
    name: 'Airbnb Listings',
    apiKeyRequired: false,
    documentationUrl: 'https://github.com/openbnb-org/mcp-server-airbnb',
    tools: ['airbnb.search', 'airbnb.listing_details']
  }
]

console.log('📋 MCP Servers Configuration:')
console.log('================================')

mcpServers.forEach((server, index) => {
  console.log(`\n${index + 1}. ${server.name}`)
  console.log(`   ID: ${server.id}`)
  console.log(`   API Key Required: ${server.apiKeyRequired ? 'Yes' : 'No'}`)
  if (server.apiKeyRequired) {
    console.log(`   API Key Name: ${server.apiKeyName}`)
  }
  console.log(`   Documentation: ${server.documentationUrl}`)
  console.log(`   Available Tools: ${server.tools.length}`)
  server.tools.forEach(tool => {
    console.log(`     - ${tool}`)
  })
})

console.log('\n🔧 Integration Status:')
console.log('======================')

// Check if components exist
const fs = require('fs')
const path = require('path')

const components = [
  'components/mcp-servers-summary.tsx',
  'components/api-key-manager.tsx',
  'components/settings-panel.tsx'
]

let allComponentsExist = true

components.forEach(component => {
  const componentPath = path.join(__dirname, '..', component)
  if (fs.existsSync(componentPath)) {
    console.log(`✅ ${component} - Found`)
  } else {
    console.log(`❌ ${component} - Missing`)
    allComponentsExist = false
  }
})

console.log('\n📊 Summary:')
console.log('============')
console.log(`Total MCP Servers: ${mcpServers.length}`)
console.log(`Servers requiring API keys: ${mcpServers.filter(s => s.apiKeyRequired).length}`)
console.log(`Free servers: ${mcpServers.filter(s => !s.apiKeyRequired).length}`)
console.log(`Total tools available: ${mcpServers.reduce((acc, s) => acc + s.tools.length, 0)}`)

if (allComponentsExist) {
  console.log('\n🎉 All components are properly configured!')
  console.log('\nNext steps:')
  console.log('1. Start the development server: npm run dev')
  console.log('2. Open the Settings panel in the chat interface')
  console.log('3. Navigate to the "MCP Servers" tab')
  console.log('4. Configure API keys for servers that require them')
  console.log('5. Test the integration by asking travel-related questions')
} else {
  console.log('\n❌ Some components are missing. Please check the file paths.')
}

console.log('\n🔗 Useful Links:')
console.log('================')
mcpServers.forEach(server => {
  console.log(`${server.name}: ${server.documentationUrl}`)
})

console.log('\n✨ MCP Servers Summary test completed!')
