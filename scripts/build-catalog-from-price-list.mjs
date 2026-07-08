import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';
import { resolveProductPurpose } from './productPurpose.mjs';
import { parseInstallationCostsSheet } from './parseInstallationCosts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const newPriceListPath = path.join(root, 'Accessories Price List_new.xlsx');
const bundledPriceListPath = path.join(root, 'public/data/accessories-price-list.xlsx');
const outputPath = path.join(root, 'src/data/catalog-products.json');
const installationOutputPath = path.join(root, 'src/data/installation-costs.json');

const SHEET_CATEGORY = {
  'Cabinet Accessories': 'cabinet-accessories',
  'Power Accessories': 'power-accessories',
  'Cross Connect Accessories': 'cross-connect-accessories',
  'Cage Accessories': 'cage-accessories',
};

const COUNTRY_MAP = {
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
  'Hong Kong': 'hong-kong',
  India: 'india',
  Indonesia: 'indonesia',
  Japan: 'japan',
  Ireland: 'ireland',
  Italy: 'italy',
  Malaysia: 'malaysia',
  Mexico: 'mexico',
  Netherlands: 'netherlands',
  Oman: 'oman',
  Peru: 'peru',
  Philippines: 'philippines',
  Poland: 'poland',
  Portugal: 'portugal',
  'Republic of Korea': 'south-korea',
  Singapore: 'singapore',
  Spain: 'spain',
  Sweden: 'sweden',
  Switzerland: 'switzerland',
  Turkey: 'turkey',
  'United Arab Emirates': 'united-arab-emirates',
  'United Kingdom': 'united-kingdom',
  'United States': 'united-states',
};

