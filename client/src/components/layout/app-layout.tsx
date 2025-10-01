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
    <div className="min-h-screen bg-image-landing">
      {showHeader && <AppHeader />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
