import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, Loader as Loader2, MessageSquare, Store, Phone, Globe, CircleCheck as CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageHeader from '../components/PageHeader'

export default function SettingsPage() {
  const { business, refreshBusiness } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [promptId, setPromptId] = useState<string | null>(null)
  const [name, setName] = useState(business?.name || '')
  const [phone, setPhone] = useState(business?.phone || '')
  const [savingPrompt, setSavingPrompt] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savedPrompt, setSavedPrompt] = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!business) return
    setName(business.name)
    setPhone(business.phone)
    supabase.from('prompts').select('*').eq('business_id', business.id).maybeSingle()
      .then(({ data }) => {
        if (data) { setPrompt(data.content); setPromptId(data.id) }
        else { setPrompt(`You are a helpful sales assistant for ${business.name}. Be friendly, concise, and helpful. Answer customer questions about products, pricing, and availability. Guide customers toward making purchases.`) }
        setLoading(false)
      })
  }, [business])

  async function handleSavePrompt() {
    if (!business) return
    setSavingPrompt(true); setSavedPrompt(false)
    if (promptId) {
      await supabase.from('prompts').update({ content: prompt }).eq('id', promptId)
    } else {
      const { data } = await supabase.from('prompts').insert({ business_id: business.id, content: prompt }).select('*').single()
      if (data) setPromptId(data.id)
    }
    setSavingPrompt(false); setSavedPrompt(true)
    setTimeout(() => setSavedPrompt(false), 3000)
  }

  async function handleSaveProfile() {
    if (!business) return
    setSavingProfile(true); setSavedProfile(false)
    await supabase.from('businesses').update({ name, phone }).eq('id', business.id)
    await refreshBusiness()
    setSavingProfile(false); setSavedProfile(true)
    setTimeout(() => setSavedProfile(false), 3000)
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Settings" description="Manage your business profile and AI configuration" />
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your business profile and AI configuration" />

      <div className="space-y-6">
        <div className="card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Store className="h-5 w-5" /></div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Business Profile</h2>
              <p className="text-xs text-gray-500">Update your business information</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Business Name</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Country</label>
              <input type="text" value={business?.country || ''} disabled className="input bg-gray-50" />
            </div>
            <div>
              <label className="label">Currency</label>
              <input type="text" value={business?.currency || ''} disabled className="input bg-gray-50" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary">
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Profile
            </button>
            {savedProfile && <span className="flex items-center gap-1.5 text-sm text-accent-600 animate-fade-in"><CheckCircle2 className="h-4 w-4" /> Saved</span>}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><MessageSquare className="h-5 w-5" /></div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">AI Instructions</h2>
              <p className="text-xs text-gray-500">Configure how your AI agent talks to customers</p>
            </div>
          </div>
          <div>
            <label className="label">System Prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="input min-h-[200px] resize-y font-mono text-sm" placeholder="Enter instructions for your AI sales agent..." />
            <p className="mt-2 text-xs text-gray-400">This prompt tells the AI how to behave when talking to customers on WhatsApp.</p>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={handleSavePrompt} disabled={savingPrompt} className="btn-primary">
              {savingPrompt ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Instructions
            </button>
            {savedPrompt && <span className="flex items-center gap-1.5 text-sm text-accent-600 animate-fade-in"><CheckCircle2 className="h-4 w-4" /> Saved</span>}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 text-warning-600"><SettingsIcon className="h-5 w-5" /></div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Plan</h2>
              <p className="text-xs text-gray-500">Your current subscription</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900 capitalize">{business?.plan} Plan</p>
              <p className="text-xs text-gray-400">Manage your subscription</p>
            </div>
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
