/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly NODE_ENV: string
    // Add other env variables here as needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }