import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sourcePath = path.join(root, 'public/data/accessories-price-list.xlsx');
const outputPath = path.join(root, 'src/data/installation-costs.json');

const REGION_IDS = new Set(['AMER', 'APAC', 'EMEA']);

const COUNTRY_NAME_TO_ID = {
  Australia: 'australia',
  Brazil: 'brazil',
  Bulgaria: 'bulgaria',
  Canada: 'canada',
  Chile: 'chile',
  China: 'china',
  Colombia: 'colombia',
  Finland: 'finland',
  France: 'france',
  Germany: 'germany',
  Ghana: 'ghana',
  'Hong Kong': 'hong-kong',
  India: 'india',
  Indonesia: 'indonesia',
  Ireland: 'ireland',
  Italy: 'italy',
  Japan: 'japan',
  Korea: 'korea',
  Malaysia: 'malaysia',
  Mexico: 'mexico',
  Netherlands: 'netherlands',
  Nigeria: 'nigeria',
  Oman: 'oman',
  Peru: 'peru',
  Poland: 'poland',
  Portugal: 'portugal',
  Singapore: 'singapore',
  'South Africa': 'south-africa',
  Spain: 'spain',
  Sweden: 'sweden',
  Switzerland: 'switzerland',
  Turkey: 'turkey',
  'United Arab Emirates': 'united-arab-emirates',
  'United Kingdom': 'united-kingdom',
  'United States': 'united-states',
  "Côte d'Ivoire": 'cote-divoire',
};

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isBlankRow(row) {
  return !row.some((cell) => String(cell ?? '').trim() !== '');
}

function normalizeCell(value) {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
}

function parseCountryColumns(headers, startIndex) {
  return headers.slice(startIndex).map((header) => {
    const name = String(header ?? '').trim();
    if (!name) return null;
    return {
      name,
      id: COUNTRY_NAME_TO_ID[name] ?? slugify(name),
    };
  }).filter(Boolean);
}

function parsePricingRow(fixedCells, countryColumns, row) {
  const pricing = {};

  countryColumns.forEach((country, index) => {
    const value = normalizeCell(row[fixedCells.length + index]);
    if (value != null) {
      pricing[country.id] = {
        countryId: country.id,
        countryName: country.name,
        value,
      };
    }
  });

  return pricing;
}

function parseCustomPartsSection(rows, startIndex) {
  let index = startIndex;
  const title = String(rows[index][0] ?? '').trim();
  const billingType = normalizeCell(rows[index][3]) === 'NRC' ? 'NRC' : null;
  index++;

  const headerRow = rows[index];
  const countryColumns = parseCountryColumns(headerRow, 3);
  index++;

  const lineItems = [];
  while (index < rows.length && !isBlankRow(rows[index]) && !REGION_IDS.has(String(rows[index][0] ?? '').trim())) {
    const row = rows[index];
    const partNumber = normalizeCell(row[0]);
    const productElement = normalizeCell(row[1]);
    const uom = normalizeCell(row[2]);

    if (!productElement) break;

    lineItems.push({
      id: slugify(`${partNumber ?? productElement}-${uom}`),
      partNumber,
      productElement,
      uom,
      pricing: parsePricingRow([partNumber, productElement, uom], countryColumns, row),
    });
    index++;
  }

  return {
    section: {
      id: 'smart-build-custom-parts-labour',
      title,
      billingType,
      type: 'custom-parts-labour',
      fixedColumns: ['Part Number', 'Product Element', 'UOM'],
      countries: countryColumns,
      lineItems,
    },
    nextIndex: index,
  };
}

function parseAccessoriesSection(rows, startIndex) {
  let index = startIndex;
  const title = String(rows[index][0] ?? '').trim();
  index++;

  const notes = [];
  if (String(rows[index]?.[0] ?? '').trim() === 'Cabinet Installation Fee') {
    notes.push({
      title: 'Cabinet Installation Fee',
      text: String(rows[index][2] ?? rows[index][1] ?? '').trim(),
    });
    index++;
  }

  const headerRow = rows[index];
  const countryColumns = parseCountryColumns(headerRow, 2);
  index++;

  const lineItems = [];
  while (index < rows.length && !isBlankRow(rows[index]) && !REGION_IDS.has(String(rows[index][0] ?? '').trim())) {
    const row = rows[index];
    const productElement = normalizeCell(row[0]);
    const uom = normalizeCell(row[1]);

    if (!productElement) break;

    lineItems.push({
      id: slugify(`${productElement}-${uom}`),
      partNumber: null,
      productElement,
      uom,
      pricing: parsePricingRow([productElement, uom], countryColumns, row),
    });
    index++;
  }

  return {
    section: {
      id: 'smart-build-accessories',
      title,
      type: 'accessories',
      notes,
      fixedColumns: ['Product Element', 'UOM'],
      countries: countryColumns,
      lineItems,
    },
    nextIndex: index,
  };
}

function parseRegionBlock(rows, startIndex) {
  const region = String(rows[startIndex][0] ?? '').trim();
  let index = startIndex + 1;
  const sections = [];

  while (index < rows.length) {
    while (index < rows.length && isBlankRow(rows[index])) index++;
    if (index >= rows.length) break;

    const marker = String(rows[index][0] ?? '').trim();
    if (REGION_IDS.has(marker)) break;

    if (marker.startsWith('Smart Build (Custom Parts')) {
      const parsed = parseCustomPartsSection(rows, index);
      sections.push(parsed.section);
      index = parsed.nextIndex;
      continue;
    }

    if (marker.startsWith('Smart Build (Accessories)')) {
      const parsed = parseAccessoriesSection(rows, index);
      sections.push(parsed.section);
      index = parsed.nextIndex;
      continue;
    }

    index++;
  }

  return { region: { id: region, name: region, sections }, nextIndex: index };
}

export function parseInstallationCostsSheet(workbook) {
  const worksheet = workbook.Sheets['Installation Cost'];
  if (!worksheet) {
    throw new Error('Installation Cost worksheet not found in accessories price list.');
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const regions = [];
  let index = 0;

  while (index < rows.length) {
    const marker = String(rows[index][0] ?? '').trim();
    if (REGION_IDS.has(marker)) {
      const parsed = parseRegionBlock(rows, index);
      regions.push(parsed.region);
      index = parsed.nextIndex;
      continue;
    }
    index++;
  }

  return regions;
}

function main() {
  const workbook = XLSX.readFile(sourcePath);
  const regions = parseInstallationCostsSheet(workbook);
  const lineItemCount = regions.reduce(
    (count, region) =>
      count + region.sections.reduce((sectionCount, section) => sectionCount + section.lineItems.length, 0),
    0,
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'public/data/accessories-price-list.xlsx#Installation Cost',
    regionCount: regions.length,
    lineItemCount,
    regions,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote installation costs for ${regions.length} regions to ${outputPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
