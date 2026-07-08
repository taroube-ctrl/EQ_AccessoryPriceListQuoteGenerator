const msal = require('@azure/msal-node');

const PLACEHOLDER = new Set(['', 'YOUR_CLIENT_ID_FROM_AZURE', 'YOUR_TENANT_ID', 'YOUR_CLIENT_SECRET']);

function isConfigured(value) {
  return Boolean(value && !PLACEHOLDER.has(value));
}

function isGraphServiceConfigured() {
  return (
    isConfigured(process.env.AZURE_TENANT_ID) &&
    isConfigured(process.env.AZURE_CLIENT_ID) &&
    isConfigured(process.env.AZURE_CLIENT_SECRET) &&
    (isConfigured(process.env.AZURE_DRIVE_USER_ID) ||
      isConfigured(process.env.AZURE_DRIVE_USER_EMAIL))
  );
}

let confidentialClient;

function getConfidentialClient() {
  if (!confidentialClient) {
    confidentialClient = new msal.ConfidentialClientApplication({
      auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
      },
    });
  }
  return confidentialClient;
}

async function getAppAccessToken() {
  const client = getConfidentialClient();
  const result = await client.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  });

  if (!result?.accessToken) {
    throw new Error('Failed to acquire application access token from Azure AD.');
  }

  return result.accessToken;
}

async function graphGet(path) {
  const token = await getAppAccessToken();
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Graph API ${response.status}: ${body}`);
  }

  return response.json();
}

function getDriveUserSegment() {
  const userId = process.env.AZURE_DRIVE_USER_ID;
  const userEmail = process.env.AZURE_DRIVE_USER_EMAIL;

  if (isConfigured(userId)) {
    return `/users/${encodeURIComponent(userId)}`;
  }

  if (isConfigured(userEmail)) {
    return `/users/${encodeURIComponent(userEmail)}`;
  }

  throw new Error(
    'Set AZURE_DRIVE_USER_ID or AZURE_DRIVE_USER_EMAIL in server .env to the OneDrive owner account.',
  );
}

function resolveFileId(requestedFileId) {
  const fileId = requestedFileId || process.env.EXCEL_FILE_ID;
  if (!isConfigured(fileId) || fileId === 'YOUR_EXCEL_FILE_ITEM_ID') {
    throw new Error('Set EXCEL_FILE_ID in server .env or pass fileId query parameter.');
  }
  return fileId;
}

async function fetchUsedRange(sheetName, requestedFileId) {
  const fileId = resolveFileId(requestedFileId);
  const userPath = getDriveUserSegment();
  const worksheet = encodeURIComponent(sheetName || process.env.EXCEL_SHEET_NAME || 'Sheet1');

  return graphGet(
    `${userPath}/drive/items/${fileId}/workbook/worksheets/${worksheet}/usedRange`,
  );
}

async function searchExcelFiles() {
  const userPath = getDriveUserSegment();
  const result = await graphGet(`${userPath}/drive/root/search(q='.xlsx')`);

  return (result.value ?? [])
    .filter((item) => item.name?.toLowerCase().endsWith('.xlsx'))
    .map((item) => ({ id: item.id, name: item.name }));
}

function getPublicConfig() {
  return {
    configured: isGraphServiceConfigured(),
    driveUser: process.env.AZURE_DRIVE_USER_EMAIL || process.env.AZURE_DRIVE_USER_ID || null,
    defaultFileId: isConfigured(process.env.EXCEL_FILE_ID) ? process.env.EXCEL_FILE_ID : null,
    defaultSheetName: process.env.EXCEL_SHEET_NAME || 'Sheet1',
    authMode: 'application',
  };
}

module.exports = {
  isGraphServiceConfigured,
  fetchUsedRange,
  searchExcelFiles,
  getPublicConfig,
};
