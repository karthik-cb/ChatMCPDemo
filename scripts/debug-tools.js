#!/usr/bin/env node

/**
 * Debug script to check tool registration
 */

console.log('🔍 Debugging Tool Registration...\n')

// Test the Turkish Airlines MCP tools
try {
  const { turkishAirlinesMCPTools } = require('../lib/turkish-airlines-mcp-client')
  
  console.log('📋 Turkish Airlines Tools:')
  console.log('=========================')
  
  const toolNames = Object.keys(turkishAirlinesMCPTools)
  console.log(`Total tools: ${toolNames.length}`)
  console.log('')
  
  toolNames.forEach((toolName, index) => {
    const tool = turkishAirlinesMCPTools[toolName]
    console.log(`${index + 1}. ${toolName}`)
    console.log(`   Description: ${tool.description}`)
    console.log(`   Has execute: ${typeof tool.execute === 'function'}`)
    console.log(`   Has parameters: ${!!tool.parameters}`)
    console.log('')
  })
  
  // Test the combined tools object
  console.log('🔧 Testing Combined Tools:')
  console.log('=========================')
  
  const { mcpTools } = require('../lib/mcp-client')
  const { ferryhopperMCPTools } = require('../lib/ferryhopper-mcp-client')
  const { airbnbMCPTools } = require('../lib/airbnb-mcp-client')
  
  const allTools = {
    ...mcpTools,
    ...ferryhopperMCPTools,
    ...airbnbMCPTools,
    ...turkishAirlinesMCPTools
  }
  
  console.log(`Total combined tools: ${Object.keys(allTools).length}`)
  console.log('Tool names:')
  Object.keys(allTools).forEach((name, index) => {
    console.log(`  ${index + 1}. ${name}`)
  })
  
  console.log('\n✅ Tool registration looks correct!')
  
} catch (error) {
  console.error('❌ Error debugging tools:', error.message)
  console.log('\nTroubleshooting:')
  console.log('1. Make sure all MCP client files exist')
  console.log('2. Check that tools are properly exported')
  console.log('3. Verify the chat API includes all tools')
}

console.log('\n✨ Tool registration debug completed!')
