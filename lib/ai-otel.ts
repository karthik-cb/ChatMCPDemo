import { telemetryCollector } from '@/lib/telemetry'
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { SimpleSpanProcessor, InMemorySpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'

let provider: NodeTracerProvider | null = null

// Initialize a Node tracer provider with a custom exporter that forwards AI SDK span attributes
export function getAITracer() {
  if (!provider) {
    try {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR)
    } catch {
      // ignore
    }

    provider = new NodeTracerProvider()

    class ForwardingExporter extends InMemorySpanExporter {
      export(spans: ReadableSpan[], resultCallback: (result: unknown) => void): void {
        try {
          for (const span of spans) {
            const attrs = span.attributes as Record<string, any>

            // Only consider AI SDK spans
            const opId = attrs['ai.operationId'] || ''
            const isStream = opId === 'ai.streamText.doStream' || span.name === 'ai.streamText.doStream' || span.name === 'ai.streamText'
            const isGen = opId === 'ai.generateText.doGenerate' || span.name === 'ai.generateText.doGenerate' || span.name === 'ai.generateText'
            if (!isStream && !isGen) continue

            // Attempt to derive provider from attributes
            const providerAttr = attrs['ai.model.provider'] || attrs['gen_ai.system'] || ''
            let providerName: string = typeof providerAttr === 'string' ? providerAttr.toLowerCase() : ''

            // Fallback: parse from functionId if provided like chat:provider:model
            const functionId = attrs['resource.name'] || attrs['ai.telemetry.functionId'] || ''
            if (!providerName && typeof functionId === 'string' && functionId.includes(':')) {
              const parts = functionId.split(':')
              if (parts.length >= 3) {
                providerName = parts[1]
              }
            }

            // Timing
            const msToFirstChunk = numberAttr(attrs['ai.response.msToFirstChunk'])
            const msToFinish = numberAttr(attrs['ai.response.msToFinish'])
            const avgCps = numberAttr(attrs['ai.response.avgCompletionTokensPerSecond'])

            // Tokens
            const inputTokens = numberAttr(attrs['gen_ai.usage.input_tokens'])
            const outputTokens = numberAttr(attrs['gen_ai.usage.output_tokens'])
            const tokensUsed = (isFinite(inputTokens) ? inputTokens : 0) + (isFinite(outputTokens) ? outputTokens : 0)

            // Times
            const startTime = hrTimeToMillis(span.startTime)
            const endTime = hrTimeToMillis(span.endTime)

            // Record to in-memory collector used by UI
            telemetryCollector.recordRequest({
              provider: providerName || 'unknown',
              model: String(attrs['gen_ai.request.model'] || attrs['ai.model.id'] || 'unknown'),
              startTime,
              endTime,
              latency: isFinite(msToFinish) ? msToFinish : (isFinite(endTime - startTime) ? (endTime - startTime) : undefined),
              tokensUsed: isFinite(tokensUsed) ? tokensUsed : undefined,
              inputTokens: isFinite(inputTokens) ? inputTokens : undefined,
              outputTokens: isFinite(outputTokens) ? outputTokens : undefined,
              msToFirstChunk: isFinite(msToFirstChunk) ? msToFirstChunk : undefined,
              msToFinish: isFinite(msToFinish) ? msToFinish : undefined,
              avgCompletionTokensPerSecond: isFinite(avgCps) ? avgCps : undefined,
            } as any)
          }
          resultCallback({ code: 0 })
        } catch (e) {
          resultCallback({ code: 1, error: e })
        }
      }
    }

    provider.addSpanProcessor(new SimpleSpanProcessor(new ForwardingExporter()))
    provider.register()
  }
  return provider.getTracer('ai')
}

function hrTimeToMillis(hr: [number, number]): number {
  if (!hr || !Array.isArray(hr)) return NaN
  const [sec, nsec] = hr
  return sec * 1000 + Math.round(nsec / 1e6)
}

function numberAttr(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : (typeof value === 'number' ? value : NaN)
  return isFinite(n) ? n : NaN
}


