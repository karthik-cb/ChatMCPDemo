'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiKeyManager, type ProviderConfig, type KeyValidationResult } from '@/lib/api-key-manager'

interface APIKeyManagerProps {
  onKeysUpdated: (configs: Record<string, ProviderConfig>) => void
}

export default function APIKeyManager({ onKeysUpdated }: APIKeyManagerProps) {
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [validating, setValidating] = useState<Record<string, boolean>>({})
  const [validationResults, setValidationResults] = useState<Record<string, KeyValidationResult>>({})
  const [showTransparency, setShowTransparency] = useState(false)

  const providers = [
    { id: 'cerebras', name: 'Cerebras', placeholder: 'Your Cerebras API key', category: 'llm' },
    { id: 'openai', name: 'OpenAI', placeholder: 'sk-...', category: 'llm' },
    { id: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-...', category: 'llm' },
    { id: 'turkish-airlines', name: 'Turkish Airlines', placeholder: 'Your Miles&Smiles account', category: 'mcp' },
    { id: 'expedia', name: 'Expedia Travel', placeholder: 'Your Expedia API key', category: 'mcp' },
    { id: 'mapbox', name: 'Mapbox', placeholder: 'Your Mapbox access token', category: 'mcp' },
    { id: 'airbnb', name: 'Airbnb', placeholder: 'No API key required', category: 'mcp' },
    { id: 'ferryhopper', name: 'Ferryhopper', placeholder: 'No API key required', category: 'mcp' }
  ]

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = () => {
    const storedConfigs = apiKeyManager.getStoredConfigs()
    setConfigs(storedConfigs)
    onKeysUpdated(storedConfigs)
  }

  const handleSaveKey = (provider: string, apiKey: string) => {
    // Check if this is an MCP server that doesn't require API keys
    const mcpNoKeyServers = ['airbnb', 'ferryhopper']
    if (mcpNoKeyServers.includes(provider)) {
      // For servers that don't need keys, just mark as enabled
      const configs = apiKeyManager.getStoredConfigs()
      configs[provider] = {
        provider: provider as any,
        apiKey: '', // No key needed
        model: 'default',
        enabled: true,
        lastValidated: new Date(),
        validationStatus: 'valid'
      }
      localStorage.setItem('mcp-demo-api-keys', JSON.stringify(configs))
      loadConfigs()
      return
    }

    if (!apiKey.trim()) {
      alert('Please enter a valid API key')
      return
    }

    // Save with a default model - the main provider selector will handle model selection
    const defaultModels = {
      cerebras: 'llama-3.3-70b',
      openai: 'gpt-4o',
      anthropic: 'claude-3-5-sonnet-20241022',
      'turkish-airlines': 'default',
      expedia: 'default',
      mapbox: 'default'
    }
    
    apiKeyManager.saveAPIKey(provider, apiKey, defaultModels[provider as keyof typeof defaultModels] || 'default')
    loadConfigs()
  }

  const handleRemoveKey = (provider: string) => {
    if (confirm('Are you sure you want to remove this API key?')) {
      apiKeyManager.removeAPIKey(provider)
      loadConfigs()
    }
  }

  const handleValidateKey = async (provider: string) => {
    setValidating(prev => ({ ...prev, [provider]: true }))
    
    const apiKey = apiKeyManager.getAPIKey(provider)
    if (!apiKey) {
      setValidating(prev => ({ ...prev, [provider]: false }))
      return
    }

    const result = await apiKeyManager.validateAPIKey(provider, apiKey)
    setValidationResults(prev => ({ ...prev, [provider]: result }))
    setValidating(prev => ({ ...prev, [provider]: false }))
    
    loadConfigs() // Refresh to update validation status
  }

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  const getValidationIcon = (provider: string) => {
    const result = validationResults[provider]
    const config = configs[provider]
    
    if (validating[provider]) {
      return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    }
    
    if (result?.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    
    if (result?.isValid === false) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
    
    if (config?.validationStatus === 'valid') {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    
    return <Info className="w-4 h-4 text-gray-400" />
  }

  const transparencyInfo = apiKeyManager.getTransparencyInfo()

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">🔒 Your API Keys Are Secure</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Your API keys are stored locally in your browser only. They never leave your device or get sent to our servers.
              This demo only uses your keys to make direct API calls to the respective providers.
            </p>
          </div>
        </div>
      </div>

      {/* API Key Management */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">API Key Configuration</h3>
        
        {/* LLM Providers */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">🤖 LLM Providers</h4>
          {providers.filter(p => p.category === 'llm').map((provider) => {
          const config = configs[provider.id]
          const isVisible = showKeys[provider.id]
          const apiKey = config ? apiKeyManager.getAPIKey(provider.id) : ''
          
          return (
            <div key={provider.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{provider.name}</h4>
                <div className="flex items-center gap-2">
                  {getValidationIcon(provider.id)}
                  {config && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleValidateKey(provider.id)}
                      disabled={validating[provider.id]}
                    >
                      {validating[provider.id] ? 'Validating...' : 'Validate'}
                    </Button>
                  )}
                </div>
              </div>

              {config ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type={isVisible ? 'text' : 'password'}
                      value={isVisible ? (apiKey || '') : '•'.repeat(apiKey?.length || 0)}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleKeyVisibility(provider.id)}
                    >
                      {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveKey(provider.id)}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  {validationResults[provider.id]?.error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {validationResults[provider.id].error}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Model: {config.model} | 
                    Last validated: {config.lastValidated ? new Date(config.lastValidated).toLocaleString() : 'Never'}
                  </p>
                </div>
              ) : (
                <APIKeyInput
                  provider={provider}
                  onSave={(apiKey) => handleSaveKey(provider.id, apiKey)}
                />
              )}
            </div>
          )
        })}
        </div>

        {/* MCP Servers */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">🔌 MCP Servers</h4>
          {providers.filter(p => p.category === 'mcp').map((provider) => {
          const config = configs[provider.id]
          const isVisible = showKeys[provider.id]
          const apiKey = config ? apiKeyManager.getAPIKey(provider.id) : ''
          const isNoKeyServer = ['airbnb', 'ferryhopper'].includes(provider.id)
          
          return (
            <div key={provider.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{provider.name}</h4>
                <div className="flex items-center gap-2">
                  {isNoKeyServer ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    getValidationIcon(provider.id)
                  )}
                  {!isNoKeyServer && config && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleValidateKey(provider.id)}
                      disabled={validating[provider.id]}
                    >
                      {validating[provider.id] ? 'Validating...' : 'Validate'}
                    </Button>
                  )}
                </div>
              </div>

              {isNoKeyServer ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      No API key required - ready to use
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    This MCP server works without authentication
                  </p>
                </div>
              ) : config ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type={isVisible ? 'text' : 'password'}
                      value={isVisible ? (apiKey || '') : '•'.repeat(apiKey?.length || 0)}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleKeyVisibility(provider.id)}
                    >
                      {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveKey(provider.id)}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  {validationResults[provider.id]?.error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {validationResults[provider.id].error}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Model: {config.model} | 
                    Last validated: {config.lastValidated ? new Date(config.lastValidated).toLocaleString() : 'Never'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <APIKeyInput
                    provider={provider}
                    onSave={(apiKey) => handleSaveKey(provider.id, apiKey)}
                  />
                  
                  {/* Special note for Turkish Airlines */}
                  {provider.id === 'turkish-airlines' && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Note:</strong> Enter your Miles&Smiles account number. Full authentication happens when using the MCP server.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        </div>
      </div>

      {/* Transparency Panel */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">🔍 Transparency Information</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTransparency(!showTransparency)}
          >
            {showTransparency ? 'Hide' : 'Show'} Details
          </Button>
        </div>
        
        {showTransparency && (
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Keys stored:</strong> {transparencyInfo.keysStored}</p>
            <p><strong>Providers configured:</strong> {transparencyInfo.providers.join(', ') || 'None'}</p>
            <p><strong>Storage location:</strong> {transparencyInfo.storageLocation}</p>
            <p><strong>Last validation:</strong> {transparencyInfo.lastValidated?.toLocaleString() || 'Never'}</p>
            <p><strong>Data handling:</strong> Keys are obfuscated in localStorage and never transmitted to our servers</p>
            <p><strong>Usage:</strong> Keys are only used to make direct API calls to the respective providers</p>
          </div>
        )}
      </div>
    </div>
  )
}

// API Key Input Component
function APIKeyInput({ 
  provider, 
  onSave 
}: { 
  provider: { id: string; name: string; placeholder: string }
  onSave: (apiKey: string) => void 
}) {
  const [apiKey, setApiKey] = useState('')

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={provider.placeholder}
          className="w-full px-3 py-2 border rounded-md"
        />
        <p className="text-xs text-gray-500 mt-1">
          Model selection is handled in the main provider selector above
        </p>
      </div>
      
      <Button
        onClick={() => onSave(apiKey)}
        disabled={!apiKey.trim()}
        className="w-full"
      >
        Save API Key
      </Button>
    </div>
  )
}
