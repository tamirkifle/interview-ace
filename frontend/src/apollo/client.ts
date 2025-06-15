import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { secureStorage } from '../utils/secureStorage';
import { APIKeys } from '../types/apiKeys';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Auth link to add API key headers
const authLink = new ApolloLink((operation, forward) => {
  const apiKeys: APIKeys | null = secureStorage.load();
  
  const headers: Record<string, string> = {};
  
  // Add LLM headers if configured and enabled
  if (apiKeys?.llm?.enabled && apiKeys.llm.provider) {
    const provider = apiKeys.llm.provider;
    let apiKey: string | undefined;
    
    switch (provider) {
      case 'openai':
        apiKey = apiKeys.openai;
        break;
      case 'anthropic':
        apiKey = apiKeys.anthropic;
        break;
      case 'gemini':
        apiKey = apiKeys.gemini;
        break;
      case 'ollama':
        apiKey = apiKeys.ollama?.baseUrl;
        break;
    }
    
    if (apiKey) {
      headers['x-llm-provider'] = provider;
      headers['x-llm-key'] = apiKey;
      if (apiKeys.llm.model) {
        headers['x-llm-model'] = apiKeys.llm.model;
      }
    }
  }
  
  // Add transcription headers if configured and enabled
  if (apiKeys?.transcription?.enabled && apiKeys.transcription.provider) {
    const provider = apiKeys.transcription.provider;
    
    headers['x-transcription-provider'] = provider;
    
    switch (provider) {
      case 'local':
        // For local, we don't need an API key but need the endpoint
        headers['x-transcription-whisper-endpoint'] = apiKeys.transcription.whisperEndpoint || 'http://localhost:9002';
        break;
        
      case 'openai':
        // Use OpenAI key if transcription key not provided
        const openaiKey = apiKeys.transcription.apiKey || apiKeys.openai;
        if (openaiKey) {
          headers['x-transcription-key'] = openaiKey;
        }
        break;
        
      case 'google':
        // TODO: Add Google support
        break;
        
      case 'aws':
        // These require their own API keys
        if (apiKeys.transcription.apiKey) {
          headers['x-transcription-key'] = apiKeys.transcription.apiKey;
        }
        break;
    }
  }
  
  operation.setContext({
    headers
  });
  
  return forward(operation);
});

// HTTP link
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

// Cache configuration
const cache = new InMemoryCache();

// Create Apollo Client instance
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  connectToDevTools: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});

export { client };