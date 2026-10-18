import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './router'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      networkMode: 'always',
    },
  },
})

const appRoot = document.getElementById('root')

if (appRoot) {
  createRoot(appRoot).render(
    <StrictMode>
      {/* ต้องครอบ Provider ไว้ชั้นนอกสุด ทุกหน้าถึงจะเรียก useQuery ได้ */}
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
