import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ShoppingCart, DollarSign, MessageCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatRelativeTime, formatPhone } from '../lib/utils'
import type { Customer, Order } from '../lib/types'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'

export default function DashboardPage() {
  const { business } = useAuth()
  const [stats, setStats] = useState({ customers: 0, orders: 0, revenue: 0, messages: 0 })
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])
  const [recentOrders, setRecentOrders] = useState<(Order & { customer: Customer | null })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!business) return
    async function load() {
      if (!business) return
      const [customersRes, ordersRes] = await Promise.all([
        supabase.from('customers').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
        supabase.from('orders').select('*, customer:customers(*)').order('created_at', { ascending: false }),
      ])
      const customers = (customersRes.data as Customer[]) || []
      const orders = (ordersRes.data as (Order & { customer: Customer | null })[]) || []
      setStats({ customers: customers.length, orders: orders.length, revenue: orders.reduce((sum, o) => sum + Number(o.revenue), 0), messages: 0 })
      setRecentCustomers(customers.slice(0, 5))
      setRecentOrders(orders.slice(0, 5))
      setLoading(false)
    }
    load()
  }, [business])

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Overview of your business performance" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <div key={i} className="card h-32 animate-pulse bg-gray-100" />)}</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back, ${business?.name}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Customers" value={stats.customers} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Orders" value={stats.orders} icon={<ShoppingCart className="h-5 w-5" />} />
        <StatCard label="Revenue" value={formatCurrency(stats.revenue, business?.currency)} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Messages" value={stats.messages} icon={<MessageCircle className="h-5 w-5" />} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Customers</h2>
            <Link to="/customers" className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {recentCustomers.length === 0 ? (
            <EmptyState icon={<Users className="h-5 w-5" />} title="No customers yet" description="Customers will appear here once they start chatting with your AI agent" />
          ) : (
            <div className="space-y-2">
              {recentCustomers.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">{c.name?.charAt(0).toUpperCase() || '?'}</div>
                    <div><p className="text-sm font-medium text-gray-900">{c.name || 'Unknown'}</p><p className="text-xs text-gray-400">{formatPhone(c.phone)}</p></div>
                  </div>
                  <span className="text-xs text-gray-400">{formatRelativeTime(c.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState icon={<TrendingUp className="h-5 w-5" />} title="No orders yet" description="Orders will appear here once customers start purchasing" />
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50">
                  <div><p className="text-sm font-medium text-gray-900">{o.customer?.name || (o.customer?.phone ? formatPhone(o.customer.phone) : '') || 'Unknown'}</p><p className="text-xs text-gray-400">{formatRelativeTime(o.created_at)}</p></div>
                  <span className="text-sm font-semibold text-accent-600">{formatCurrency(Number(o.revenue), business?.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
