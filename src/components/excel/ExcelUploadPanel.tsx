import { useRef, useState } from 'react';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';

interface ExcelUploadPanelProps {
  fileName: string | null;
  loading: boolean;
  error: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export function ExcelUploadPanel({
  fileName,
  loading,
  error,
  onFileSelect,
  onClear,
}: ExcelUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
          <div>
            <Card.Title as="h2" className="h4 mb-1">
              Upload Excel Data
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Drop an .xlsx file or browse to parse it with SheetJS and preview rows as JSON-backed
              tables.
            </Card.Text>
          </div>
          {fileName && (
            <Button variant="outline-secondary" size="sm" onClick={onClear} disabled={loading}>
              Clear
            </Button>
          )}
        </div>

        <Form.Group
          controlId="excel-upload"
          className={`border rounded-3 p-4 text-center bg-light ${dragOver ? 'border-primary' : 'border-secondary-subtle'}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            handleFiles(event.dataTransfer.files);
          }}
        >
          <Form.Label className="w-100 mb-2 fw-semibold">
            {fileName ? `Loaded: ${fileName}` : 'Drag & drop your spreadsheet here'}
          </Form.Label>
          <Form.Text className="d-block mb-3 text-muted">
            Supported formats: .xlsx, .xls, .csv (max 10 MB)
          </Form.Text>
          <Form.Control
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            className="d-none"
            disabled={loading}
            onChange={(event) => handleFiles(event.target.files)}
          />
          <Button
            variant="primary"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Parsing…
              </>
            ) : (
              'Browse files'
            )}
          </Button>
        </Form.Group>

        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}
