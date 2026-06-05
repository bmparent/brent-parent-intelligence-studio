import { renderToString } from 'react-dom/server';
import App from './App';
import './styles/main.css';

export function render() {
  return renderToString(<App />);
}
