import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import App from './App';
import './index.css';
import { client } from './apollo/client';

// Ensure the root element exists
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Create root and render
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
