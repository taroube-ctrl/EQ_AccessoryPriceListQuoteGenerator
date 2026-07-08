import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Container, Form, ListGroup, Spinner, Table } from 'react-bootstrap';
import { ServiceCredentialsGuide } from '../auth/ServiceCredentialsGuide';
import type { DriveItemSummary } from '../../utils/graphAuth';
import {
  fetchLiveExcelConfig,
  fetchLiveExcelData,
  fetchLiveExcelFiles,
} from '../../utils/liveExcelApi';

type ExcelMatrix = string[][];

const REFRESH_INTERVAL_MS = 30_000;
const SELECTED_FILE_STORAGE_KEY = 'liveExcelFileId';

function isPlaceholderFileId(id: string): boolean {
  return !id || id === 'YOUR_EXCEL_FILE_ITEM_ID';
}

export function LiveGraphExcelTable() {
  const [serverConfigured, setServerConfigured] = useState(false);
  const [driveUser, setDriveUser] = useState<string | null>(null);
  const [fileId, setFileId] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [excelData, setExcelData] = useState<ExcelMatrix>([]);
  const [driveFiles, setDriveFiles] = useState<DriveItemSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileIdConfigured = !isPlaceholderFileId(fileId);

  useEffect(() => {
    fetchLiveExcelConfig()
      .then((config) => {
        setServerConfigured(config.configured);
        setDriveUser(config.driveUser);
        setSheetName(config.defaultSheetName);

        const storedId = sessionStorage.getItem(SELECTED_FILE_STORAGE_KEY);
        const initialId = storedId || config.defaultFileId || '';
        setFileId(initialId);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to reach live Excel API.');
      });
  }, []);

  const fetchLiveExcelDataFromServer = useCallback(async () => {
    if (!fileIdConfigured) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchLiveExcelData(sheetName, fileId);
      setExcelData(result.values ?? []);
    } catch (err) {
      console.error('Failed fetching live data from API:', err);
      setError(err instanceof Error ? err.message : 'Unable to load live spreadsheet data.');
      setExcelData([]);
    } finally {
      setLoading(false);
    }
  }, [fileId, fileIdConfigured, sheetName]);

  const loadOneDriveFiles = useCallback(async () => {
    setLoadingFiles(true);
    setError(null);

    try {
      const files = await fetchLiveExcelFiles();
      setDriveFiles(files);
    } catch (err) {
      console.error('Failed listing Excel files:', err);
      setError(err instanceof Error ? err.message : 'Unable to list Excel files.');
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    if (!serverConfigured) return;

    loadOneDriveFiles();
  }, [serverConfigured, loadOneDriveFiles]);

  useEffect(() => {
    if (!serverConfigured || !fileIdConfigured) return;

    fetchLiveExcelDataFromServer();
    const interval = window.setInterval(fetchLiveExcelDataFromServer, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [serverConfigured, fileIdConfigured, fetchLiveExcelDataFromServer]);

  const selectFile = (id: string) => {
    setFileId(id);
    sessionStorage.setItem(SELECTED_FILE_STORAGE_KEY, id);
    setExcelData([]);
  };

  const headers = excelData[0] ?? [];
  const bodyRows = excelData.slice(1);

  const selectedFileName = useMemo(
    () => driveFiles.find((file) => file.id === fileId)?.name,
    [driveFiles, fileId],
  );

  return (
    <Container className="py-3 px-0">
      <h3 className="h4 mb-2">Live Cloud Spreadsheet (Graph API)</h3>
      <p className="text-muted small mb-4">
        Loaded with your server&apos;s Azure credentials
        {driveUser ? (
          <>
            {' '}
            from <strong>{driveUser}</strong>&apos;s OneDrive
          </>
        ) : null}
        . Worksheet <code>{sheetName}</code> refreshes every 30 seconds — no Microsoft sign-in
        required for visitors.
      </p>

      <ServiceCredentialsGuide />

      {!serverConfigured && (
        <Alert variant="warning" className="mt-3 mb-0">
          API server credentials are missing. Add Azure application secrets to <code>.env</code> and
          start the backend with <code>npm run dev:full</code>.
        </Alert>
      )}

      {serverConfigured && (
        <>
          <hr className="my-4" />

          {!fileIdConfigured && (
            <Alert variant="info" className="mb-3">
              <strong>No file selected.</strong> Pick a workbook below or set <code>EXCEL_FILE_ID</code>{' '}
              in the server <code>.env</code>.
            </Alert>
          )}

          {fileIdConfigured && selectedFileName && (
            <Alert variant="success" className="mb-3 py-2">
              Connected to <strong>{selectedFileName}</strong>
            </Alert>
          )}

          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h4 className="h6 mb-0">Excel files on configured OneDrive</h4>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={loadOneDriveFiles}
                disabled={loadingFiles}
              >
                {loadingFiles ? <Spinner animation="border" size="sm" /> : 'Refresh list'}
              </Button>
            </div>

            {driveFiles.length > 0 ? (
              <ListGroup>
                {driveFiles.map((file) => (
                  <ListGroup.Item
                    key={file.id}
                    action
                    active={file.id === fileId}
                    onClick={() => selectFile(file.id)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>{file.name}</span>
                    <code className="small text-muted">{file.id.slice(0, 12)}…</code>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              !loadingFiles && (
                <Alert variant="secondary" className="mb-0">
                  No .xlsx files found. Upload a workbook to the configured OneDrive account.
                </Alert>
              )
            )}
          </div>

          <Form.Group className="mb-3" controlId="sheet-name">
            <Form.Label className="small fw-semibold">Worksheet name</Form.Label>
            <Form.Control
              type="text"
              value={sheetName}
              onChange={(event) => setSheetName(event.target.value)}
              placeholder="Sheet1"
              style={{ maxWidth: '240px' }}
            />
          </Form.Group>

          <Button
            onClick={fetchLiveExcelDataFromServer}
            variant="success"
            className="mb-3"
            disabled={loading || !fileIdConfigured || !sheetName.trim()}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Force Refresh Data'}
          </Button>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {excelData.length > 0 && (
            <Table striped bordered hover responsive className="mt-3 mb-0">
              <thead>
                <tr>
                  {headers.map((cell, index) => (
                    <th key={`header-${index}`}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`cell-${rowIndex}-${cellIndex}`}>{cell ?? ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {!loading && !error && excelData.length === 0 && fileIdConfigured && (
            <Alert variant="secondary" className="mb-0">
              No rows returned for worksheet <code>{sheetName}</code>.
            </Alert>
          )}
        </>
      )}
    </Container>
  );
}
