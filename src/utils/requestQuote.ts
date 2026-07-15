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
  const partNumber = product.partNumber ?? '';
  const brand = product.brand ?? '';
  const description = formatDescriptionWithDisplayUnits(product.description, displayUnit);
  return `${partNumber} – ${brand} | ${description}`;
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

export function formatQuotePreview(
  form: QuoteFormState,
  products: QuoteProductLine[],
  options: QuotePreviewOptions = {},
): string {
  const formatPrice = options.formatPrice ?? ((value: number) => String(value));

  const lines = [
    `Account name: ${form.accountName || ' '}`,
    `Custom Billing Account: ${form.customBillingAccount || ' '}`,
    `USID (If Applicable): ${form.usid || ' '}`,
    `Customer Contact Name: ${form.customerContactName || ' '}`,
    `Quote Type (Line Item Name): ${form.quoteType || ' '}`,
    '',
    `Subtype: ${form.subtype || ' '}`,
    '',
  ];

  let productIndex = 0;
  let cplIndex = 0;

  products.forEach((line) => {
    const heading =
      line.kind === 'cpl'
        ? `CPL ${(cplIndex += 1)} - Custom Parts & Labor:`
        : `Product ${(productIndex += 1)} - Name of product on the on-hand supply list:`;

    lines.push(heading, '', line.name || ' ', `QTY  (${line.quantity || 0})`);

    if (line.price != null) {
      lines.push(`Price  (${formatPrice(line.price)})`);
    }

    lines.push('');
  });

  return lines.join('\n').trimEnd();
}

const OUTLOOK_COMPOSE_URL = 'https://outlook.office.com/mail/deeplink/compose';
const OUTLOOK_BODY_CHAR_LIMIT = 1800;

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
  return `mailto:?subject=${subject}&body=${body}`;
}

/** Opens Outlook on the web with a pre-filled compose window (works best when signed into Microsoft 365). */
export function buildOutlookComposeUrl(
  form: QuoteFormState,
  products: QuoteProductLine[],
  options: QuotePreviewOptions = {},
): string | null {
  const body = formatQuotePreview(form, products, options);
  if (body.length > OUTLOOK_BODY_CHAR_LIMIT) return null;

  // Encode manually so spaces become %20 (not +), keeping the Outlook body
  // identical to the copied/preview text. Outlook does not decode + as a space.
  const subject = encodeURIComponent(buildQuoteEmailSubject(form));
  const encodedBody = encodeURIComponent(body);

  return `${OUTLOOK_COMPOSE_URL}?subject=${subject}&body=${encodedBody}`;
}

export async function copyQuoteAndOpenOutlook(
  form: QuoteFormState,
  products: QuoteProductLine[],
  options: QuotePreviewOptions = {},
): Promise<'opened' | 'too-long' | 'clipboard-failed'> {
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
