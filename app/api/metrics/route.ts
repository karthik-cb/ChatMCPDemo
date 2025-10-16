import { telemetryCollector } from '@/lib/telemetry'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const metrics = telemetryCollector.getAllMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    telemetryCollector.clear()
    return NextResponse.json({ message: 'Metrics cleared' })
  } catch (error) {
    console.error('Clear metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to clear metrics' },
      { status: 500 }
    )
  }
}
