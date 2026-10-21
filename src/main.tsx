import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({
        onNeedRefresh() {
          if (confirm('A new version is available. Reload to update?')) {
            window.location.reload()
          }
        },
        onOfflineReady() {
          console.log('App ready for offline use')
        },
        onRegistered() {
          console.log('PWA service worker registered')
        },
        onRegisterError(err) {
          console.warn('PWA registration error:', err)
        },
      })
    }).catch(err => console.warn('PWA register import error:', err))
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
