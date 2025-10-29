'use client'

import { useState } from 'react'
import { Settings, X, Key, Server, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SimpleSwitch } from '@/components/ui/simple-switch'
import APIKeyManager from './api-key-manager'
import MCPServersSummary from './mcp-servers-summary'
import { type ProviderConfig } from '@/lib/api-key-manager'
import { mcpSettingsManager } from '@/lib/mcp-settings-manager'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  onKeysUpdated: (configs: Record<string, ProviderConfig>) => void
  onMCPSettingsUpdated?: () => void
}

export default function SettingsPanel({ isOpen, onClose, onKeysUpdated, onMCPSettingsUpdated }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'keys' | 'servers' | 'mcp-settings'>('keys')
  const [mcpServers, setMcpServers] = useState(mcpSettingsManager.getAllServerSettings())

  const handleMCPServerToggle = (serverId: string) => {
    const newState = mcpSettingsManager.toggleServer(serverId)
    setMcpServers(mcpSettingsManager.getAllServerSettings())
    onMCPSettingsUpdated?.()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg shadow-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Settings & Configuration</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('keys')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'keys'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Key className="w-4 h-4" />
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('servers')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'servers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Server className="w-4 h-4" />
              MCP Servers
            </button>
            <button
              onClick={() => setActiveTab('mcp-settings')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'mcp-settings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ToggleLeft className="w-4 h-4" />
              Enable/Disable
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'keys' && (
            <APIKeyManager onKeysUpdated={onKeysUpdated} />
          )}
          {activeTab === 'servers' && (
            <MCPServersSummary onApiKeyUpdate={onKeysUpdated} />
          )}
          {activeTab === 'mcp-settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">MCP Server Settings</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Enable or disable MCP servers to control which tools are available in your chat.
                </p>
              </div>
              
              <div className="space-y-4">
                {mcpServers.map((server) => (
                  <div key={server.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <Server className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{server.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {server.category} • {server.enabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${server.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                        {server.enabled ? 'ON' : 'OFF'}
                      </span>
                      <Switch
                        checked={server.enabled}
                        onCheckedChange={() => handleMCPServerToggle(server.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Reset to Defaults</h4>
                    <p className="text-sm text-muted-foreground">
                      Reset all MCP servers to their default enabled state
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      mcpSettingsManager.resetToDefaults()
                      setMcpServers(mcpSettingsManager.getAllServerSettings())
                      onMCPSettingsUpdated?.()
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
