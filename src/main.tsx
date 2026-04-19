import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: 'DM Sans,sans-serif', fontSize: '13px', borderRadius: '10px', background: '#1e293b', color: '#f8fafc' }, success: { iconTheme: { primary: '#22c55e', secondary: '#f8fafc' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } } }} />
    </QueryClientProvider>
  </React.StrictMode>
)
