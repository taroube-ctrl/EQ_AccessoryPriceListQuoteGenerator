import { Badge, Table } from 'react-bootstrap';
import type { ParsedSheet } from '../../utils/parseExcelFile';
import { formatCellValue } from '../../utils/parseExcelFile';

interface ExcelDataTableProps {
  sheet: ParsedSheet;
}

export function ExcelDataTable({ sheet }: ExcelDataTableProps) {
  if (sheet.rows.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        This sheet has no data rows.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover size="sm" className="mb-0 align-middle">
        <thead className="table-light sticky-top">
          <tr>
            <th scope="col" className="text-muted">
              #
            </th>
            {sheet.headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sheet.rows.map((row, rowIndex) => (
            <tr key={`${sheet.name}-${rowIndex}`}>
              <td className="text-muted">{rowIndex + 1}</td>
              {sheet.headers.map((header) => (
                <td key={`${rowIndex}-${header}`}>{formatCellValue(row[header] ?? null)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

interface ExcelSheetTabsProps {
  sheets: ParsedSheet[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function ExcelSheetTabs({ sheets, activeIndex, onSelect }: ExcelSheetTabsProps) {
  if (sheets.length <= 1) {
    const sheet = sheets[0];
    if (!sheet) return null;

    return (
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="fw-semibold">{sheet.name}</span>
        <Badge bg="secondary">{sheet.rows.length} rows</Badge>
      </div>
    );
  }

  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {sheets.map((sheet, index) => (
        <button
          key={sheet.name}
          type="button"
          className={`btn btn-sm ${index === activeIndex ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onSelect(index)}
        >
          {sheet.name}
          <Badge bg={index === activeIndex ? 'light' : 'secondary'} text="dark" className="ms-2">
            {sheet.rows.length}
          </Badge>
        </button>
      ))}
    </div>
  );
}
