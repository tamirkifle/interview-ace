/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly NODE_ENV: string
    readonly VITE_API_URL: string
    readonly VITE_GRAPHQL_URL: string
    // Add other env variables here as needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }