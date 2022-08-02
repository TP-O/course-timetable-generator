import { LayoutProps } from '@/types'

export function AdminLayout({ children }: LayoutProps) {
  return (
    <div>
      <h1>Admin Layout</h1>

      {children}
    </div>
  )
}
