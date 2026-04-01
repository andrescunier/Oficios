/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ACCOUNT_ID: string;
  readonly VITE_DEBUG?: string;
  readonly VITE_DEBUG_LEVEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
