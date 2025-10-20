#!/usr/bin/env node

/**
 * Test script for Expedia MCP Server connection
 * Run with: node scripts/test-expedia-mcp.js
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') })

async function testExpediaMCP() {
  console.log('🧪 Testing Expedia MCP Server Connection...\n')

  // Check if API key is set
  if (!process.env.EXPEDIA_API_KEY) {
    console.error('❌ EXPEDIA_API_KEY not found in environment variables')
    console.log('📝 Please add your Expedia API key to .env.local:')
    console.log('   EXPEDIA_API_KEY=your_actual_api_key_here')
    console.log('\n🔗 Get your API key from: https://partner.expedia.com/')
    process.exit(1)
  }

  console.log('✅ Expedia API key found')
  console.log('🔧 Starting MCP server...\n')

  try {
    // Test if uvx is available
    const uvxTest = spawn('uvx', ['--version'], { stdio: 'pipe' })
    
    uvxTest.on('error', (error) => {
      console.error('❌ uvx not found. Please install it first:')
      console.log('   curl -LsSf https://astral.sh/uv/install.sh | sh')
      process.exit(1)
    })

    await new Promise((resolve, reject) => {
      uvxTest.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error('uvx not available'))
        }
      })
    })

    console.log('✅ uvx is available')

    // Test Expedia MCP server installation
    console.log('🔍 Testing Expedia MCP server installation...')
    
    const mcpTest = spawn('uvx', [
      'expedia_travel_recommendations_mcp',
      '--help'
    ], { stdio: 'pipe' })

    await new Promise((resolve, reject) => {
      let output = ''
      mcpTest.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      mcpTest.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Expedia MCP server is installed')
          resolve()
        } else {
          console.error('❌ Expedia MCP server not found')
          console.log('📦 Installing Expedia MCP server...')
          console.log('   uvx expedia_travel_recommendations_mcp --help')
          reject(new Error('MCP server not available'))
        }
      })
    })

    // Test actual MCP server connection
    console.log('🔌 Testing MCP server connection...')
    
    const mcpServer = spawn('uvx', [
      'expedia_travel_recommendations_mcp',
      '--protocol',
      'stdio'
    ], {
      env: { ...process.env, EXPEDIA_API_KEY: process.env.EXPEDIA_API_KEY },
      stdio: ['pipe', 'pipe', 'pipe']
    })

    // Send a test message to the MCP server
    const testMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    }

    mcpServer.stdin.write(JSON.stringify(testMessage) + '\n')

    let response = ''
    mcpServer.stdout.on('data', (data) => {
      response += data.toString()
    })

    mcpServer.stderr.on('data', (data) => {
      console.error('MCP Server Error:', data.toString())
    })

    // Wait for response
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        mcpServer.kill()
        reject(new Error('MCP server connection timeout'))
      }, 10000)

      mcpServer.on('close', (code) => {
        clearTimeout(timeout)
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`MCP server exited with code ${code}`))
        }
      })

      // Check if we got a response
      setTimeout(() => {
        if (response.includes('"result"') || response.includes('"error"')) {
          clearTimeout(timeout)
          mcpServer.kill()
          resolve()
        }
      }, 3000)
    })

    console.log('✅ MCP server connection successful!')
    console.log('📄 Server response:', response.trim())

    console.log('\n🎉 Expedia MCP Server is ready to use!')
    console.log('📝 Next steps:')
    console.log('   1. Update your chat API to use real MCP tools')
    console.log('   2. Test with travel queries in the chat interface')
    console.log('   3. Check the setup guide: docs/EXPEDIA-MCP-SETUP.md')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Ensure uvx is installed: curl -LsSf https://astral.sh/uv/install.sh | sh')
    console.log('   2. Check your Expedia API key is valid')
    console.log('   3. Verify internet connection')
    console.log('   4. See docs/EXPEDIA-MCP-SETUP.md for detailed setup')
    process.exit(1)
  }
}

// Run the test
testExpediaMCP().catch(console.error)
