import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111820',
            color: '#F0F4F8',
            border: '1px solid rgba(255,255,255,0.06)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            borderRadius: '10px',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#060A0E' },
            style: { borderColor: 'rgba(16,185,129,0.3)' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#060A0E' },
            style: { borderColor: 'rgba(239,68,68,0.3)' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
