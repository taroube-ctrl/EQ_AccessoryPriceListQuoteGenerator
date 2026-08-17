import type { Product, CategoryId } from '../types';
import type { CartItem } from '../types/cart';
import type { DisplayUnit } from '../types/dimensions';
import type { QuoteFormState, QuoteProductLine } from '../types/requestQuote';
import { getProductById } from '../data/products';
import { formatDescriptionWithDisplayUnits } from './productDisplayName';

const SUBTYPE_BY_CATEGORY: Partial<Record<CategoryId, string>> = {
  'cabinet-accessories': 'EIS Cabinet Accessories',
  'power-accessories': 'PDU Accessories',
  'cross-connect-accessories': 'EIS Cross Connect Accessories',
  'cage-accessories': 'EIS Cage Accessories',
  'installation-costs': 'Installation Costs',
};

/**
 * SOW description line: Brand | Description | PartNumber
 * Example: Eaton | Cabinet | 48Ux600x1100 | Closed | ENXTL48611
 */
export function formatQuoteProductLine(product: Product, displayUnit: DisplayUnit): string {
  const partNumber = (product.partNumber ?? '').trim();
  const brand = (product.brand ?? '').trim();
  const description = formatDescriptionWithDisplayUnits(product.description, displayUnit).trim();
  const segments: string[] = [];

  if (brand) segments.push(brand);

  if (description) {
    let desc = description;
    if (partNumber) {
      const parts = description.split('|').map((part) => part.trim()).filter(Boolean);
      if (parts[0]?.toLowerCase() === partNumber.toLowerCase()) {
        desc = parts.slice(1).join(' | ');
      } else if (parts[parts.length - 1]?.toLowerCase() === partNumber.toLowerCase()) {
        desc = parts.slice(0, -1).join(' | ');
      }
    }
    if (desc) segments.push(desc);
  }

  if (partNumber) {
    const lastSegmentParts = segments[segments.length - 1]
      ?.split('|')
      .map((part) => part.trim())
      .filter(Boolean);
    const lastSegment = lastSegmentParts?.[lastSegmentParts.length - 1];
    const alreadyEndsWithPart = lastSegment?.toLowerCase() === partNumber.toLowerCase();
    if (!alreadyEndsWithPart) segments.push(partNumber);
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
    partNumber: (product.partNumber ?? '').trim(),
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
    partNumber: '',
    name: '',
    quantity: 1,
    kind: 'product',
  };
}

export function createEmptyCplLine(): QuoteProductLine {
  return {
    id: createLineId(),
    partNumber: '',
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

function resolvePartNumber(line: QuoteProductLine): string {
  const explicit = line.partNumber?.trim();
  if (explicit) return explicit;

  const product = getProductById(line.id);
  if (product?.partNumber?.trim()) return product.partNumber.trim();

  const fromName = line.name.split('|')[0]?.trim();
  return fromName || ' ';
}

function formatPriceOrAutoFill(
  line: QuoteProductLine,
  formatPrice: (value: number) => string,
): string {
  return line.price != null ? formatPrice(line.price) : 'Auto-Fill';
}

/**
 * EIS On Hand Supply quote template.
 *
 * Account name: …
 *
 * Quote Type: Accessories
 *
 * Subtype: EIS Cabinet Accessories
 * Product 1 : 10x ENXTL48611 (Name of product on the on-hand supply list)
 * Price: Auto-Fill
 * Labor: Auto-Fill
 *
 * Scope of Work:
 *
 * Equinix will purchase and install:
 *
 * 10x ENXTL48611
 * Eaton | Cabinet | …
 */
export function formatQuotePreview(
  form: QuoteFormState,
  products: QuoteProductLine[],
  options: QuotePreviewOptions = {},
): string {
  const formatPrice = options.formatPrice ?? ((value: number) => String(value));
  const fallbackSubtype = form.subtype.trim() || 'Accessories';
  const usid = form.usid.trim() || 'N/A';

  const lines = [
    `Account name: ${form.accountName || ' '}`,
    '',
    `Custom Billing Account: ${form.customBillingAccount || ' '}`,
    '',
    `USID (If Applicable): ${usid}`,
    '',
    `Customer Contact Name:  ${form.customerContactName || ' '}`,
    '',
    `Quote Type: ${form.quoteType || 'Accessories'}`,
    '',
  ];

  const productLines = products.filter((line) => line.kind !== 'cpl');
  const cplLines = products.filter((line) => line.kind === 'cpl');

  let productIndex = 0;
  for (const line of productLines) {
    productIndex += 1;
    const subtype = resolveLineSubtype(line, fallbackSubtype);
    const partNumber = resolvePartNumber(line);
    const qty = line.quantity || 0;

    lines.push(`Subtype: ${subtype}`);
    lines.push(
      `Product ${productIndex} : ${qty}x ${partNumber} (Name of product on the on-hand supply list)`,
    );
    lines.push(`Price: ${formatPriceOrAutoFill(line, formatPrice)}`);
    lines.push('Labor: Auto-Fill');
    lines.push('');
  }

  cplLines.forEach((line, index) => {
    const partNumber = resolvePartNumber(line);
    const qty = line.quantity || 0;
    lines.push('Subtype: Custom Parts & Labor');
    lines.push(`CPL ${index + 1} : ${qty}x ${partNumber || line.name || 'CPL'}`);
    lines.push(`Price: ${formatPriceOrAutoFill(line, formatPrice)}`);
    lines.push('Labor: Auto-Fill');
    lines.push('');
  });

  const laborOverride = form.laborPriceOverride?.trim();
  if (laborOverride) {
    lines.push(`Labor price override: ${laborOverride}`, '');
  }

  const sowLines = [...productLines, ...cplLines];
  if (sowLines.length > 0 || form.scopeOfWorkNotes?.trim()) {
    lines.push('Scope of Work:', '', 'Equinix will purchase and install:', '');

    for (const line of sowLines) {
      const partNumber = resolvePartNumber(line);
      const qty = line.quantity || 0;
      lines.push(`${qty}x ${partNumber}`);
      if (line.name.trim()) {
        lines.push(line.name.trim());
      }
      lines.push('');
    }

    const notes = form.scopeOfWorkNotes?.trim();
    if (notes) {
      lines.push(...notes.split(/\r?\n/));
    }
  }

  return lines.join('\n').trimEnd();
}

const OUTLOOK_COMPOSE_URL = 'https://outlook.office.com/mail/deeplink/compose';
const OUTLOOK_BODY_CHAR_LIMIT = 1800;

export const QUOTE_EMAIL_TO = 'COMsupport@equinix.com';

export function buildQuoteEmailSubject(form: QuoteFormState): string {
  const accountName = form.accountName.trim();
  const billingAccount = form.customBillingAccount.trim();
  const usid = form.usid.trim() || 'N/A';

  return `${accountName} – ${billingAccount} – ${usid}`;
}

export function buildMailtoQuoteUrl(
  form: QuoteFormState,
  products: QuoteProductLine[],
  options: QuotePreviewOptions = {},
): string {
  const subject = encodeURIComponent(buildQuoteEmailSubject(form));
  const body = encodeURIComponent(formatQuotePreview(form, products, options));
  return `mailto:${QUOTE_EMAIL_TO}?subject=${subject}&body=${body}`;
}

/** Opens Outlook on the web with the quote pre-filled (To, subject, and body). */
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