const REGION_BY_COUNTRY = {
  brazil: 'AMER',
  canada: 'AMER',
  chile: 'AMER',
  colombia: 'AMER',
  mexico: 'AMER',
  peru: 'AMER',
  'united-states': 'AMER',
  australia: 'APAC',
  china: 'APAC',
  'hong-kong': 'APAC',
  india: 'APAC',
  indonesia: 'APAC',
  japan: 'APAC',
  malaysia: 'APAC',
  philippines: 'APAC',
  singapore: 'APAC',
  'south-korea': 'APAC',
  bulgaria: 'EMEA',
  finland: 'EMEA',
  france: 'EMEA',
  germany: 'EMEA',
  ireland: 'EMEA',
  italy: 'EMEA',
  netherlands: 'EMEA',
  oman: 'EMEA',
  poland: 'EMEA',
  portugal: 'EMEA',
  spain: 'EMEA',
  sweden: 'EMEA',
  switzerland: 'EMEA',
  turkey: 'EMEA',
  'united-arab-emirates': 'EMEA',
  'united-kingdom': 'EMEA',
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parseNumber(value) {
  if (value == null || value === '') return null;
  const num = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(num) ? num : null;
}

const EXCLUDED_BRANDS = new Set(['nucor']);

/** Raw MPN prefix → customer-facing brand label */
const BRAND_LABELS = {
  sra: 'SRA Solutions',
  mway: 'Multiway Infra',
  minkels: 'Minkels',
  eaton: 'Eaton',
  legrand: 'Legrand',
  stengel: 'Stengel',
  apc: 'APC',
  apismoon: 'Apismoon',
  'austin hughes': 'Austin Hughes',
  'c-connex': 'C-Connex',
  elcom: 'ELCOM',
  enlogic: 'Enlogic',
  myriad: 'Myriad',
  netrack: 'Netrack',
  omnitron: 'Omnitron',
  panduit: 'Panduit',
  planet: 'Planet',
};

function parseBrandCode(mpn) {
  const text = String(mpn ?? '').trim();
  const separatorIndex = text.indexOf('|');
  if (separatorIndex <= 0) return undefined;
  return text.slice(0, separatorIndex).trim() || undefined;
}

function resolveBrandLabel(brandCode) {
  if (!brandCode) return undefined;
  return BRAND_LABELS[brandCode.toLowerCase()] ?? brandCode;
}

function parseBrand(mpn) {
  return resolveBrandLabel(parseBrandCode(mpn));
}

function isExcludedBrand(brandCode) {
  return brandCode != null && EXCLUDED_BRANDS.has(brandCode.toLowerCase());
}

function parsePartNumber(mpn) {
  const text = String(mpn ?? '').trim();
  const separatorIndex = text.indexOf('|');
  if (separatorIndex <= 0) return text;
  return text.slice(separatorIndex + 1).trim() || text;
}

function parseTitle(description) {
  const text = String(description ?? '').trim();
  if (!text) return { name: 'Accessory', description: '' };
  const [title, ...rest] = text.split('|').map((part) => part.trim());
  return {
    name: title || text,
    description: text,
  };
}

const TRAY_MPNS = new Set(['basket tray', 'fiber tray', 'copper tray']);
const TRAY_BRAND_LABEL = 'Manufacturer varies by quote';

function titleCaseWord(word) {
  if (!word) return word;
  if (/^(\d|[A-Z0-9-]+$)/.test(word)) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function formatPipeLabel(description) {
  return String(description ?? '')
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(/\s+/).map(titleCaseWord).join(' '))
    .join(' | ');
}

function isGenericTrayMpn(mpn) {
  return TRAY_MPNS.has(String(mpn ?? '').trim().toLowerCase());
}

function parseProductNaming(mpn, productDescription) {
  const rawDescription = String(productDescription ?? '').trim();
  const formattedDescription = formatPipeLabel(rawDescription);
  const parts = rawDescription.split('|').map((part) => part.trim()).filter(Boolean);

  if (isGenericTrayMpn(mpn)) {
    if (parts.length === 1) {
      return { name: formattedDescription, description: formattedDescription };
    }

    // Sized tray runs and tray accessories both use the full pipe-delimited label.
    return { name: formattedDescription, description: formattedDescription };
  }

  const { name, description } = parseTitle(rawDescription);
  return { name, description: formatPipeLabel(description) || description };
}

function getProductKey(categoryId, mpn, description, brandCode, countryId) {
  if (categoryId === 'cross-connect-accessories') {
    return `${categoryId}::${mpn}::${countryId}`;
  }
  if (brandCode) return `${categoryId}::${mpn}`;
  if (isGenericTrayMpn(mpn)) return `${categoryId}::${slugify(description)}`;
  return `${categoryId}::${mpn}`;
}

function getProductId(categoryId, mpn, description, brandCode, countryId) {
  if (categoryId === 'cross-connect-accessories') {
    return slugify(`${categoryId}-${mpn}-${countryId}`);
  }
  if (brandCode) return slugify(`${categoryId}-${mpn}`);
  if (isGenericTrayMpn(mpn)) return slugify(`${categoryId}-${description}`);
  return slugify(`${categoryId}-${mpn}`);
}

function parseDimensions(description) {
  const text = String(description ?? '');
  const fullMatch = text.match(/(\d+)U[xX](\d+)x(\d+)/);
  if (fullMatch) {
    return {
      rackUnits: Number(fullMatch[1]),
      widthMm: Number(fullMatch[2]),
      depthMm: Number(fullMatch[3]),
    };
  }

  const partialMatch = text.match(/(\d+)U[xX](\d+)/);
  if (partialMatch) {
    return {
      rackUnits: Number(partialMatch[1]),
      widthMm: Number(partialMatch[2]),
    };
  }

  return undefined;
}

function upsertProduct(productMap, row, categoryId) {
  const countryId = COUNTRY_MAP[row.Country];
  if (!countryId) return;

  const mpn = String(row['Manufacturer Part Number'] ?? '').trim();
  if (!mpn) return;

  const brandCode = parseBrandCode(mpn);
  if (isExcludedBrand(brandCode)) return;

  const customerPrice = parseNumber(row['Customer Price']);
  const equinixPrice = parseNumber(row['Equinix Price']);
  if (customerPrice == null && equinixPrice == null) return;

  const key = getProductKey(categoryId, mpn, row['Product Description'], brandCode, countryId);
  const { name, description } = parseProductNaming(mpn, row['Product Description']);
  const dimensions = parseDimensions(row['Product Description']);
  const isTrayProduct = isGenericTrayMpn(mpn);

  if (!productMap.has(key)) {
    productMap.set(key, {
      id: getProductId(categoryId, mpn, row['Product Description'], brandCode, countryId),
      sku: mpn,
      brand: isTrayProduct ? TRAY_BRAND_LABEL : resolveBrandLabel(brandCode),
      brandCode: isTrayProduct ? undefined : brandCode,
      partNumber: parsePartNumber(mpn),
      name,
      description,
      purpose: resolveProductPurpose({ name, description, categoryId }),
      categoryId,
      regions: [],
      countries: [],
      pricing: {},
      price: 0,
      dimensions,
    });
  }

  const product = productMap.get(key);
  product.pricing[countryId] = {
    customerPrice: customerPrice ?? equinixPrice ?? 0,
    ...(equinixPrice != null ? { equinixPrice } : {}),
  };

  if (!product.countries.includes(countryId)) {
    product.countries.push(countryId);
  }

  if (dimensions && !product.dimensions) {
    product.dimensions = dimensions;
  }
}

function finalizeProducts(productMap) {
  const products = [...productMap.values()];

  for (const product of products) {
    product.countries.sort();
    product.regions = [...new Set(product.countries.map((id) => REGION_BY_COUNTRY[id]))].sort();
    const prices = Object.values(product.pricing).map((entry) => entry.customerPrice);
    product.price = prices.length ? Math.min(...prices) : 0;
  }

  return products.sort((a, b) => a.name.localeCompare(b.name));
}

function resolveSourceWorkbook() {
  if (fs.existsSync(newPriceListPath)) {
    fs.copyFileSync(newPriceListPath, bundledPriceListPath);
    console.log(`Using ${newPriceListPath}`);
    return XLSX.readFile(newPriceListPath);
  }

  if (fs.existsSync(bundledPriceListPath)) {
    console.log(`Using ${bundledPriceListPath}`);
    return XLSX.readFile(bundledPriceListPath);
  }

  throw new Error(
    'No accessories price list workbook found. Add Accessories Price List_new.xlsx to the project root.',
  );
}

function main() {
  const workbook = resolveSourceWorkbook();

  const productMap = new Map();
  const sourceRowCounts = {};

  for (const [sheetName, categoryId] of Object.entries(SHEET_CATEGORY)) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      console.warn(`Skipping missing sheet: ${sheetName}`);
      continue;
    }

    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    sourceRowCounts[categoryId] = rows.length;
    for (const row of rows) {
      upsertProduct(productMap, row, categoryId);
    }
  }

  const products = finalizeProducts(productMap);
  const categoryCounts = products.reduce((counts, product) => {
    counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    return counts;
  }, {});

  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'Accessories Price List_new.xlsx',
    sourceRowCounts,
    productCount: products.length,
    categoryCounts,
    products,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${products.length} products to ${outputPath}`);

  const installationRegions = parseInstallationCostsSheet(workbook);
  const lineItemCount = installationRegions.reduce(
    (count, region) =>
      count +
      region.sections.reduce((sectionCount, section) => sectionCount + section.lineItems.length, 0),
    0,
  );

  fs.writeFileSync(
    installationOutputPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: 'Accessories Price List_new.xlsx#Installation Cost',
        regionCount: installationRegions.length,
        lineItemCount,
        regions: installationRegions,
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `Wrote installation costs for ${installationRegions.length} regions to ${installationOutputPath}`,
  );
}

main();
