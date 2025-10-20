'use client'

import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronRight, FileText, Hash, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface JsonViewerProps {
  args: {
    data: any
  }
  result: any
}

interface JsonNodeProps {
  data: any
  key?: string
  level?: number
  isLast?: boolean
}

function JsonNode({ data, key, level = 0, isLast = false }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
  const [copied, setCopied] = useState(false)

  const indent = '  '.repeat(level)
  const isObject = typeof data === 'object' && data !== null && !Array.isArray(data)
  const isArray = Array.isArray(data)
  const isPrimitive = !isObject && !isArray

  const handleCopy = async (value: any) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getValueType = (value: any) => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object') return 'object'
    return typeof value
  }

  const getValueColor = (value: any) => {
    const type = getValueType(value)
    switch (type) {
      case 'string': return 'text-green-600 dark:text-green-400'
      case 'number': return 'text-blue-600 dark:text-blue-400'
      case 'boolean': return 'text-purple-600 dark:text-purple-400'
      case 'null': return 'text-gray-500'
      default: return 'text-gray-700 dark:text-gray-300'
    }
  }

  const formatValue = (value: any) => {
    if (value === null) return 'null'
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'boolean') return value.toString()
    if (typeof value === 'number') return value.toString()
    return JSON.stringify(value)
  }

  if (isPrimitive) {
    return (
      <div className="flex items-center gap-2 group">
        <span className="text-gray-500 text-sm">{indent}</span>
        {key && (
          <>
            <span className="text-blue-600 dark:text-blue-400 font-medium">"{key}"</span>
            <span className="text-gray-500">:</span>
          </>
        )}
        <span className={`${getValueColor(data)} font-mono`}>
          {formatValue(data)}
        </span>
        <button
          onClick={() => handleCopy(data)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3 text-gray-400" />
          )}
        </button>
      </div>
    )
  }

  const entries = isArray ? data.map((item, index) => [index, item]) : Object.entries(data)
  const hasChildren = entries.length > 0

  return (
    <div>
      <div className="flex items-center gap-2 group">
        <span className="text-gray-500 text-sm">{indent}</span>
        {key && (
          <>
            <span className="text-blue-600 dark:text-blue-400 font-medium">"{key}"</span>
            <span className="text-gray-500">:</span>
          </>
        )}
        
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-500" />
            )}
          </button>
        )}

        <span className={`${getValueColor(data)} font-mono`}>
          {isArray ? '[' : '{'}
          {!isExpanded && hasChildren && (
            <span className="text-gray-500">
              {isArray ? ` ${entries.length} items` : ` ${entries.length} properties`}
            </span>
          )}
          {!hasChildren && (isArray ? ']' : '}')}
        </span>

        <button
          onClick={() => handleCopy(data)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3 text-gray-400" />
          )}
        </button>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {entries.map(([entryKey, entryValue], index) => (
            <JsonNode
              key={entryKey}
              data={entryValue}
              level={level + 1}
              isLast={index === entries.length - 1}
            />
          ))}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">{indent}</span>
            <span className="text-gray-700 dark:text-gray-300 font-mono">
              {isArray ? ']' : '}'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function JsonViewer({ args, result }: JsonViewerProps) {
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree')

  const dataToDisplay = result || args.data

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(dataToDisplay, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getDataStats = (data: any) => {
    if (Array.isArray(data)) {
      return {
        type: 'Array',
        count: data.length,
        icon: <Hash className="w-4 h-4" />
      }
    } else if (typeof data === 'object' && data !== null) {
      return {
        type: 'Object',
        count: Object.keys(data).length,
        icon: <FileText className="w-4 h-4" />
      }
    } else {
      return {
        type: typeof data,
        count: 1,
        icon: <Quote className="w-4 h-4" />
      }
    }
  }

  const stats = getDataStats(dataToDisplay)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {stats.icon}
          <span className="font-medium">JSON Data</span>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
            {stats.type}
          </span>
          <span className="text-sm text-muted-foreground">
            {stats.count} {stats.type === 'Array' ? 'items' : stats.type === 'Object' ? 'properties' : 'value'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'tree'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tree
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'raw'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Raw
            </button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            className="flex items-center gap-2"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? 'Copied!' : 'Copy All'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
        {viewMode === 'tree' ? (
          <div className="font-mono text-sm">
            <JsonNode data={dataToDisplay} />
          </div>
        ) : (
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(dataToDisplay, null, 2)}
          </pre>
        )}
      </div>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground">
        <p>Size: {JSON.stringify(dataToDisplay).length} characters</p>
        <p>Generated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}
