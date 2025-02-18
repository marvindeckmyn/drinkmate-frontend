import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import { ScrollPositionProvider } from './contexts/ScrollPositionProvider';

const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
  <ScrollPositionProvider>
    <App />
  </ScrollPositionProvider>
);