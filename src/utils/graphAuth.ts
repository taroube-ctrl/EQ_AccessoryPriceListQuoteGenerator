import type { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { loginRequest } from '../authConfig';

export async function acquireGraphAccessToken(
  instance: IPublicClientApplication,
  account: AccountInfo,
): Promise<string> {
  try {
    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return response.accessToken;
  } catch {
    const response = await instance.acquireTokenPopup({
      ...loginRequest,
      account,
    });
    return response.accessToken;
  }
}

export function createAuthenticatedGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => done(null, accessToken),
  });
}

export interface DriveItemSummary {
  id: string;
  name: string;
}

interface DriveSearchResponse {
  value?: DriveItemSummary[];
}

export async function searchOneDriveExcelFiles(
  graphClient: Client,
  query = '.xlsx',
): Promise<DriveItemSummary[]> {
  const result: DriveSearchResponse = await graphClient
    .api(`/me/drive/root/search(q='${query}')`)
    .get();

  return (result.value ?? []).filter((item) =>
    item.name.toLowerCase().endsWith('.xlsx'),
  );
}
