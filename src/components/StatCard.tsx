import { ReactNode } from 'react'
interface StatCardProps { label: string; value: string | number; icon: ReactNode; trend?: string; trendUp?: boolean }
export default function StatCard({ label, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">{icon}</div>
        {trend && <span className={`text-xs font-medium ${trendUp ? 'text-accent-600' : 'text-error-600'}`}>{trend}</span>}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  )
}
