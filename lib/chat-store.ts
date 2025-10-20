import { generateId } from 'ai'
import { existsSync, mkdirSync } from 'fs'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
import { UIMessage } from 'ai'

export async function createChat(): Promise<string> {
  const id = generateId()
  await writeFile(getChatFile(id), '[]')
  return id
}

export async function loadChat(id: string): Promise<UIMessage[]> {
  try {
    const chatFile = getChatFile(id)
    if (!existsSync(chatFile)) {
      // Create the chat file if it doesn't exist
      await writeFile(chatFile, '[]')
      return []
    }
    const content = await readFile(chatFile, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error loading chat:', error)
    return []
  }
}

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string
  messages: UIMessage[]
}): Promise<void> {
  const content = JSON.stringify(messages, null, 2)
  await writeFile(getChatFile(chatId), content)
}

function getChatFile(id: string): string {
  const chatDir = path.join(process.cwd(), '.chats')
  if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true })
  return path.join(chatDir, `${id}.json`)
}
