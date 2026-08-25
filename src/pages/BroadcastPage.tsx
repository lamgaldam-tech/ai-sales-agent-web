import { useState, useEffect } from 'react'
import { Send, Loader as Loader2, Users, Plus, X, CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatPhone, initials } from '../lib/utils'
import type { Customer } from '../lib/types'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

interface BroadcastEntry {
  phone: string
  message: string
  customerName?: string
}

export default function BroadcastPage() {
  const { business } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [entries, setEntries] = useState<BroadcastEntry[]>([{ phone: '', message: '' }])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!business) return
    supabase
      .from('customers')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCustomers((data as Customer[]) || [])
        setLoading(false)
      })
  }, [business])

  function addEntry() {
    setEntries((prev) => [...prev, { phone: '', message: '' }])
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function updateEntry(index: number, field: keyof BroadcastEntry, value: string) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  function addCustomer(customer: Customer) {
    setEntries((prev) => {
      if (prev.some((e) => e.phone === customer.phone)) return prev
      return [...prev, { phone: customer.phone, message: '', customerName: customer.name || undefined }]
    })
  }

  async function handleSend() {
    const valid = entries.filter((e) => e.phone.trim() && e.message.trim())
    if (valid.length === 0) {
      setError('Add at least one message with phone and content')
      return
    }

    setSending(true)
    setError(null)
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api/broadcast`
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: valid.map((e) => ({ phone: e.phone, message: e.message })),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult({ success: data.sent || valid.length, failed: data.failed || 0 })
        setEntries([{ phone: '', message: '' }])
      } else {
        const err = await res.json().catch(() => ({ error: 'Broadcast failed' }))
        setError(err.error || 'Broadcast failed')
      }
    } catch {
      setError('Network error — please try again')
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Broadcast" description="Send bulk messages to your customers" />
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Broadcast"
        description="Send bulk messages to your customers via WhatsApp"
        action={
          <button onClick={handleSend} disabled={sending} className="btn-primary">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Broadcast
          </button>
        }
      />

      {result && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700 animate-slide-up">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Broadcast sent: {result.success} delivered{result.failed > 0 && `, ${result.failed} failed`}</span>
          <button onClick={() => setResult(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700 animate-slide-up">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {customers.length > 0 && (
        <div className="mb-6 card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Quick add from customers</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {customers.slice(0, 10).map((c) => (
              <button
                key={c.id}
                onClick={() => addCustomer(c)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {initials(c.name)}
                </div>
                {c.name || formatPhone(c.phone)}
                <Plus className="h-3 w-3 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Message {index + 1}
              </span>
              {entries.length > 1 && (
                <button
                  onClick={() => removeEntry(index)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  value={entry.phone}
                  onChange={(e) => updateEntry(index, 'phone', e.target.value)}
                  className="input"
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea
                  value={entry.message}
                  onChange={(e) => updateEntry(index, 'message', e.target.value)}
                  className="input min-h-[80px] resize-y"
                  placeholder="Type your broadcast message..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addEntry} className="mt-4 btn-secondary w-full">
        <Plus className="h-4 w-4" /> Add Another Message
      </button>
    </div>
  )
}
