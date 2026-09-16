import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import './styles/main.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

if (root.hasChildNodes()) {
  hydrateRoot(root, <App />)
} else {
  createRoot(root).render(<App />)
}

// Prerendered markup can become visible before the client bundle has attached
// React's delegated event system. Expose a tiny deterministic readiness contract
// for production browser checks and other automation that must interact safely.
document.documentElement.dataset.eidosClientReady = 'true'
