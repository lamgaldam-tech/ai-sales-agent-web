import { useState, useEffect } from 'react'
import { Plus, Trash2, CircleCheck as CheckCircle2, Circle as XCircle, ShoppingCart, Sheet, Store, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getIntegrations, disconnectIntegration, buildIntegrationRedirectUrl, extractSheetId } from '../lib/api'
import type { IntegrationType, IntegrationStatus } from '../lib/types'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

const INTEGRATION_META: Record<IntegrationType, { label: string; icon: typeof Store; color: string; placeholder: string }> = {
  shopify: { label: 'Shopify', icon: Store, color: 'bg-green-50 text-green-600', placeholder: 'mystore.myshopify.com' },
  youcan: { label: 'YouCan', icon: ShoppingCart, color: 'bg-orange-50 text-orange-600', placeholder: 'mystore.youcan.shop' },
  google_sheets: { label: 'Google Sheets', icon: Sheet, color: 'bg-blue-50 text-blue-600', placeholder: 'Sheet ID or URL' },
}

export default function IntegrationsPage() {
  const { business } = useAuth()
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newType, setNewType] = useState<IntegrationType>('shopify')
  const [inputValue, setInputValue] = useState('')

  async function fetchIntegrations() {
    if (!business) return
    try {
      const data = await getIntegrations()
      setIntegrations(data.integrations || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchIntegrations() }, [business])

  function handleConnect() {
    if (!business || !inputValue.trim()) return
    const raw = inputValue.trim()
    const name = newType === 'google_sheets' ? extractSheetId(raw) : raw
    if (!name) return
    const url = buildIntegrationRedirectUrl(business.id, name, newType)
    window.open(url, '_blank', 'width=600,height=700')
    setShowAdd(false)
    setInputValue('')
    setNewType('shopify')
    setTimeout(() => fetchIntegrations(), 3000)
  }

  function handleReconnect(identifier: string, type: IntegrationType) {
    if (!business) return
    const url = buildIntegrationRedirectUrl(business.id, identifier, type)
    window.open(url, '_blank', 'width=600,height=700')
    setTimeout(() => fetchIntegrations(), 3000)
  }

  async function handleDisconnect(id: string) {
    if (!confirm('Remove this integration?')) return
    try { await disconnectIntegration(id); fetchIntegrations() }
    catch { alert('Failed to remove integration') }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Integrations" description="Connect your data sources" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="card h-40 animate-pulse bg-gray-100" />)}</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Integrations" description="Connect your store and data sources to feed product info to your AI agent"
        action={<button onClick={() => setShowAdd(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Integration</button>} />

      {integrations.length === 0 ? (
        <EmptyState icon={<Plus className="h-5 w-5" />} title="No integrations yet" description="Connect Shopify, YouCan, or Google Sheets to sync your products"
          action={<button onClick={() => setShowAdd(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Integration</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((int) => {
            const meta = INTEGRATION_META[int.type]
            const Icon = meta.icon
            return (
              <div key={int.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.color}`}><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-gray-900" title={int.name}>{int.name}</p><p className="text-xs text-gray-400">{meta.label}</p></div>
                  </div>
                  {int.connected ? <CheckCircle2 className="h-5 w-5 text-accent-500" /> : <XCircle className="h-5 w-5 text-gray-300" />}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-xs font-medium ${int.connected ? 'text-accent-600' : 'text-gray-400'}`}>{int.connected ? 'Connected' : 'Not connected'}</span>
                  <div className="flex items-center gap-1">
                    {!int.connected && (
                      <button onClick={() => handleReconnect(int.identifier, int.type)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors" title="Connect">
                        <ExternalLink className="h-3.5 w-3.5" /> Connect
                      </button>
                    )}
                    <button onClick={() => handleDisconnect(int.id)} className="rounded-lg p-2 text-gray-400 hover:bg-error-50 hover:text-error-600 transition-colors" title="Remove"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={() => { setShowAdd(false); setInputValue(''); setNewType('shopify') }}>
          <div className="w-full max-w-md card p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900">Add Integration</h2>
            <p className="mt-1 text-sm text-gray-500">Choose a platform and enter your details</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="label">Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(INTEGRATION_META) as IntegrationType[]).map((type) => {
                    const meta = INTEGRATION_META[type]
                    const Icon = meta.icon
                    return (
                      <button key={type} onClick={() => { setNewType(type); setInputValue('') }} className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${newType === type ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <Icon className="h-6 w-6 text-gray-600" /><span className="text-xs font-medium text-gray-700">{meta.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="label">{newType === 'google_sheets' ? 'Sheet ID or URL' : 'Store Domain'}</label>
                <input
                  type="text"
                  required
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="input"
                  placeholder={INTEGRATION_META[newType].placeholder}
                />
                {newType === 'google_sheets' && (
                  <p className="mt-1.5 text-xs text-gray-400">Paste the spreadsheet URL or ID. If a URL is pasted, the sheet ID will be extracted automatically.</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setShowAdd(false); setInputValue(''); setNewType('shopify') }} className="btn-secondary">Cancel</button>
              <button onClick={handleConnect} disabled={!inputValue.trim()} className="btn-primary">
                <ExternalLink className="h-4 w-4" /> Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
