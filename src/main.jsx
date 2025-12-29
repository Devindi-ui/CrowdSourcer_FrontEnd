import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/custom.css';
import './styles/global.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
