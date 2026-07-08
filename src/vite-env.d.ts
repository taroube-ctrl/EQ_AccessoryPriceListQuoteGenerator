/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AZURE_CLIENT_ID?: string;
  readonly VITE_AZURE_AUTHORITY?: string;
  readonly VITE_AZURE_REDIRECT_URI?: string;
  readonly VITE_AZURE_FILES_READ_ALL?: string;
  readonly VITE_PRICE_LIST_PATH?: string;
  readonly VITE_EXCEL_FILE_ID?: string;
  readonly VITE_EXCEL_SHEET_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
