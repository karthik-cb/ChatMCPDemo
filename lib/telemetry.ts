import { z } from 'zod'

// Telemetry metadata schema
export const telemetrySchema = z.object({
  provider: z.string(),
  model: z.string(),
  startTime: z.number(),
  endTime: z.number().optional(),
  tokensUsed: z.number().optional(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  latency: z.number().optional(),
  toolCalls: z.number().optional(),
  msToFirstChunk: z.number().optional(),
  msToFinish: z.number().optional(),
  avgCompletionTokensPerSecond: z.number().optional(),
  error: z.string().optional(),
})

export type TelemetryData = z.infer<typeof telemetrySchema>

export interface PerformanceMetrics {
  provider: string
  averageLatency: number
  totalRequests: number
  successRate: number
  averageTokensUsed: number
  toolCallSuccessRate: number
  averageTTFT?: number
  averageE2E?: number
  averageTokensIn?: number
  averageTokensOut?: number
  averageCompletionTokensPerSecond?: number
}

export class TelemetryCollector {
  private metrics: Map<string, TelemetryData[]> = new Map()

  recordRequest(data: TelemetryData) {
    const provider = data.provider
    if (!this.metrics.has(provider)) {
      this.metrics.set(provider, [])
    }
    this.metrics.get(provider)!.push(data)
  }

  getMetrics(provider: string): PerformanceMetrics | null {
    const data = this.metrics.get(provider)
    if (!data || data.length === 0) return null

    const completed = data.filter(d => d.endTime && !d.error)
    const totalRequests = data.length
    const successfulRequests = completed.length
    const successRate = (successfulRequests / totalRequests) * 100

    const averageLatency = completed.length > 0 
      ? completed.reduce((sum, d) => sum + (d.msToFinish ?? d.latency ?? 0), 0) / completed.length 
      : 0

    const averageTokensUsed = completed.length > 0
      ? completed.reduce((sum, d) => sum + (d.tokensUsed ?? ((d.inputTokens || 0) + (d.outputTokens || 0))), 0) / completed.length
      : 0

    const toolCalls = completed.filter(d => d.toolCalls && d.toolCalls > 0)
    const toolCallSuccessRate = toolCalls.length > 0 
      ? (toolCalls.length / completed.length) * 100 
      : 0

    const averageTTFT = completed.length > 0
      ? completed.reduce((sum, d) => sum + (d.msToFirstChunk || 0), 0) / completed.length
      : 0

    const averageE2E = completed.length > 0
      ? completed.reduce((sum, d) => sum + (d.msToFinish || 0), 0) / completed.length
      : 0

    const averageTokensIn = completed.length > 0
      ? completed.reduce((sum, d) => sum + (d.inputTokens || 0), 0) / completed.length
      : 0

    const averageTokensOut = completed.length > 0
      ? completed.reduce((sum, d) => sum + (d.outputTokens || 0), 0) / completed.length
      : 0

    const averageCompletionTokensPerSecond = completed.length > 0
      ? completed.reduce((sum, d) => sum + (d.avgCompletionTokensPerSecond || 0), 0) / completed.length
      : 0

    return {
      provider,
      averageLatency,
      totalRequests,
      successRate,
      averageTokensUsed,
      toolCallSuccessRate,
      averageTTFT,
      averageE2E,
      averageTokensIn,
      averageTokensOut,
      averageCompletionTokensPerSecond,
    }
  }

  getAllMetrics(): Record<string, PerformanceMetrics> {
    const result: Record<string, PerformanceMetrics> = {}
    for (const provider of Array.from(this.metrics.keys())) {
      const metrics = this.getMetrics(provider)
      if (metrics) {
        result[provider] = metrics
      }
    }
    return result
  }

  clear() {
    this.metrics.clear()
  }
}

// Global telemetry collector instance
export const telemetryCollector = new TelemetryCollector()
