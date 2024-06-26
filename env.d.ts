/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_MAPBOX_PUBLIC_ACCESS_TOKEN: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}