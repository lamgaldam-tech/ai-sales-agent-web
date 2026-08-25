export type BusinessPlan = 'free' | 'basic' | 'pro'

export interface Business {
  id: string
  name: string
  phone: string
  type: string
  country: string
  currency: string
  language: string
  plan: BusinessPlan
  created_at: string
  updated_at: string
}

export type IntegrationType = 'shopify' | 'youcan' | 'google_sheets'

export interface Integration {
  id: string
  business_id: string
  type: IntegrationType
  name: string
  identifier: string
  access_token: string
  refresh_token: string
  created_at: string
  updated_at: string
}

export interface IntegrationStatus {
  id: string
  name: string
  type: IntegrationType
  identifier: string
  connected: boolean
}

export interface Prompt {
  id: string
  business_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  business_id: string
  phone: string
  name: string | null
  country: string | null
  city: string | null
  created_at: string
  updated_at: string
}

export type MessageRole = 'system' | 'assistant' | 'user'

export interface Message {
  id: string
  customer_id: string
  content: string
  role: MessageRole
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  revenue: number
  created_at: string
  updated_at: string
}

export interface CustomerWithStats extends Customer {
  message_count?: number
  last_message_at?: string | null
  order_count?: number
  total_revenue?: number
}

export interface Product {
  name: string
  description: string
  price: number
  quantity: number
}
