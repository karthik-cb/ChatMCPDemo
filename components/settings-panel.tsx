'use client'

import { useState } from 'react'
import { Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import APIKeyManager from './api-key-manager'
import { type ProviderConfig } from '@/lib/api-key-manager'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  onKeysUpdated: (configs: Record<string, ProviderConfig>) => void
}

export default function SettingsPanel({ isOpen, onClose, onKeysUpdated }: SettingsPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <h2 className="text-xl font-semibold">API Key Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <APIKeyManager onKeysUpdated={onKeysUpdated} />
        </div>
      </div>
    </div>
  )
}
