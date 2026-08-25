import { useState, useEffect } from 'react'
import { ShoppingCart, Loader as Loader2, TrendingUp, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'
import type { Order, Customer } from '../lib/types'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'

export default function OrdersPage() {
  const { business } = useAuth()
  const [orders, setOrders] = useState<(Order & { customer: Customer | null })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!business) return
    supabase.from('orders').select('*, customer:customers(*)').order('created_at', { ascending: false })
      .then(({ data }) => { setOrders((data as (Order & { customer: Customer | null })[]) || []); setLoading(false) })
  }, [business])

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.revenue), 0)
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  const chartData = orders.reduce<Record<string, { date: string; revenue: number; orders: number }>>((acc, o) => {
    const date = formatDate(o.created_at)
    if (!acc[date]) acc[date] = { date, revenue: 0, orders: 0 }
    acc[date].revenue += Number(o.revenue)
    acc[date].orders += 1
    return acc
  }, {})
  const chartArray = Object.values(chartData).slice(-14)

  if (loading) {
    return (
      <div>
        <PageHeader title="Orders" description="Track revenue and order history" />
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Orders" description="Track revenue and order history" />

      {orders.length === 0 ? (
        <EmptyState icon={<ShoppingCart className="h-5 w-5" />} title="No orders yet" description="Orders will appear here once customers start purchasing through your AI agent" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Revenue" value={formatCurrency(totalRevenue, business?.currency)} icon={<TrendingUp className="h-5 w-5" />} />
            <StatCard label="Total Orders" value={orders.length} icon={<ShoppingCart className="h-5 w-5" />} />
            <StatCard label="Avg Order Value" value={formatCurrency(avgOrderValue, business?.currency)} icon={<Calendar className="h-5 w-5" />} />
          </div>

          <div className="mt-6 card p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartArray}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip formatter={(value: number) => formatCurrency(value, business?.currency)} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{o.customer?.name || o.customer?.phone || 'Unknown'}</td>
                      <td className="px-4 py-3.5 text-right text-sm font-semibold text-accent-600">{formatCurrency(Number(o.revenue), business?.currency)}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
