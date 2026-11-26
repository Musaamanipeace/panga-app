import './pwa/install'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/panga-ui.css'
import { applyTheme } from './theme/theme'
import { setupAutoUpdateReload } from './pwa/autoReload'
import App from './App.tsx'

setupAutoUpdateReload(() => import('virtual:pwa-register'))

applyTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
