import { ReactNode, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { MessageSquare, LayoutDashboard, Plug, Boxes, Users, ShoppingCart, Send, Settings, LogOut, Menu, X, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { initials } from '../lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/connections', label: 'WhatsApp', icon: MessageSquare },
  { to: '/integrations', label: 'Integrations', icon: Plug },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/broadcast', label: 'Broadcast', icon: Send },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { business, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() { await signOut(); navigate('/auth') }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm"><MessageSquare className="h-5 w-5" /></div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Sales Agent</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{business?.name || 'Business'}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'}`}>
              <Icon className="h-5 w-5 shrink-0" />{item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-gray-200 p-3 dark:border-gray-700">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">{initials(business?.name || null)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{business?.name}</p>
            <p className="truncate text-xs text-gray-400 capitalize dark:text-gray-500">{business?.plan} plan</p>
          </div>
          <button onClick={toggleTheme} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200" title="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={handleSignOut} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200" title="Sign out"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block dark:border-gray-700 dark:bg-gray-800">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl animate-slide-in dark:bg-gray-800">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden dark:border-gray-700 dark:bg-gray-800">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"><Menu className="h-5 w-5" /></button>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Sales Agent</span>
          <button onClick={toggleTheme} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" title="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
