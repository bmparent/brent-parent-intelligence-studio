import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles/main.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

if (root.hasChildNodes()) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
