import React from 'react'
import ReactDOM from 'react-dom/client'

if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}

import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
