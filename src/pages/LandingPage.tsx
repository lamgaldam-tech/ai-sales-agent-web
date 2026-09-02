import { Link } from 'react-router-dom'
import { MessageSquare, Zap, Bot, ChartBar as BarChart3, Plug, Shield, Globe, ArrowRight, Check, Menu, X, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const FEATURES = [
  { icon: Bot, title: 'AI Sales Agent', desc: 'An intelligent assistant that talks to your customers on WhatsApp 24/7, answers questions, and closes sales automatically.' },
  { icon: Plug, title: 'Integrations', desc: 'Connect Shopify, YouCan, or Google Sheets in one click. Your products sync automatically for the AI to reference.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track revenue, orders, and customer activity in real time. Know exactly how your AI agent is performing.' },
  { icon: Zap, title: 'Bulk Broadcasts', desc: 'Send personalized messages to thousands of customers at once with smart template variables.' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'Your data is protected with row-level security and encrypted storage. Built on Supabase infrastructure.' },
  { icon: Globe, title: 'Multi-Language', desc: 'Supports English, French, Arabic, and Spanish out of the box. Your AI adapts to your customers language.' },
]

const PLANS = [
  { name: 'Starter', price: '$0', period: 'forever', features: ['1 WhatsApp number', 'Up to 100 customers', 'Basic AI agent', 'Community support'], cta: 'Get Started', highlight: false },
  { name: 'Pro', price: '$29', period: 'per month', features: ['Unlimited customers', 'Advanced AI agent', 'All integrations', 'Bulk broadcasts', 'Analytics dashboard', 'Priority support'], cta: 'Start Free Trial', highlight: true },
  { name: 'Business', price: '$99', period: 'per month', features: ['Everything in Pro', 'Multi-agent support', 'Custom integrations', 'Team collaboration', 'Dedicated manager', 'SLA guarantee'], cta: 'Contact Sales', highlight: false },
]

const STATS = [
  { value: '10K+', label: 'Messages Sent' },
  { value: '500+', label: 'Businesses' },
  { value: '98%', label: 'Satisfaction' },
  { value: '24/7', label: 'Availability' },
]

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm"><MessageSquare className="h-5 w-5" /></div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">SalesAgent</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white">Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white">Pricing</a>
            <a href="#stats" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white">Stats</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-gray-800" title="Toggle theme">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/auth" className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors sm:block dark:text-gray-300 dark:hover:text-white">Sign In</Link>
            <Link to="/auth" className="btn-primary text-sm">Get Started <ArrowRight className="h-4 w-4" /></Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="rounded-lg p-2 text-gray-600 md:hidden dark:text-gray-300">
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="border-t border-gray-100 px-4 py-3 md:hidden dark:border-gray-800">
            <nav className="flex flex-col gap-3">
              <a href="#features" onClick={() => setMobileMenu(false)} className="text-sm font-medium text-gray-600 dark:text-gray-300">Features</a>
              <a href="#pricing" onClick={() => setMobileMenu(false)} className="text-sm font-medium text-gray-600 dark:text-gray-300">Pricing</a>
              <a href="#stats" onClick={() => setMobileMenu(false)} className="text-sm font-medium text-gray-600 dark:text-gray-300">Stats</a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary-100/40 blur-3xl dark:bg-primary-900/20" />
          <div className="absolute right-0 top-40 h-[300px] w-[400px] rounded-full bg-accent-100/30 blur-3xl dark:bg-accent-900/15" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
              <Zap className="h-4 w-4" /> Powered by AI · Built for WhatsApp
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
              Automate your <span className="text-primary-600 dark:text-primary-400">WhatsApp sales</span> with an AI agent
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Let an intelligent assistant handle customer conversations, answer questions, and close sales on WhatsApp — 24 hours a day, 7 days a week. No staff needed.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth" className="btn-primary text-base px-8 py-3">Start Free Trial <ArrowRight className="h-5 w-5" /></Link>
              <a href="#features" className="btn-secondary text-base px-8 py-3">See Features</a>
            </div>
            <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">No credit card required · 14-day free trial</p>
          </div>

          {/* Hero visual */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-2xl dark:border-gray-700">
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <div className="ml-3 text-xs font-medium text-gray-400 dark:text-gray-500">Dashboard Preview</div>
              </div>
              <div className="grid grid-cols-3 gap-4 bg-white p-6 dark:bg-gray-800">
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400"><BarChart3 className="h-4 w-4" /></div>
                  <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">1,248</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Messages</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400"><MessageSquare className="h-4 w-4" /></div>
                  <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">$4,820</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Revenue</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50 text-warning-600 dark:bg-warning-900/40 dark:text-warning-400"><Zap className="h-4 w-4" /></div>
                  <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">98%</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">Everything you need to sell on WhatsApp</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">From AI conversations to analytics, we've got you covered with a complete toolkit.</p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="group rounded-2xl border border-gray-200 p-6 transition-all hover:border-primary-300 hover:shadow-lg dark:border-gray-700 dark:hover:border-primary-700">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-transform group-hover:scale-110 dark:bg-primary-900/40 dark:text-primary-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-gray-100">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Start free. Upgrade when you grow. No hidden fees.</p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.name} className={`relative rounded-2xl border p-8 ${p.highlight ? 'border-primary-500 bg-white shadow-xl dark:bg-gray-800 dark:border-primary-500' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-semibold text-white">Most Popular</div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{p.price}</span>
                  <span className="text-sm text-gray-400 dark:text-gray-500">/{p.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="h-4 w-4 shrink-0 text-accent-500" /> {feat}
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className={`mt-8 block w-full text-center text-sm font-medium py-3 rounded-lg transition-all ${p.highlight ? 'btn-primary' : 'btn-secondary'}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary-600 px-8 py-16 text-center shadow-xl dark:bg-primary-700">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to automate your sales?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-100">Join hundreds of businesses using SalesAgent to sell on WhatsApp without lifting a finger.</p>
            <Link to="/auth" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-semibold text-primary-700 shadow-sm transition-all hover:bg-primary-50">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white"><MessageSquare className="h-4 w-4" /></div>
                <span className="text-base font-bold text-gray-900 dark:text-gray-100">SalesAgent</span>
              </Link>
              <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">Automate your WhatsApp sales with an AI-powered agent.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Product</h4>
              <ul className="mt-3 space-y-2">
                <li><a href="#features" className="text-sm text-gray-500 hover:text-primary-600 transition-colors dark:text-gray-400 dark:hover:text-primary-400">Features</a></li>
                <li><a href="#pricing" className="text-sm text-gray-500 hover:text-primary-600 transition-colors dark:text-gray-400 dark:hover:text-primary-400">Pricing</a></li>
                <li><a href="#stats" className="text-sm text-gray-500 hover:text-primary-600 transition-colors dark:text-gray-400 dark:hover:text-primary-400">Stats</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Company</h4>
              <ul className="mt-3 space-y-2">
                <li><a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition-colors dark:text-gray-400 dark:hover:text-primary-400">About</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition-colors dark:text-gray-400 dark:hover:text-primary-400">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition-colors dark:text-gray-400 dark:hover:text-primary-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Legal</h4>
              <ul className="mt-3 space-y-2">
                <li><a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition-colors dark:text-gray-400 dark:hover:text-primary-400">Privacy</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-primary-600 transition-colors dark:text-gray-400 dark:hover:text-primary-400">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-100 pt-6 dark:border-gray-800">
            <p className="text-center text-sm text-gray-400 dark:text-gray-500">© 2026 SalesAgent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
