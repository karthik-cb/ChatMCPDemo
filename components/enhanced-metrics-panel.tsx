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
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [providerComparison, setProviderComparison] = useState<ProviderComparison[]>([])

  // Generate mock time series data for demonstration
  useEffect(() => {
    const generateTimeSeriesData = () => {
      const data: ChartData[] = []
      const now = new Date()
      const intervals = timeRange === '1h' ? 12 : timeRange === '6h' ? 24 : timeRange === '24h' ? 48 : 168
      const intervalMs = timeRange === '1h' ? 5 * 60 * 1000 : timeRange === '6h' ? 15 * 60 * 1000 : timeRange === '24h' ? 30 * 60 * 1000 : 60 * 60 * 1000

      for (let i = intervals; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * intervalMs)
        const dataPoint: ChartData = {
          timestamp: timestamp.toLocaleTimeString(),
          cerebras: Math.random() * 200 + 50, // 50-250ms
          openai: Math.random() * 800 + 200,  // 200-1000ms
          anthropic: Math.random() * 600 + 300, // 300-900ms
        }
        data.push(dataPoint)
      }
      setChartData(data)
    }

    generateTimeSeriesData()
  }, [timeRange])

  // Generate provider comparison data
  useEffect(() => {
    const comparison: ProviderComparison[] = [
      {
        provider: 'Cerebras',
        avgLatency: 150,
        successRate: 98.5,
        totalRequests: 1250,
        avgTokens: 45,
        color: '#8b5cf6'
      },
      {
        provider: 'OpenAI',
        avgLatency: 650,
        successRate: 97.2,
        totalRequests: 980,
        avgTokens: 52,
        color: '#10b981'
      },
      {
        provider: 'Anthropic',
        avgLatency: 750,
        successRate: 96.8,
        totalRequests: 720,
        avgTokens: 48,
        color: '#f59e0b'
      }
    ]
    setProviderComparison(comparison)
  }, [])

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'cerebras': return '⚡'
      case 'openai': return '🤖'
      case 'anthropic': return '🧠'
      default: return '🔧'
    }
  }

  const getPerformanceGrade = (latency: number) => {
    if (latency < 200) return { grade: 'A+', color: '#10b981', label: 'Excellent' }
    if (latency < 400) return { grade: 'A', color: '#22c55e', label: 'Very Good' }
    if (latency < 600) return { grade: 'B', color: '#eab308', label: 'Good' }
    if (latency < 800) return { grade: 'C', color: '#f59e0b', label: 'Fair' }
    return { grade: 'D', color: '#ef4444', label: 'Poor' }
  }

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
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fastest Provider</p>
                    <p className="text-lg font-semibold">Cerebras</p>
                    <p className="text-xs text-green-600">150ms avg</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-lg font-semibold">98.5%</p>
                    <p className="text-xs text-green-600">+1.3% vs others</p>
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
                    <p className="text-lg font-semibold">2,950</p>
                    <p className="text-xs text-blue-600">+27% this week</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Efficiency</p>
                    <p className="text-lg font-semibold">$0.12</p>
                    <p className="text-xs text-orange-600">per 1K tokens</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Performance */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Real-time Performance</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cerebras" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="openai" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="anthropic" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Latency Comparison */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Response Time Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cerebras" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
                  <Line type="monotone" dataKey="openai" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                  <Line type="monotone" dataKey="anthropic" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Grades */}
            <div className="grid grid-cols-3 gap-4">
              {providerComparison.map((provider) => {
                const performance = getPerformanceGrade(provider.avgLatency)
                return (
                  <div key={provider.provider} className="bg-card border rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">{getProviderIcon(provider.provider)}</div>
                    <h4 className="font-semibold mb-2">{provider.provider}</h4>
                    <div className="text-3xl font-bold mb-1" style={{ color: performance.color }}>
                      {performance.grade}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{performance.label}</p>
                    <p className="text-lg font-semibold">{provider.avgLatency}ms</p>
                    <p className="text-xs text-muted-foreground">avg latency</p>
                  </div>
                )
              })}
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
            {/* Usage Distribution */}
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

            {/* Token Usage */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Token Usage Efficiency</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={providerComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgTokens" fill="#f59e0b" name="Avg Tokens per Request" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
