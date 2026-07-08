import type { Configuration, PopupRequest } from '@azure/msal-browser';

/** Set VITE_AZURE_FILES_READ_ALL=true for SharePoint / team site shared files */
const useFilesReadAll = import.meta.env.VITE_AZURE_FILES_READ_ALL === 'true';

export const graphDelegatedPermissions = useFilesReadAll
  ? (['User.Read', 'Files.Read.All'] as const)
  : (['User.Read', 'Files.Read'] as const);

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID ?? 'YOUR_CLIENT_ID_FROM_AZURE',
    authority:
      import.meta.env.VITE_AZURE_AUTHORITY ??
      'https://login.microsoftonline.com/common',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI ?? window.location.origin,
    postLogoutRedirectUri:
      import.meta.env.VITE_AZURE_REDIRECT_URI ?? window.location.origin,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: [...graphDelegatedPermissions],
};
