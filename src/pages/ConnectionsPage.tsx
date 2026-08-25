import { useState, useEffect, useMemo } from 'react'
import QRCode from 'qrcode'
import { RefreshCw, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Loader as Loader2, Phone, QrCode as QrIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getConnectionStatus } from '../lib/api'
import PageHeader from '../components/PageHeader'

export default function ConnectionsPage() {
  const { business } = useAuth()
  const [qrString, setQrString] = useState('')
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  async function fetchConnection() {
    if (!business) return
    setRefreshing(true)
    try {
      const data = await getConnectionStatus()
      setConnected(data.connected)
      setQrString(data.qr || '')
    } catch {
      setConnected(false)
      setQrString('')
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchConnection() }, [business])

  useEffect(() => {
    if (!qrString) { setQrDataUrl(''); return }
    QRCode.toDataURL(qrString, { width: 256, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''))
  }, [qrString])

  const qrPlaceholder = useMemo(() => <QrIcon className="h-20 w-20" />, [])

  return (
    <div>
      <PageHeader
        title="WhatsApp Connection"
        description="Connect your WhatsApp Business account to start automating sales"
        action={
          <button onClick={fetchConnection} disabled={refreshing} className="btn-secondary">
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        }
      />

      <div className="mx-auto max-w-2xl">
        {loading ? (
          <div className="card flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : connected ? (
          <div className="card p-8 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-100">
              <CheckCircle2 className="h-8 w-8 text-accent-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">WhatsApp Connected</h2>
            <p className="mt-1 text-sm text-gray-500">Your WhatsApp Business account is connected and ready to receive messages.</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              {business?.phone}
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning-100">
              <AlertCircle className="h-8 w-8 text-warning-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Not Connected</h2>
            <p className="mt-1 text-sm text-gray-500">Scan the QR code below with your WhatsApp to connect your account.</p>
            <div className="mt-6 flex flex-col items-center">
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-4">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="WhatsApp QR Code" className="h-48 w-48" />
                ) : (
                  <div className="flex h-48 w-48 flex-col items-center justify-center text-gray-300">
                    {qrPlaceholder}
                    <p className="mt-2 text-xs">QR code unavailable</p>
                  </div>
                )}
              </div>
              <p className="mt-4 max-w-xs text-xs text-gray-400">Open WhatsApp on your phone, go to Settings &gt; Linked Devices, and scan this code.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
