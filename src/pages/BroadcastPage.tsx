import { useState, useEffect, useMemo } from 'react'
import { Send, Loader as Loader2, Users, X, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, SquareCheck as CheckSquare, Square, ChevronDown, ChevronUp, Variable } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { sendBroadcast } from '../lib/api'
import { formatPhone, initials, stripWhatsAppSuffix } from '../lib/utils'
import type { Customer, Business } from '../lib/types'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

const BUSINESS_VARS: { key: string; label: string }[] = [
  { key: 'business.name', label: 'Business Name' },
  { key: 'business.phone', label: 'Business Phone' },
  { key: 'business.type', label: 'Business Type' },
  { key: 'business.country', label: 'Business Country' },
  { key: 'business.currency', label: 'Business Currency' },
  { key: 'business.language', label: 'Business Language' },
]

const CUSTOMER_VARS: { key: string; label: string }[] = [
  { key: 'customer.name', label: 'Customer Name' },
  { key: 'customer.phone', label: 'Customer Phone' },
  { key: 'customer.country', label: 'Customer Country' },
  { key: 'customer.city', label: 'Customer City' },
]

function getVarValue(path: string, business: Business, customer: Customer): string {
  const [entity, field] = path.split('.')
  if (entity === 'business') {
    const b = business as unknown as Record<string, unknown>
    if (field === 'phone') return formatPhone(String(b[field] ?? ''))
    return String(b[field] ?? '')
  }
  if (entity === 'customer') {
    const c = customer as unknown as Record<string, unknown>
    if (field === 'phone') return formatPhone(String(c[field] ?? ''))
    return String(c[field] ?? '')
  }
  return ''
}

function fillTemplate(template: string, business: Business, customer: Customer): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_match, expr: string) => {
    const key = expr.trim()
    return getVarValue(key, business, customer)
  })
}

export default function BroadcastPage() {
  const { business } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [template, setTemplate] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showVars, setShowVars] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (!business) return
    supabase.from('customers').select('*').eq('business_id', business.id).order('created_at', { ascending: false })
      .then(({ data }) => { setCustomers((data as Customer[]) || []); setLoading(false) })
  }, [business])

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers
    const q = search.toLowerCase()
    return customers.filter((c) => (c.name?.toLowerCase().includes(q) || c.phone.includes(q)))
  }, [customers, search])

  const selectedCustomers = useMemo(() => customers.filter((c) => selectedIds.has(c.id)), [customers, selectedIds])

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() { setSelectedIds(new Set(filteredCustomers.map((c) => c.id))) }
  function unselectAll() { setSelectedIds(new Set()) }

  function insertVar(key: string) {
    setTemplate((prev) => `${prev}{{${key}}}`)
  }

  const previewMessages = useMemo(() => {
    if (!business || !template.trim()) return []
    return selectedCustomers.slice(0, 3).map((c) => ({
      name: c.name || formatPhone(c.phone),
      rendered: fillTemplate(template, business, c),
    }))
  }, [business, template, selectedCustomers])

  async function handleSend() {
    if (!business) return
    if (selectedCustomers.length === 0) { setError('Select at least one customer'); return }
    if (!template.trim()) { setError('Write a message template'); return }
    setSending(true); setError(null); setResult(null)
    try {
      const messages = selectedCustomers.map((c) => ({
        phone: stripWhatsAppSuffix(c.phone),
        message: fillTemplate(template, business, c),
      }))
      const data = await sendBroadcast(messages)
      setResult({ success: data.sent, failed: data.failed })
      setSelectedIds(new Set())
      setTemplate('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Broadcast failed') }
    setSending(false)
  }

  if (loading) {
    return (<div><PageHeader title="Broadcast" description="Send bulk messages to your customers" /><div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div></div>)
  }

  return (
    <div>
      <PageHeader title="Broadcast" description="Send personalized bulk messages to your customers via WhatsApp"
        action={<button onClick={handleSend} disabled={sending} className="btn-primary">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send Broadcast{selectedCustomers.length > 0 && ` (${selectedCustomers.length})`}</button>} />

      {result && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700 animate-slide-up dark:bg-accent-900/40 dark:text-accent-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Broadcast sent: {result.success} delivered{result.failed > 0 && `, ${result.failed} failed`}</span>
          <button onClick={() => setResult(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700 animate-slide-up dark:bg-error-900/40 dark:text-error-400">
          <AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span>
        </div>
      )}

      {customers.length === 0 ? (
        <EmptyState icon={<Users className="h-5 w-5" />} title="No customers yet" description="Add customers first to send broadcast messages" />
      ) : (
        <div className="space-y-6">
          {/* Customer selection */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Select Customers</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">{selectedIds.size} / {customers.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={selectAll} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors dark:hover:bg-primary-900/40">Select All</button>
                <button onClick={unselectAll} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-gray-700">Unselect All</button>
              </div>
            </div>

            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input mt-3" placeholder="Search by name or phone..." />

            <div className="mt-3 max-h-[420px] space-y-1 overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">No customers found</p>
              ) : filteredCustomers.map((c) => {
                const selected = selectedIds.has(c.id)
                return (
                  <button key={c.id} onClick={() => toggleSelect(c.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${selected ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                    {selected ? <CheckSquare className="h-4 w-4 shrink-0 text-primary-600" /> : <Square className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">{initials(c.name)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{c.name || 'Unknown'}</p>
                      <p className="truncate text-xs text-gray-400 dark:text-gray-500">{formatPhone(c.phone)}{c.city ? ` · ${c.city}` : ''}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Message template */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Message Template</span>
              <button onClick={() => setShowVars((v) => !v)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors dark:hover:bg-primary-900/40">
                <Variable className="h-3.5 w-3.5" /> Variables {showVars ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>

            {showVars && (
              <div className="mt-3 space-y-3 rounded-lg bg-gray-50 p-3 animate-slide-up dark:bg-gray-900/50">
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Business</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BUSINESS_VARS.map((v) => (
                      <button key={v.key} onClick={() => insertVar(v.key)} className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:border-primary-300 hover:bg-primary-50 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-primary-900/40">
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Customer</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CUSTOMER_VARS.map((v) => (
                      <button key={v.key} onClick={() => insertVar(v.key)} className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:border-primary-300 hover:bg-primary-50 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-primary-900/40">
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <textarea value={template} onChange={(e) => setTemplate(e.target.value)} className="input mt-3 min-h-[160px] resize-y font-mono text-sm" placeholder="Type your message... Click Variables to insert fields like {{customer.name}}" />

            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Variables like <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{`{{customer.name}}`}</code> will be replaced with each customer's data before sending.</p>
          </div>

          {/* Live preview */}
          {template.trim() && selectedCustomers.length > 0 && (
            <div className="card p-5">
              <button onClick={() => setShowPreview((p) => !p)} className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Preview (first {Math.min(3, selectedCustomers.length)})</span>
                {showPreview ? <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
              </button>
              {showPreview && (
                <div className="mt-3 space-y-3 animate-slide-up">
                  {previewMessages.map((p, i) => (
                    <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
                      <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{p.name}</p>
                      <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{p.rendered || <span className="text-gray-300 dark:text-gray-600">(empty)</span>}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
