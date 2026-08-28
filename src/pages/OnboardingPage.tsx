import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Loader as Loader2, ArrowRight, Store, Globe, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const BUSINESS_TYPES = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'services', label: 'Services' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' },
]

const COUNTRIES = [
  { value: 'US', label: 'United States', currency: 'USD' },
  { value: 'MA', label: 'Morocco', currency: 'MAD' },
  { value: 'SA', label: 'Saudi Arabia', currency: 'SAR' },
  { value: 'AE', label: 'UAE', currency: 'AED' },
  { value: 'GB', label: 'United Kingdom', currency: 'GBP' },
  { value: 'FR', label: 'France', currency: 'EUR' },
  { value: 'EG', label: 'Egypt', currency: 'EGP' },
]

export default function OnboardingPage() {
  const { user, refreshBusiness } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [type, setType] = useState('ecommerce')
  const [country, setCountry] = useState('US')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectedCountry = COUNTRIES.find((c) => c.value === country)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setLoading(true)
    const { error } = await supabase.from('businesses').insert({ id: user.id, name, phone, type, country, currency: selectedCountry?.currency || 'USD', language })
    if (error) { setError(error.message); setLoading(false); return }
    await refreshBusiness()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 px-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg"><MessageSquare className="h-7 w-7" /></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Set Up Your Business</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tell us about your business to get started</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Business Name</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input pl-10" placeholder="My Store" />
              </div>
            </div>
            <div>
              <label className="label">Business Phone (WhatsApp)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="input pl-10" placeholder="+1 555 000 0000" />
              </div>
            </div>
            <div>
              <label className="label">Business Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input">
                {BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Country</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="input">
                  {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input">
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="ar">Arabic</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>
            {selectedCountry && (
              <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3.5 py-2.5 text-sm text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"><Globe className="h-4 w-4" /><span>Currency: {selectedCountry.currency}</span></div>
            )}
            {error && <div className="rounded-lg bg-error-50 px-3.5 py-3 text-sm text-error-700 dark:bg-error-900/40 dark:text-error-400">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
