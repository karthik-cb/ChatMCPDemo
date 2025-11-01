'use client'

import { useState, useEffect } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  DollarSign,
  Activity,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { PerformanceMetrics } from '@/lib/telemetry'

interface EnhancedMetricsPanelProps {
  metrics: Record<string, PerformanceMetrics>
}

interface ChartData {
  timestamp: string
  [key: string]: string | number
}

interface ProviderComparison {
  provider: string
  avgLatency: number
  successRate: number
  totalRequests: number
  avgTokens: number
  color: string
  [key: string]: any
}

export default function EnhancedMetricsPanel({ metrics }: EnhancedMetricsPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'comparison' | 'usage'>('overview')
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')
  const [providerComparison, setProviderComparison] = useState<ProviderComparison[]>([])

  // Build provider comparison from real metrics
  useEffect(() => {
    const colors: Record<string, string> = {
      cerebras: '#8b5cf6',
      openai: '#10b981',
      anthropic: '#f59e0b',
    }
    const comparison: ProviderComparison[] = Object.entries(metrics).map(([providerKey, data]) => ({
      provider: providerKey.charAt(0).toUpperCase() + providerKey.slice(1),
      avgLatency: Math.max(0, Math.round(data.averageLatency || 0)),
      successRate: Math.max(0, Math.min(100, Number(data.successRate?.toFixed?.(1) ?? data.successRate))),
      totalRequests: data.totalRequests,
      avgTokens: Math.max(0, Math.round(data.averageTokensUsed || 0)),
      color: colors[providerKey] || '#64748b',
    }))
    setProviderComparison(comparison)
  }, [metrics])

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'cerebras': return '⚡'
      case 'openai': return '🤖'
      case 'anthropic': return '🧠'
      default: return '🔧'
    }
  }

  // Simple helpers only; no grading system

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'comparison', label: 'Comparison', icon: BarChart3 },
    { id: 'usage', label: 'Usage', icon: PieChartIcon }
  ]

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Metrics
          </h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Cards (from real data) */}
            <div className="grid grid-cols-2 gap-4">
              {(() => {
                const providers = Object.keys(metrics)
                if (providers.length === 0) {
                  return (
                    <div className="col-span-2 text-sm text-muted-foreground">
                      No metrics yet. Run a chat to collect telemetry.
                    </div>
                  )
                }
                const fastest = providers
                  .map((p) => ({ p, lat: metrics[p].averageLatency }))
                  .filter((x) => x.lat > 0)
                  .sort((a, b) => a.lat - b.lat)[0]
                const totalRequests = providers.reduce((s, p) => s + metrics[p].totalRequests, 0)
                const avgSuccess = providers.reduce((s, p) => s + metrics[p].successRate, 0) / providers.length
                return (
                  <>
                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fastest Provider</p>
                          <p className="text-lg font-semibold">
                            {fastest ? fastest.p : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fastest ? `${Math.round(fastest.lat)}ms avg` : 'No data yet'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Success Rate (avg)</p>
                          <p className="text-lg font-semibold">{isFinite(avgSuccess) ? `${avgSuccess.toFixed(1)}%` : '—'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Requests</p>
                          <p className="text-lg font-semibold">{totalRequests.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Tokens (avg)</p>
                          <p className="text-lg font-semibold">
                            {(
                              providers.reduce((s, p) => s + (metrics[p].averageTokensUsed || 0), 0) / providers.length
                            ).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Current Avg Latency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={providerComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="avgLatency" name="Avg Latency (ms)">
                    {providerComparison.map((entry, index) => (
                      <Cell key={`lat-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            {/* Provider Comparison Chart */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Provider Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={providerComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgLatency" fill="#8b5cf6" name="Avg Latency (ms)" />
                  <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Comparison Table */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Provider</th>
                      <th className="text-right p-2">Avg Latency</th>
                      <th className="text-right p-2">Success Rate</th>
                      <th className="text-right p-2">Total Requests</th>
                      <th className="text-right p-2">Avg Tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providerComparison.map((provider) => (
                      <tr key={provider.provider} className="border-b">
                        <td className="p-2 font-medium">{getProviderIcon(provider.provider)} {provider.provider}</td>
                        <td className="p-2 text-right">{provider.avgLatency}ms</td>
                        <td className="p-2 text-right">{provider.successRate}%</td>
                        <td className="p-2 text-right">{provider.totalRequests.toLocaleString()}</td>
                        <td className="p-2 text-right">{provider.avgTokens}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Request Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={providerComparison}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ provider, totalRequests }) => `${provider}: ${totalRequests}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalRequests"
                  >
                    {providerComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Avg Tokens per Request</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={providerComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgTokens" name="Avg Tokens">
                    {providerComparison.map((entry, index) => (
                      <Cell key={`tok-${index}`} fill="#f59e0b" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
