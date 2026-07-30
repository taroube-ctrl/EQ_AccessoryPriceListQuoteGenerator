import type { Product, CategoryId } from '../types';
import type { CartItem } from '../types/cart';
import type { DisplayUnit } from '../types/dimensions';
import type { QuoteFormState, QuoteProductLine } from '../types/requestQuote';
import { getProductById } from '../data/products';
import { formatDescriptionWithDisplayUnits } from './productDisplayName';

const SUBTYPE_BY_CATEGORY: Partial<Record<CategoryId, string>> = {
  'cabinet-accessories': 'EIS Cabinet Accessories',
  'power-accessories': 'EIS Power Accessories',
  'cross-connect-accessories': 'EIS Cross Connect Accessories',
  'cage-accessories': 'EIS Cage Accessories',
  'installation-costs': 'Installation Costs',
};

export function formatQuoteProductLine(product: Product, displayUnit: DisplayUnit): string {
  const partNumber = (product.partNumber ?? '').trim();
  const brand = (product.brand ?? '').trim();
  const description = formatDescriptionWithDisplayUnits(product.description, displayUnit).trim();
  const segments: string[] = [];

  if (partNumber) segments.push(partNumber);
  if (brand) segments.push(brand);

  if (description) {
    let desc = description;
    // Cage-style rows often repeat the part number as the first description segment.
    if (partNumber) {
      const parts = description.split('|').map((part) => part.trim());
      if (parts[0]?.toLowerCase() === partNumber.toLowerCase()) {
        desc = parts.slice(1).join(' | ');
      }
    }
    if (desc) segments.push(desc);
  }

  return segments.join(' | ');
}

export function createQuoteProductLine(
  product: Product,
  quantity: number,
  displayUnit: DisplayUnit,
): QuoteProductLine {
  return {
    id: product.id,
    name: formatQuoteProductLine(product, displayUnit),
    quantity,
  };
}

export function buildQuoteProductsFromCart(
  items: CartItem[],
  displayUnit: DisplayUnit,
  extraProductId?: string,
): QuoteProductLine[] {
  const lines: QuoteProductLine[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const product = getProductById(item.productId);
    if (!product || seen.has(product.id)) continue;
    seen.add(product.id);
    lines.push(createQuoteProductLine(product, item.quantity, displayUnit));
  }

  if (extraProductId && !seen.has(extraProductId)) {
    const product = getProductById(extraProductId);
    if (product) {
      lines.push(createQuoteProductLine(product, 1, displayUnit));
    }
  }

  return lines.length > 0 ? lines : [createEmptyQuoteProductLine()];
}

