/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** OAuth 2.0 Web client ID used for Google sign-in + Google Drive backup. */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}
