import { supabase, API_HOST } from './supabase'
import type { IntegrationType } from './types'

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? ''}`,
  }
}

export async function getConnectionStatus() {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_HOST}/connection`, { headers })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<{ connected: boolean; qr: string }>
}

export async function getIntegrations() {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_HOST}/integrations`, { headers })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<{ integrations: { id: string; name: string; type: IntegrationType; identifier: string; connected: boolean }[] }>
}

export async function connectIntegration(type: string, name: string, identifier: string) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_HOST}/integrations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type, name, identifier }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to start connection' }))
    throw new Error(err.error || 'Failed to start connection')
  }
  return res.json() as Promise<{ auth_url?: string }>
}

export async function disconnectIntegration(id: string) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_HOST}/integrations`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

export async function getProducts() {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_HOST}/products`, { headers })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<{ products: { name: string; description: string; price: number; quantity: number }[] }>
}

export async function sendBroadcast(messages: { phone: string; message: string }[]) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_HOST}/broadcast`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Broadcast failed' }))
    throw new Error(err.error || 'Broadcast failed')
  }
  return res.json() as Promise<{ sent: number; failed: number }>
}
