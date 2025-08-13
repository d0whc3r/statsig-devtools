import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'

import '@/src/styles/globals.css'
import './style.css'

// Initialize development tools in development mode
if (import.meta.env.DEV) {
  import('@/src/utils/dev-tools')
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
