import { AppHeader } from './app-header'
import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
  showHeader?: boolean
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showHeader = true 
}) => {
  return (
    <div className="min-h-screen bg-image-landing overflow-y-auto">
      {showHeader && <AppHeader />}
      <main className={showHeader ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  )
}
