import Constants from 'expo-constants'
import type { CartItem, ChatRequest, ChatResponse, MenuItem } from '@bistro/shared'

// In dev, derive the API host from the Expo dev server address (hostUri),
// so it tracks your machine's IP automatically when you switch networks.
// extra.apiUrl is an explicit override for when the API runs elsewhere.
function resolveApiUrl(): string {
  const override = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl
  if (override) return override

  const hostUri = Constants.expoConfig?.hostUri
  if (hostUri) return `http://${hostUri.split(':')[0]}:4000`

  return 'http://localhost:4000'
}

const apiUrl = resolveApiUrl()

export async function fetchMenu(): Promise<MenuItem[]> {
  const res = await fetch(`${apiUrl}/menu`)
  if (!res.ok) throw new Error(`Menu fetch failed: ${res.status}`)
  const data = (await res.json()) as { items: MenuItem[] }
  return data.items
}

export async function sendChat(
  message: string,
  cart: CartItem[],
  history?: ChatRequest['history'],
): Promise<ChatResponse> {
  const res = await fetch(`${apiUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, cart, history }),
  })
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`)
  return (await res.json()) as ChatResponse
}
