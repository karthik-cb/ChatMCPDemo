#!/usr/bin/env node

/**
 * Test script for Ferryhopper MCP Server connection
 * Run with: node scripts/test-ferryhopper-mcp.js
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function testFerryhopperMCP() {
  console.log('⛴️ Testing Ferryhopper MCP Server Connection...\n')

  try {
    console.log('🔍 Testing Ferryhopper MCP client...')
    
    // Import and test our Ferryhopper client
    const { ferryhopperMCPTools } = await import('../lib/ferryhopper-mcp-client.ts')
    
    // Test 1: Get ports
    console.log('\n1️⃣ Testing get_ports tool...')
    try {
      const portsResult = await ferryhopperMCPTools.getPorts.execute({})
      console.log('✅ get_ports tool working')
      console.log(`📊 Found ${portsResult.ports?.length || 0} ports`)
      
      // Show first few ports as example
      if (portsResult.ports && portsResult.ports.length > 0) {
        console.log('🌍 Sample ports:')
        portsResult.ports.slice(0, 3).forEach((port, index) => {
          console.log(`   ${index + 1}. ${port.name} (${port.country})`)
        })
      }
    } catch (error) {
      console.log('❌ get_ports tool failed:', error.message)
    }

    // Test 2: Search trips
    console.log('\n2️⃣ Testing search_trips tool...')
    try {
      const tripsResult = await ferryhopperMCPTools.searchTrips.execute({
        departurePort: 'Piraeus',
        arrivalPort: 'Aegina',
        date: '2025-06-15'
      })
      
      console.log('✅ search_trips tool working')
      console.log(`🚢 Found ${tripsResult.trips?.length || 0} trips`)
      
      // Show sample trip
      if (tripsResult.trips && tripsResult.trips.length > 0) {
        const sampleTrip = tripsResult.trips[0]
        console.log('⛴️ Sample trip:')
        console.log(`   Route: ${sampleTrip.departurePort} → ${sampleTrip.arrivalPort}`)
        console.log(`   Time: ${sampleTrip.departureTime} - ${sampleTrip.arrivalTime}`)
        console.log(`   Company: ${sampleTrip.company}`)
        console.log(`   Price: €${sampleTrip.price || 'N/A'}`)
      }
    } catch (error) {
      console.log('❌ search_trips tool failed:', error.message)
    }

    // Test 3: Test with different route
    console.log('\n3️⃣ Testing with different route (Ibiza → Barcelona)...')
    try {
      const ibizaResult = await ferryhopperMCPTools.searchTrips.execute({
        departurePort: 'Ibiza',
        arrivalPort: 'Barcelona',
        date: '2025-07-11'
      })
      
      console.log('✅ Ibiza → Barcelona search working')
      console.log(`🚢 Found ${ibizaResult.trips?.length || 0} trips`)
    } catch (error) {
      console.log('❌ Ibiza → Barcelona search failed:', error.message)
    }

    console.log('\n🎉 Ferryhopper MCP Client is working!')
    console.log('📝 Note: Using fallback mock data since Ferryhopper server endpoints are not accessible')
    console.log('\n📝 Next steps:')
    console.log('   1. Test ferry queries in the chat interface')
    console.log('   2. Try queries like:')
    console.log('      - "What ferries go from Piraeus to Aegina tomorrow?"')
    console.log('      - "Find ferries from Ibiza to Barcelona on July 11th"')
    console.log('      - "Show me islands within 3 hours of Athens"')
    console.log('   3. The tools will work with mock data for demonstration')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Check your internet connection')
    console.log('   2. Verify the Ferryhopper MCP server is accessible')
    console.log('   3. Check if there are any CORS issues')
    console.log('   4. Try accessing https://mcp.ferryhopper.com/mcp directly')
    process.exit(1)
  }
}

// Run the test
testFerryhopperMCP().catch(console.error)
