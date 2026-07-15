import * as XLSX from 'xlsx';

export type ExcelCellValue = string | number | boolean | Date | null;
export type ExcelRow = Record<string, ExcelCellValue>;

export interface ParsedSheet {
  name: string;
  headers: string[];
  rows: ExcelRow[];
}

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function validateExcelFile(file: File): string | null {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return 'Please upload an .xlsx, .xls, or .csv file.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File must be 10 MB or smaller.';
  }
  return null;
}

function collectHeaders(rows: ExcelRow[]): string[] {
  const headerSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      headerSet.add(key);
    }
  }
  return [...headerSet];
}

export async function parseExcelFile(file: File): Promise<ParsedSheet[]> {
  const validationError = validateExcelFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const buffer = await file.arrayBuffer();
  return parseWorkbookBuffer(buffer);
}

export function parseWorkbookBuffer(buffer: ArrayBuffer): ParsedSheet[] {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  return workbook.SheetNames.map((name) => {
    const worksheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
      defval: null,
      raw: false,
    });

    return {
      name,
      headers: collectHeaders(rows),
      rows,
    };
  });
}

export const DEFAULT_PRICE_LIST_PATH =
  import.meta.env.VITE_PRICE_LIST_PATH ??
  `${import.meta.env.BASE_URL}data/accessories-price-list.xlsx`;

export const DEFAULT_PRICE_LIST_NAME = 'Accessories Price List';

export async function loadDefaultPriceList(): Promise<ParsedSheet[]> {
  const response = await fetch(DEFAULT_PRICE_LIST_PATH);
  if (!response.ok) {
    throw new Error('Unable to load the bundled Accessories Price List file.');
  }
  const buffer = await response.arrayBuffer();
  return parseWorkbookBuffer(buffer);
}

export function formatCellValue(value: ExcelCellValue): string {
  if (value == null) return '';
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  return String(value);
}
