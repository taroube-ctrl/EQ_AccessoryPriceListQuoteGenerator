import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Card, Col, Container, Nav, Row, Spinner } from 'react-bootstrap';
import { ExcelDataTable, ExcelSheetTabs } from '../components/excel/ExcelDataTable';
import { ExcelUploadPanel } from '../components/excel/ExcelUploadPanel';
import { LiveGraphExcelTable } from '../components/excel/LiveGraphExcelTable';
import {
  DEFAULT_PRICE_LIST_NAME,
  loadDefaultPriceList,
  parseExcelFile,
  type ParsedSheet,
} from '../utils/parseExcelFile';
import 'bootstrap/dist/css/bootstrap.min.css';

type ExcelView = 'price-list' | 'live';

export function ExcelDataPage() {
  const [view, setView] = useState<ExcelView>('price-list');
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDefaultFile, setUsingDefaultFile] = useState(true);

  const activeSheet = sheets[activeSheetIndex] ?? null;

  const totalRows = useMemo(
    () => sheets.reduce((sum, sheet) => sum + sheet.rows.length, 0),
    [sheets],
  );

  const loadBundledPriceList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const parsedSheets = await loadDefaultPriceList();
      setSheets(parsedSheets);
      setActiveSheetIndex(0);
      setFileName(DEFAULT_PRICE_LIST_NAME);
      setUsingDefaultFile(true);
    } catch (err) {
      setSheets([]);
      setFileName(null);
      setUsingDefaultFile(false);
      setError(err instanceof Error ? err.message : 'Unable to load Accessories Price List.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBundledPriceList();
  }, [loadBundledPriceList]);

  const handleFileSelect = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const parsedSheets = await parseExcelFile(file);
      setSheets(parsedSheets);
      setActiveSheetIndex(0);
      setFileName(file.name);
      setUsingDefaultFile(false);
    } catch (err) {
      setSheets([]);
      setFileName(null);
      setUsingDefaultFile(false);
      setError(err instanceof Error ? err.message : 'Unable to parse this file.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    loadBundledPriceList();
  }, [loadBundledPriceList]);

  return (
    <div className="bg-light min-vh-100 py-4">
      <Container fluid="lg">
        <Row className="mb-4">
          <Col>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p className="text-uppercase text-muted small fw-semibold mb-1">
                  Catalog pricing data
                </p>
                <h1 className="h3 mb-0">Accessories Price List</h1>
              </div>
              <Link to="/" className="btn btn-outline-dark btn-sm">
                Back to catalog
              </Link>
            </div>
            <Nav variant="tabs" className="mt-3 border-0">
              <Nav.Item>
                <Nav.Link active={view === 'price-list'} onClick={() => setView('price-list')}>
                  Price list
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link active={view === 'live'} onClick={() => setView('live')}>
                  Live from OneDrive
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>

        {view === 'live' ? (
          <Card className="shadow-sm border-0">
            <Card.Body>
              <LiveGraphExcelTable />
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            <Col lg={4}>
              <ExcelUploadPanel
                fileName={fileName}
                loading={loading}
                error={error}
                onFileSelect={handleFileSelect}
                onClear={handleClear}
              />

              {usingDefaultFile && sheets.length > 0 && (
                <Alert variant="info" className="mt-3 mb-0 small">
                  Showing bundled <strong>{DEFAULT_PRICE_LIST_NAME}</strong>. Upload another file to
                  replace it, or click Clear to reload the default.
                </Alert>
              )}

              {sheets.length > 0 && (
                <Card className="shadow-sm border-0 mt-4">
                  <Card.Body>
                    <Card.Title as="h3" className="h6">
                      Parse summary
                    </Card.Title>
                    <div className="d-flex flex-wrap gap-2">
                      <Badge bg="primary">{sheets.length} sheet(s)</Badge>
                      <Badge bg="success">{totalRows} total rows</Badge>
                      {activeSheet && (
                        <Badge bg="info" text="dark">
                          {activeSheet.headers.length} columns
                        </Badge>
                      )}
                    </div>
                    <Card.Text className="text-muted small mt-3 mb-0">
                      Parsed client-side with SheetJS — no Azure credentials required for this
                      view.
                    </Card.Text>
                  </Card.Body>
                </Card>
              )}
            </Col>

            <Col lg={8}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body className="p-0 d-flex flex-column">
                  {loading ? (
                    <div className="m-4 d-flex align-items-center gap-2 text-muted">
                      <Spinner animation="border" size="sm" />
                      Loading Accessories Price List…
                    </div>
                  ) : !activeSheet ? (
                    <Alert variant="secondary" className="m-4 mb-0">
                      Upload a spreadsheet to preview its contents here, or reload the bundled
                      price list.
                    </Alert>
                  ) : (
                    <>
                      <div className="p-3 border-bottom bg-white">
                        <ExcelSheetTabs
                          sheets={sheets}
                          activeIndex={activeSheetIndex}
                          onSelect={setActiveSheetIndex}
                        />
                      </div>
                      <div className="p-3 flex-grow-1 overflow-auto" style={{ maxHeight: '70vh' }}>
                        <ExcelDataTable sheet={activeSheet} />
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
