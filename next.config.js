/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@modelcontextprotocol/sdk'],
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    CEREBRAS_API_KEY: process.env.CEREBRAS_API_KEY,
  },
}

module.exports = nextConfig
