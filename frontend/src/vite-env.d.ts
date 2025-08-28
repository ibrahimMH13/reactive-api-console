/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_BACKEND_URL: string
    readonly VITE_WS_URL: string
    readonly VITE_COGNITO_DOMAIN: string
    readonly VITE_COGNITO_CLIENT_ID: string
    readonly VITE_COGNITO_REDIRECT_URI: string
    readonly VITE_COGNITO_LOGOUT_URI: string
    readonly VITE_COGNITO_AUTHORITY: string
    readonly VITE_COGNITO_SCOPE: string
}
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  