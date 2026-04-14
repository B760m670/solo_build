import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { queryClient } from './lib/queryClient';
import { initTelegram } from './lib/telegram';
import App from './App';
import './index.css';

initTelegram();
const manifestUrl = import.meta.env.VITE_TON_CONNECT_MANIFEST_URL
  || `${window.location.origin}/tonconnect-manifest.json`;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </TonConnectUIProvider>
  </React.StrictMode>,
);
