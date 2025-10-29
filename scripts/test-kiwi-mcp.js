#!/usr/bin/env node

/**
 * Test script for Kiwi.com MCP integration
 * Tests all Kiwi.com MCP tools and displays results
 */

const { kiwiMCPTools } = require('../lib/kiwi-mcp-client.ts')

async function testKiwiMCPTools() {
  console.log('🧪 Testing Kiwi.com MCP Tools Integration\n')
  console.log('=' .repeat(50))

  try {
    // Test 1: Flight Search
    console.log('\n✈️  Testing Flight Search...')
    const flightSearchResult = await kiwiMCPTools.kiwi_search_flights.execute({
      origin: 'JFK',
      destination: 'LHR',
      departureDate: '2025-02-15',
      returnDate: '2025-02-22',
      adults: 2,
      cabinClass: 'economy',
      dateFlexibility: 1
    })
    console.log('✅ Flight Search Result:', JSON.stringify(flightSearchResult, null, 2))

    // Test 2: Airport Search
    console.log('\n🏢 Testing Airport Search...')
    const airportSearchResult = await kiwiMCPTools.kiwi_search_airports.execute({
      query: 'London',
      limit: 5
    })
    console.log('✅ Airport Search Result:', JSON.stringify(airportSearchResult, null, 2))

    // Test 3: Cheapest Destinations
    console.log('\n💰 Testing Cheapest Destinations...')
    const cheapestDestinationsResult = await kiwiMCPTools.kiwi_get_cheapest_destinations.execute({
      origin: 'NYC',
      departureDate: '2025-03-01',
      maxPrice: 500
    })
    console.log('✅ Cheapest Destinations Result:', JSON.stringify(cheapestDestinationsResult, null, 2))

    // Test 4: Flight Details
    console.log('\n🔍 Testing Flight Details...')
    const flightDetailsResult = await kiwiMCPTools.kiwi_get_flight_details.execute({
      flightId: 'kiwi_flight_1',
      passengers: {
        adults: 2,
        children: 0,
        infants: 0
      }
    })
    console.log('✅ Flight Details Result:', JSON.stringify(flightDetailsResult, null, 2))

    console.log('\n🎉 All Kiwi.com MCP tools tested successfully!')
    console.log('\n📊 Summary:')
    console.log('- Flight Search: ✅ Working')
    console.log('- Airport Search: ✅ Working')
    console.log('- Cheapest Destinations: ✅ Working')
    console.log('- Flight Details: ✅ Working')

  } catch (error) {
    console.error('❌ Error testing Kiwi.com MCP tools:', error)
    process.exit(1)
  }
}

// Run the tests
if (require.main === module) {
  testKiwiMCPTools()
    .then(() => {
      console.log('\n✨ Test completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Test failed:', error)
      process.exit(1)
    })
}

module.exports = { testKiwiMCPTools }
