#!/usr/bin/env node

/**
 * Test script for Turkish Airlines MCP tools integration
 * This script validates that Turkish Airlines tools are properly registered
 */

console.log('🧪 Testing Turkish Airlines MCP Tools Integration...\n')

// Test the Turkish Airlines MCP tools
try {
  const { turkishAirlinesMCPTools } = await import('../lib/turkish-airlines-mcp-client.js')
  
  console.log('📋 Turkish Airlines MCP Tools:')
  console.log('================================')
  
  const toolNames = Object.keys(turkishAirlinesMCPTools)
  console.log(`Total tools: ${toolNames.length}`)
  console.log('')
  
  toolNames.forEach((toolName, index) => {
    const tool = turkishAirlinesMCPTools[toolName]
    console.log(`${index + 1}. ${toolName}`)
    console.log(`   Description: ${tool.description}`)
    console.log(`   Parameters: ${Object.keys(tool.parameters._def.shape || {}).join(', ') || 'None'}`)
    console.log('')
  })
  
  // Test a sample tool execution
  console.log('🧪 Testing Tool Execution:')
  console.log('=========================')
  
  const searchTool = turkishAirlinesMCPTools.turkish_airlines_search_flights
  if (searchTool) {
    console.log('Testing flight search tool...')
    const result = await searchTool.execute({
      origin: 'IST',
      destination: 'LHR',
      departureDate: '2025-01-20',
      adults: 1
    })
    
    console.log('✅ Tool execution successful!')
    console.log('Result:', JSON.stringify(result, null, 2))
  }
  
  console.log('\n🎉 Turkish Airlines MCP tools are properly configured!')
  console.log('\nNext steps:')
  console.log('1. Start the development server: npm run dev')
  console.log('2. Try asking: "Show me flights from Istanbul to London tomorrow"')
  console.log('3. The AI should now have access to Turkish Airlines tools')
  
} catch (error) {
  console.error('❌ Error testing Turkish Airlines tools:', error.message)
  console.log('\nTroubleshooting:')
  console.log('1. Make sure the Turkish Airlines MCP client file exists')
  console.log('2. Check that the tools are properly exported')
  console.log('3. Verify the chat API includes Turkish Airlines tools')
}

console.log('\n✨ Turkish Airlines MCP tools test completed!')
