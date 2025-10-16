import { NextRequest, NextResponse } from 'next/server'
import { saveChat } from '@/lib/chat-store'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }
    
    // Clear the chat by saving an empty array
    await saveChat({ chatId: id, messages: [] })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing chat:', error)
    return NextResponse.json(
      { error: 'Failed to clear chat' },
      { status: 500 }
    )
  }
}
