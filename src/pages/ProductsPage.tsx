import { useState, useEffect } from 'react'
import { Boxes, Loader as Loader2, Search, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getProducts } from '../lib/api'
import { formatCurrency } from '../lib/utils'
import type { Product } from '../lib/types'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

export default function ProductsPage() {
  const { business } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function fetchProducts() {
    if (!business) return
    setLoading(true)
    try { const data = await getProducts(); setProducts(data.products || []) }
    catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [business])

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader title="Products" description="Products synced from your connected integrations"
        action={<button onClick={fetchProducts} className="btn-secondary"><RefreshCw className="h-4 w-4" /> Refresh</button>} />

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
      ) : products.length === 0 ? (
        <EmptyState icon={<Boxes className="h-5 w-5" />} title="No products yet" description="Connect an integration on the Integrations page to sync your products" />
      ) : (
        <>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" placeholder="Search products..." />
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500 max-w-xs truncate dark:text-gray-400">{p.description}</td>
                      <td className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(p.price, business?.currency)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${p.quantity > 10 ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-400' : p.quantity > 0 ? 'bg-warning-50 text-warning-700 dark:bg-warning-900/40 dark:text-warning-400' : 'bg-error-50 text-error-700 dark:bg-error-900/40 dark:text-error-400'}`}>{p.quantity} in stock</span>
                      </td>
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
