/// <reference types="vite/client" />

interface Window {
  __SIZZLE_TO_APP_PATH__?: (href: string) => string;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
