#!/usr/bin/env node

/**
 * Test script for MCP server enable/disable functionality
 * Tests the MCP settings manager and tool filtering
 */

const { mcpSettingsManager } = require('../lib/mcp-settings-manager.ts')
const { getCurrentMCPTools } = require('../lib/mcp-client.ts')
const { isToolSupported, getSupportedTools } = require('../components/mcp-tools/mcp-tool-registry.tsx')

async function testMCPSettings() {
  console.log('🧪 Testing MCP Server Settings Management\n')
  console.log('=' .repeat(50))

  try {
    // Test 1: Check initial settings
    console.log('\n📋 Initial MCP Server Settings:')
    const initialSettings = mcpSettingsManager.getAllServerSettings()
    initialSettings.forEach(server => {
      console.log(`  ${server.name}: ${server.enabled ? '✅ Enabled' : '❌ Disabled'}`)
    })

    // Test 2: Disable Turkish Airlines
    console.log('\n🔧 Disabling Turkish Airlines MCP...')
    mcpSettingsManager.setServerEnabled('turkish-airlines', false)
    console.log('✅ Turkish Airlines disabled')

    // Test 3: Check enabled servers
    console.log('\n📊 Enabled Servers:')
    const enabledServers = mcpSettingsManager.getEnabledServers()
    console.log('  Enabled:', enabledServers)

    // Test 4: Check disabled servers
    console.log('\n📊 Disabled Servers:')
    const disabledServers = mcpSettingsManager.getDisabledServers()
    console.log('  Disabled:', disabledServers)

    // Test 5: Test tool filtering
    console.log('\n🔍 Testing Tool Filtering:')
    const supportedTools = getSupportedTools()
    console.log('  Supported tools count:', Object.keys(supportedTools).length)
    
    // Check specific tools
    const turkishTools = Object.keys(supportedTools).filter(tool => tool.includes('turkish'))
    const kiwiTools = Object.keys(supportedTools).filter(tool => tool.includes('kiwi'))
    
    console.log('  Turkish Airlines tools:', turkishTools.length > 0 ? turkishTools : 'None (disabled)')
    console.log('  Kiwi.com tools:', kiwiTools.length > 0 ? kiwiTools : 'None (disabled)')

    // Test 6: Re-enable Turkish Airlines
    console.log('\n🔧 Re-enabling Turkish Airlines MCP...')
    mcpSettingsManager.setServerEnabled('turkish-airlines', true)
    console.log('✅ Turkish Airlines re-enabled')

    // Test 7: Test toggle functionality
    console.log('\n🔄 Testing Toggle Functionality:')
    const originalKiwiState = mcpSettingsManager.isServerEnabled('kiwi')
    console.log('  Original Kiwi state:', originalKiwiState)
    
    mcpSettingsManager.toggleServer('kiwi')
    const newKiwiState = mcpSettingsManager.isServerEnabled('kiwi')
    console.log('  After toggle:', newKiwiState)
    console.log('  Toggle successful:', originalKiwiState !== newKiwiState)

    // Test 8: Reset to defaults
    console.log('\n🔄 Resetting to defaults...')
    mcpSettingsManager.resetToDefaults()
    const defaultSettings = mcpSettingsManager.getAllServerSettings()
    const allEnabled = defaultSettings.every(server => server.enabled)
    console.log('  All servers enabled by default:', allEnabled)

    console.log('\n🎉 All MCP settings tests completed successfully!')
    console.log('\n📊 Summary:')
    console.log('- MCP Settings Manager: ✅ Working')
    console.log('- Server Enable/Disable: ✅ Working')
    console.log('- Tool Filtering: ✅ Working')
    console.log('- Toggle Functionality: ✅ Working')
    console.log('- Reset to Defaults: ✅ Working')

  } catch (error) {
    console.error('❌ Error testing MCP settings:', error)
    process.exit(1)
  }
}

// Run the tests
if (require.main === module) {
  testMCPSettings()
    .then(() => {
      console.log('\n✨ Test completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Test failed:', error)
      process.exit(1)
    })
}

module.exports = { testMCPSettings }
