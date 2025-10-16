'use client'

import { PerformanceMetrics } from '@/lib/telemetry'
import { BarChart3, Clock, CheckCircle, XCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricsPanelProps {
  metrics: Record<string, PerformanceMetrics>
}

export default function MetricsPanel({ metrics }: MetricsPanelProps) {
  const providers = Object.keys(metrics)
  
  if (providers.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Metrics
        </h3>
        <div className="text-center text-muted-foreground py-8">
          No metrics available yet. Start a conversation to see performance data.
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Performance Metrics
      </h3>
      
      <div className="space-y-4">
        {providers.map((provider) => {
          const data = metrics[provider]
          const isCerebras = provider === 'cerebras'
          
          return (
            <div
              key={provider}
              className={cn(
                'p-4 rounded-lg border',
                isCerebras 
                  ? 'border-purple-200 bg-purple-50' 
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">
                  {isCerebras ? '⚡' : provider === 'openai' ? '🤖' : '🧠'}
                </span>
                <span className="font-medium capitalize">
                  {provider}
                  {isCerebras && <span className="text-purple-600 ml-1">(Fast)</span>}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Avg Latency</div>
                    <div className="font-medium">
                      {data.averageLatency.toFixed(0)}ms
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Success Rate</div>
                    <div className="font-medium">
                      {data.successRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Requests</div>
                    <div className="font-medium">{data.totalRequests}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Tool Success</div>
                    <div className="font-medium">
                      {data.toolCallSuccessRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              
              {data.averageTokensUsed > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Avg Tokens: {data.averageTokensUsed.toFixed(0)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-3 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Try the same request with different providers to compare performance. 
          Cerebras typically shows faster response times for similar quality outputs.
        </div>
      </div>
    </div>
  )
}
