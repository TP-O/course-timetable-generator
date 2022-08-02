import { LayoutProps } from '@/types'

export function MainLayout({ children }: LayoutProps) {
  return (
    <div>
      <h1>Main Layout</h1>

      {children}
    </div>
  )
}
