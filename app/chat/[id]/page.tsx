import { loadChat } from '@/lib/chat-store'
import ChatInterface from '@/components/chat-interface'

export default async function ChatPage(props: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await props.params
  const messages = await loadChat(id)
  
  return <ChatInterface id={id} initialMessages={messages} />
}
