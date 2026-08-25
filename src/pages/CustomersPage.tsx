import { useState, useEffect, useRef } from 'react'
import { Users, Search, Send, ArrowLeft, MessageCircle, Loader as Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatRelativeTime, initials, formatPhone } from '../lib/utils'
import type { Customer, Message } from '../lib/types'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

export default function CustomersPage() {
  const { business } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selected, setSelected] = useState<Customer | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [msgInput, setMsgInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!business) return
    supabase.from('customers').select('*').eq('business_id', business.id).order('created_at', { ascending: false })
      .then(({ data }) => { setCustomers((data as Customer[]) || []); setLoading(false) })
  }, [business])

  useEffect(() => {
    if (!selected) return
    supabase.from('messages').select('*').eq('customer_id', selected.id).order('created_at', { ascending: true })
      .then(({ data }) => setMessages((data as Message[]) || []))
  }, [selected])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function handleSendMessage() {
    if (!selected || !msgInput.trim()) return
    const content = msgInput.trim()
    setMsgInput('')
    setSending(true)
    const { data } = await supabase.from('messages').insert({ customer_id: selected.id, content, role: 'assistant' }).select('*').single()
    if (data) setMessages((prev) => [...prev, data as Message])
    setSending(false)
  }

  const filtered = customers.filter((c) => (c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)))

  if (loading) {
    return (
      <div>
        <PageHeader title="Customers" description="Manage your customer conversations" />
        <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Customers" description="Manage your customer conversations" />
      {customers.length === 0 ? (
        <EmptyState icon={<Users className="h-5 w-5" />} title="No customers yet" description="Customers will appear here once they start chatting with your AI agent on WhatsApp" />
      ) : (
        <div className="card overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            <div className={`flex flex-col border-r border-gray-200 ${selected ? 'hidden w-72 shrink-0 md:flex' : 'w-full md:w-72'}`}>
              <div className="border-b border-gray-200 p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9 py-2" placeholder="Search..." />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filtered.map((c) => (
                  <button key={c.id} onClick={() => setSelected(c)} className={`flex w-full items-center gap-3 border-b border-gray-50 px-3 py-3 text-left transition-colors hover:bg-gray-50 ${selected?.id === c.id ? 'bg-primary-50' : ''}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">{initials(c.name)}</div>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-gray-900">{c.name || 'Unknown'}</p><p className="truncate text-xs text-gray-400">{formatPhone(c.phone)}</p></div>
                    <span className="shrink-0 text-xs text-gray-400">{formatRelativeTime(c.created_at)}</span>
                  </button>
                ))}
              </div>
            </div>
            {selected ? (
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
                  <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 md:hidden"><ArrowLeft className="h-5 w-5" /></button>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">{initials(selected.name)}</div>
                  <div><p className="text-sm font-semibold text-gray-900">{selected.name || 'Unknown'}</p><p className="text-xs text-gray-400">{formatPhone(selected.phone)}</p></div>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center"><MessageCircle className="mb-2 h-8 w-8 text-gray-300" /><p className="text-sm text-gray-400">No messages yet</p></div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.role === 'assistant' ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'}`}>
                          {msg.content}
                          <p className={`mt-1 text-xs ${msg.role === 'assistant' ? 'text-primary-200' : 'text-gray-400'}`}>{formatRelativeTime(msg.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-gray-200 p-3">
                  <div className="flex items-center gap-2">
                    <input type="text" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="input flex-1" placeholder="Type a message..." disabled={sending} />
                    <button onClick={handleSendMessage} disabled={!msgInput.trim() || sending} className="btn-primary !px-3">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden flex-1 flex-col items-center justify-center text-center md:flex"><MessageCircle className="mb-3 h-10 w-10 text-gray-300" /><p className="text-sm text-gray-400">Select a customer to view conversation</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
