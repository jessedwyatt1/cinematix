import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'

// Move WDYR initialization to a separate development-only file
// if (process.env.NODE_ENV === 'development') {
//   const WDYR = await import('./wdyr')
//   await WDYR.setup()
// }

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
