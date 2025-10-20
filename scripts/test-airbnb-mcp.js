#!/usr/bin/env node

/**
 * Test script for Airbnb MCP integration
 * This script tests the Airbnb MCP client functionality
 */

const { airbnbMCPTools } = require('../lib/airbnb-mcp-client.ts')

async function testAirbnbMCP() {
  console.log('🧪 Testing Airbnb MCP Integration...\n')

  try {
    // Test 1: Search for Airbnb listings
    console.log('1️⃣ Testing Airbnb Search...')
    const searchResult = await airbnbMCPTools.search.execute({
      location: 'San Francisco, CA',
      checkin: '2024-02-15',
      checkout: '2024-02-18',
      adults: 2,
      children: 0,
      minPrice: 50,
      maxPrice: 200
    })
    
    console.log('✅ Search Result:', JSON.stringify(searchResult, null, 2))
    
    // Test 2: Get listing details
    if (searchResult.listings && searchResult.listings.length > 0) {
      console.log('\n2️⃣ Testing Airbnb Listing Details...')
      const listingId = searchResult.listings[0].id
      const detailsResult = await airbnbMCPTools.listingDetails.execute({
        id: listingId,
        checkin: '2024-02-15',
        checkout: '2024-02-18',
        adults: 2
      })
      
      console.log('✅ Listing Details:', JSON.stringify(detailsResult, null, 2))
    }
    
    console.log('\n🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testAirbnbMCP()
