import type { DriveItemSummary } from '../utils/graphAuth';

export interface LiveExcelConfig {
  configured: boolean;
  driveUser: string | null;
  defaultFileId: string | null;
  defaultSheetName: string;
  authMode: 'application';
}

export interface LiveExcelResponse {
  values: string[][];
  sheetName: string;
  fileId: string | null;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error || response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function fetchLiveExcelConfig(): Promise<LiveExcelConfig> {
  const response = await fetch('/api/excel/config');
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function fetchLiveExcelFiles(): Promise<DriveItemSummary[]> {
  const response = await fetch('/api/excel/files');
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const data = await response.json();
  return data.files ?? [];
}

export async function fetchLiveExcelData(
  sheetName: string,
  fileId?: string,
): Promise<LiveExcelResponse> {
  const params = new URLSearchParams({ sheet: sheetName });
  if (fileId) params.set('fileId', fileId);

  const response = await fetch(`/api/excel/live?${params.toString()}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}
