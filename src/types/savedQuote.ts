import type { QuoteFormState, QuoteProductLine } from './requestQuote';

export interface SavedQuote {
  id: string;
  createdAt: string;
  updatedAt: string;
  form: QuoteFormState;
  products: QuoteProductLine[];
}
