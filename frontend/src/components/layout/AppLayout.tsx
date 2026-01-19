import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          {title && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground mt-2">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
