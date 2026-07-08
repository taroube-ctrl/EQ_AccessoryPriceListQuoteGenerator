import { Client } from '@microsoft/microsoft-graph-client';
import type { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { loginRequest } from '../authConfig';

export function createGraphClient(
  msalInstance: IPublicClientApplication,
  account: AccountInfo,
): Client {
  return Client.init({
    authProvider: async (done) => {
      try {
        const response = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        done(null, response.accessToken);
      } catch {
        const response = await msalInstance.acquireTokenPopup({
          ...loginRequest,
          account,
        });
        done(null, response.accessToken);
      }
    },
  });
}
