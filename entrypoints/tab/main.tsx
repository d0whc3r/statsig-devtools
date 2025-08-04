import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

import './style.css'

// Create root and render the app
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}
const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
