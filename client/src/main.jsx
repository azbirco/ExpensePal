import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// Idagdag itong import para sa PWA registration
import { registerSW } from 'virtual:pwa-register'

// Ito ang mag-aactivate ng service worker para sa offline support
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)