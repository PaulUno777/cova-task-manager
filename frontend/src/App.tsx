import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/features/auth/AuthContext'
import { I18nProvider } from '@/lib/i18n/I18nProvider'
import { queryClient } from '@/lib/query-client'

import { router } from './router'

function App() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </I18nProvider>
  )
}

export default App