function createLineId(): string {
  return `quote-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyQuoteProductLine(): QuoteProductLine {
  return {
    id: createLineId(),
    name: '',
    quantity: 1,
    kind: 'product',
  };
}

export function createEmptyCplLine(): QuoteProductLine {
  return {
    id: createLineId(),
    name: '',
    quantity: 1,
    kind: 'cpl',
  };
}

export function inferQuoteSubtype(items: CartItem[], fallbackProductId?: string): string {
  const categoryIds = new Set<CategoryId>();

  for (const item of items) {
    const product = getProductById(item.productId);
    if (product) categoryIds.add(product.categoryId);
  }

  if (fallbackProductId) {
    const product = getProductById(fallbackProductId);
    if (product) categoryIds.add(product.categoryId);
  }

  if (categoryIds.size === 1) {
    const [categoryId] = [...categoryIds];
    return SUBTYPE_BY_CATEGORY[categoryId] ?? 'Accessories';
  }

  return 'Accessories';
}

export interface QuotePreviewOptions {
  /** Formats a line unit price (e.g. with a currency symbol). Defaults to the raw number. */
  formatPrice?: (value: number) => string;
}

function resolveLineSubtype(line: QuoteProductLine, fallbackSubtype: string): string {
  if (line.kind === 'cpl') return 'Custom Parts & Labor';
  const product = getProductById(line.id);
  if (product) return SUBTYPE_BY_CATEGORY[product.categoryId] ?? fallbackSubtype;
  return fallbackSubtype || 'Accessories';
}

function formatLineWithQuantity(line: QuoteProductLine): string {
  const name = (line.name || ' ').trim() || ' ';
  return `${name} | QTY (${line.quantity || 0})`;
}

/**
 * Groups quote lines by subtype (category), then appends a SOW rollup:
 *
 * Subtype: EIS Cabinet Accessories
 *
 * Product 1 - Name of product on the on-hand supply list:
 *
 * PART | Brand | Description | QTY (n)
 * …
 * SOW:
 *
 * Equinix To Purchase and Install:
 * …
 */
export function formatQuotePreview(
  form: QuoteFormState,
  products: QuoteProductLine[],
  options: QuotePreviewOptions = {},
): string {
  const formatPrice = options.formatPrice ?? ((value: number) => String(value));
  const fallbackSubtype = form.subtype.trim() || 'Accessories';

  const lines = [
    `Account name: ${form.accountName || ' '}`,
    `Custom Billing Account: ${form.customBillingAccount || ' '}`,
    `USID (If Applicable): ${form.usid || ' '}`,
    `Customer Contact Name: ${form.customerContactName || ' '}`,
    `Quote Type (Line Item Name): ${form.quoteType || ' '}`,
    '',
  ];

  const productLines = products.filter((line) => line.kind !== 'cpl');
  const cplLines = products.filter((line) => line.kind === 'cpl');

  const grouped = new Map<string, QuoteProductLine[]>();
  for (const line of productLines) {
    const subtype = resolveLineSubtype(line, fallbackSubtype);
    const bucket = grouped.get(subtype);
    if (bucket) bucket.push(line);
    else grouped.set(subtype, [line]);
  }

  let productGroupIndex = 0;
  for (const [subtype, groupLines] of grouped) {
    productGroupIndex += 1;
    lines.push(`Subtype: ${subtype}`, '');
    lines.push(`Product ${productGroupIndex} - Name of product on the on-hand supply list:`, '');
    for (const line of groupLines) {
      lines.push(formatLineWithQuantity(line));
      if (line.price != null) {
        lines.push(`Price  (${formatPrice(line.price)})`);
      }
    }
    lines.push('');
  }

  if (cplLines.length > 0) {
    lines.push('Subtype: Custom Parts & Labor', '');
    cplLines.forEach((line, index) => {
      lines.push(`CPL ${index + 1} - Custom Parts & Labor:`, '');
      lines.push(formatLineWithQuantity(line));
      if (line.price != null) {
        lines.push(`Price  (${formatPrice(line.price)})`);
      }
      lines.push('');
    });
  }

  const sowLines = [...productLines, ...cplLines];
  if (sowLines.length > 0) {
    lines.push('SOW:', '', 'Equinix To Purchase and Install:');
    for (const line of sowLines) {
      lines.push(formatLineWithQuantity(line));
    }
  }

  return lines.join('\n').trimEnd();
}

const OUTLOOK_COMPOSE_URL = 'https://outlook.office.com/mail/deeplink/compose';
const OUTLOOK_BODY_CHAR_LIMIT = 1800;

export const QUOTE_EMAIL_TO = 'TCOMsupport@equinix.com';
export const QUOTE_EMAIL_CC = 'bblaski@equinix.com';

export function buildQuoteEmailSubject(form: QuoteFormState): string {
  const account = form.accountName.trim();
  if (account) return `Accessories Quote Request - ${account}`;
  return 'Accessories Quote Request';
}

export function buildMailtoQuoteUrl(
  form: QuoteFormState,
  products: QuoteProductLine[],
  options: QuotePreviewOptions = {},
): string {
  const subject = encodeURIComponent(buildQuoteEmailSubject(form));
  const body = encodeURIComponent(formatQuotePreview(form, products, options));
  const cc = encodeURIComponent(QUOTE_EMAIL_CC);
  return `mailto:${QUOTE_EMAIL_TO}?cc=${cc}&subject=${subject}&body=${body}`;
}

/** Opens Outlook on the web with the quote pre-filled (To only — Cc is not supported by this URL). */
export function buildOutlookComposeUrl(
  form: QuoteFormState,
  products: QuoteProductLine[],
  options: QuotePreviewOptions = {},
): string | null {
  const body = formatQuotePreview(form, products, options);
  if (body.length > OUTLOOK_BODY_CHAR_LIMIT) return null;

  // Keep To as a plain address (Outlook examples use raw emails). Encode subject/body
  // with encodeURIComponent so spaces stay %20 — Outlook does not treat + as a space.
  const subject = encodeURIComponent(buildQuoteEmailSubject(form));
  const encodedBody = encodeURIComponent(body);

  return `${OUTLOOK_COMPOSE_URL}?to=${QUOTE_EMAIL_TO}&subject=${subject}&body=${encodedBody}`;
}

export type OpenOutlookResult =
  | 'opened'
  | 'too-long'
  | 'clipboard-failed'
  | 'needs-sign-in'
  | 'graph-failed';

export async function copyQuoteAndOpenOutlook(
  form: QuoteFormState,
  products: QuoteProductLine[],
  options: QuotePreviewOptions = {},
): Promise<OpenOutlookResult> {
  const outlookUrl = buildOutlookComposeUrl(form, products, options);
  if (!outlookUrl) return 'too-long';

  try {
    await navigator.clipboard.writeText(formatQuotePreview(form, products, options));
  } catch {
    return 'clipboard-failed';
  }

  window.open(outlookUrl, '_blank', 'noopener,noreferrer');
  return 'opened';
}
