import type { QuoteFormState, QuoteProductLine } from '../types/requestQuote';
import type { SavedQuote } from '../types/savedQuote';

const STORAGE_KEY = 'saved-quotes-v1';

/** Notifies listeners (e.g. footer badge, open tabs) whenever saved quotes change. */
export const SAVED_QUOTES_EVENT = 'saved-quotes-changed';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createId(): string {
  return `quote-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadSavedQuotes(): SavedQuote[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedQuote[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function persist(quotes: SavedQuote[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    window.dispatchEvent(new CustomEvent(SAVED_QUOTES_EVENT));
  } catch {
    /* storage unavailable — ignore */
  }
}

/**
 * Saves a quote. When `existingId` is provided and found, that quote is updated
 * in place; otherwise a new quote is prepended. Returns the stored quote.
 */
export function saveQuote(
  form: QuoteFormState,
  products: QuoteProductLine[],
  existingId?: string,
): SavedQuote {
  const quotes = loadSavedQuotes();
  const now = new Date().toISOString();

  const cleanProducts = products.map((line) => ({ ...line }));

  if (existingId) {
    const index = quotes.findIndex((quote) => quote.id === existingId);
    if (index !== -1) {
      const updated: SavedQuote = {
        ...quotes[index],
        form: { ...form },
        products: cleanProducts,
        updatedAt: now,
      };
      quotes[index] = updated;
      persist(quotes);
      return updated;
    }
  }

  const created: SavedQuote = {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    form: { ...form },
    products: cleanProducts,
  };
  persist([created, ...quotes]);
  return created;
}

export function deleteSavedQuote(id: string): void {
  const quotes = loadSavedQuotes().filter((quote) => quote.id !== id);
  persist(quotes);
}

export function clearSavedQuotes(): void {
  persist([]);
}

export function getSavedQuoteCount(): number {
  return loadSavedQuotes().length;
}

export function getQuoteTotalQuantity(quote: SavedQuote): number {
  return quote.products.reduce((total, line) => total + (Number(line.quantity) || 0), 0);
}

export function getQuoteTitle(quote: SavedQuote): string {
  return quote.form.accountName.trim() || 'Untitled quote';
}
