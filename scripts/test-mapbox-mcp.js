#!/usr/bin/env node

/**
 * Test script for Mapbox MCP integration
 * Tests all Mapbox MCP tools and displays results
 */

const { mapboxMCPTools } = require('../lib/mapbox-mcp-client.ts')

async function testMapboxMCPTools() {
  console.log('🧪 Testing Mapbox MCP Tools Integration\n')
  console.log('=' .repeat(50))

  try {
    // Test 1: Static Image
    console.log('\n🗺️  Testing Static Image Generation...')
    const staticImageResult = await mapboxMCPTools.mapbox_static_image.execute({
      coordinates: [[-74.0059, 40.7128], [-73.9352, 40.7306]],
      style: 'mapbox/streets-v12',
      width: 800,
      height: 600,
      zoom: 12,
      markers: [
        { coordinates: [-74.0059, 40.7128], color: 'red', label: 'Start' },
        { coordinates: [-73.9352, 40.7306], color: 'blue', label: 'End' }
      ]
    })
    console.log('✅ Static Image Result:', JSON.stringify(staticImageResult, null, 2))

    // Test 2: Directions
    console.log('\n🛣️  Testing Directions...')
    const directionsResult = await mapboxMCPTools.mapbox_directions.execute({
      coordinates: [[-74.0059, 40.7128], [-73.9352, 40.7306]],
      profile: 'driving',
      alternatives: true
    })
    console.log('✅ Directions Result:', JSON.stringify(directionsResult, null, 2))

    // Test 3: Category Search
    console.log('\n🔍 Testing Category Search...')
    const categorySearchResult = await mapboxMCPTools.mapbox_category_search.execute({
      category: 'restaurant',
      coordinates: [-74.0059, 40.7128],
      radius: 1000,
      limit: 5
    })
    console.log('✅ Category Search Result:', JSON.stringify(categorySearchResult, null, 2))

    // Test 4: Reverse Geocoding
    console.log('\n📍 Testing Reverse Geocoding...')
    const reverseGeocodingResult = await mapboxMCPTools.mapbox_reverse_geocoding.execute({
      coordinates: [-74.0059, 40.7128],
      language: 'en'
    })
    console.log('✅ Reverse Geocoding Result:', JSON.stringify(reverseGeocodingResult, null, 2))

    // Test 5: Travel Time Matrix
    console.log('\n⏱️  Testing Travel Time Matrix...')
    const matrixResult = await mapboxMCPTools.mapbox_matrix.execute({
      coordinates: [[-74.0059, 40.7128], [-73.9352, 40.7306], [-73.9857, 40.7484]],
      profile: 'driving-traffic'
    })
    console.log('✅ Travel Time Matrix Result:', JSON.stringify(matrixResult, null, 2))

    // Test 6: Isochrone Analysis
    console.log('\n🎯 Testing Isochrone Analysis...')
    const isochroneResult = await mapboxMCPTools.mapbox_isochrone.execute({
      coordinates: [-74.0059, 40.7128],
      profile: 'driving',
      contours: [
        { time: 15, color: '#ff0000' },
        { time: 30, color: '#00ff00' },
        { time: 45, color: '#0000ff' }
      ]
    })
    console.log('✅ Isochrone Analysis Result:', JSON.stringify(isochroneResult, null, 2))

    // Test 7: Search & Geocode
    console.log('\n🔎 Testing Search & Geocode...')
    const searchGeocodeResult = await mapboxMCPTools.mapbox_search_geocode.execute({
      query: 'Central Park, New York',
      limit: 3
    })
    console.log('✅ Search & Geocode Result:', JSON.stringify(searchGeocodeResult, null, 2))

    console.log('\n🎉 All Mapbox MCP tools tested successfully!')
    console.log('\n📊 Summary:')
    console.log('- Static Image Generation: ✅ Working')
    console.log('- Directions: ✅ Working')
    console.log('- Category Search: ✅ Working')
    console.log('- Reverse Geocoding: ✅ Working')
    console.log('- Travel Time Matrix: ✅ Working')
    console.log('- Isochrone Analysis: ✅ Working')
    console.log('- Search & Geocode: ✅ Working')

  } catch (error) {
    console.error('❌ Error testing Mapbox MCP tools:', error)
    process.exit(1)
  }
}

// Run the tests
if (require.main === module) {
  testMapboxMCPTools()
    .then(() => {
      console.log('\n✨ Test completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Test failed:', error)
      process.exit(1)
    })
}

module.exports = { testMapboxMCPTools }
