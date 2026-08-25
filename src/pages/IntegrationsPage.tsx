import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, RefreshCw, CircleCheck as CheckCircle2, Circle as XCircle, Loader as Loader2, ShoppingCart, Sheet, Store } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getIntegrations, connectIntegration, disconnectIntegration } from '../lib/api'
import type { IntegrationType, IntegrationStatus } from '../lib/types'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

const INTEGRATION_META: Record<IntegrationType, { label: string; icon: typeof Store; color: string }> = {
  shopify: { label: 'Shopify', icon: Store, color: 'bg-green-50 text-green-600' },
  youcan: { label: 'YouCan', icon: ShoppingCart, color: 'bg-orange-50 text-orange-600' },
  google_sheets: { label: 'Google Sheets', icon: Sheet, color: 'bg-blue-50 text-blue-600' },
}

export default function IntegrationsPage() {
  const { business } = useAuth()
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newType, setNewType] = useState<IntegrationType>('shopify')
  const [newName, setNewName] = useState('')
  const [newIdentifier, setNewIdentifier] = useState('')
  const [connecting, setConnecting] = useState(false)
  const popupRef = useRef<Window | null>(null)

  async function fetchIntegrations() {
    if (!business) return
    try {
      const data = await getIntegrations()
      setIntegrations(data.integrations || [])
    } catch {
      // ignore
    }
    setLoading(false)
  }

  useEffect(() => { fetchIntegrations() }, [business])

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'OAUTH_COMPLETE') {
        if (event.data.status === 'success') {
          fetchIntegrations()
          setShowAdd(false)
        } else {
          alert(event.data.error || 'OAuth authentication failed')
        }
        if (popupRef.current) popupRef.current.close()
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  async function handleConnect() {
    if (!business) return
    setConnecting(true)
    try {
      const data = await connectIntegration(newType, newName, newIdentifier)
      if (data.auth_url) {
        popupRef.current = window.open(data.auth_url, 'oauth_popup', 'width=600,height=700')
      } else {
        fetchIntegrations()
        setShowAdd(false)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start connection')
    }
    setConnecting(false)
  }

  async function handleDisconnect(id: string) {
    if (!confirm('Remove this integration?')) return
    try {
      await disconnectIntegration(id)
      fetchIntegrations()
    } catch {
      alert('Failed to remove integration')
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Integrations" description="Connect your data sources" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="card h-40 animate-pulse bg-gray-100" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Connect your store and data sources to feed product info to your AI agent"
        action={<button onClick={() => setShowAdd(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Integration</button>}
      />

      {integrations.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-5 w-5" />}
          title="No integrations yet"
          description="Connect Shopify, YouCan, or Google Sheets to sync your products"
          action={<button onClick={() => setShowAdd(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Integration</button>}
        />
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
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{int.name}</p>
                      <p className="text-xs text-gray-400">{meta.label}</p>
                    </div>
                  </div>
                  {int.connected ? <CheckCircle2 className="h-5 w-5 text-accent-500" /> : <XCircle className="h-5 w-5 text-gray-300" />}
                </div>
                <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400">Identifier</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-700 truncate">{int.identifier}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-xs font-medium ${int.connected ? 'text-accent-600' : 'text-gray-400'}`}>{int.connected ? 'Connected' : 'Not connected'}</span>
                  <button onClick={() => handleDisconnect(int.id)} className="rounded-lg p-2 text-gray-400 hover:bg-error-50 hover:text-error-600 transition-colors" title="Remove"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={() => setShowAdd(false)}>
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
                      <button key={type} onClick={() => setNewType(type)} className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${newType === type ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <Icon className="h-6 w-6 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">{meta.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="label">Name</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="input" placeholder="My Store" />
              </div>
              <div>
                <label className="label">{newType === 'google_sheets' ? 'Spreadsheet ID' : 'Shop Domain'}</label>
                <input type="text" required value={newIdentifier} onChange={(e) => setNewIdentifier(e.target.value)} className="input" placeholder={newType === 'google_sheets' ? '1ABC...xyz' : 'mystore.myshopify.com'} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleConnect} disabled={connecting || !newName || !newIdentifier} className="btn-primary">
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
