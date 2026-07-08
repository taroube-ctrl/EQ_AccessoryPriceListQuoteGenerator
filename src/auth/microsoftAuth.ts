import {
  BrowserAuthError,
  type AuthenticationResult,
  type IPublicClientApplication,
} from '@azure/msal-browser';
import { loginRequest } from '../authConfig';

const PLACEHOLDER_CLIENT_IDS = new Set([
  '',
  'YOUR_CLIENT_ID_FROM_AZURE',
  'your-client-id-here',
]);

export function isAzureClientConfigured(): boolean {
  const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
  return Boolean(clientId && !PLACEHOLDER_CLIENT_IDS.has(clientId));
}

export function getAzureSetupMessage(): string {
  return 'Add your Azure app client ID to .env as VITE_AZURE_CLIENT_ID, register http://localhost:5173 as a SPA redirect URI, then restart npm run dev.';
}

export async function loginMicrosoft(
  instance: IPublicClientApplication,
): Promise<AuthenticationResult | void> {
  if (!isAzureClientConfigured()) {
    throw new Error(getAzureSetupMessage());
  }

  try {
    return await instance.loginPopup(loginRequest);
  } catch (error) {
    if (
      error instanceof BrowserAuthError &&
      (error.errorCode === 'popup_window_error' ||
        error.errorCode === 'empty_window_error' ||
        error.errorCode === 'monitor_window_timeout')
    ) {
      await instance.loginRedirect(loginRequest);
      return;
    }
    throw error;
  }
}

export async function logoutMicrosoft(instance: IPublicClientApplication): Promise<void> {
  const account = instance.getActiveAccount() ?? instance.getAllAccounts()[0];
  if (!account) return;

  try {
    await instance.logoutPopup({ account });
  } catch {
    await instance.logoutRedirect({ account });
  }
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Microsoft sign-in failed. Check your Azure app registration and try again.';
}
