export type QuoteLineKind = 'product' | 'cpl';

export interface QuoteProductLine {
  id: string;
  /** Scope-of-work description line (e.g. brand | type | specs | part). */
  name: string;
  quantity: number;
  /** Part / SKU shown in Product N and SOW qty lines. */
  partNumber?: string;
  /** Defaults to 'product' when omitted (kept optional for backward compatibility). */
  kind?: QuoteLineKind;
  /** Optional unit price for the line; omitted when the user leaves it blank. */
  price?: number;
}

export interface QuoteFormState {
  accountName: string;
  customBillingAccount: string;
  usid: string;
  customerContactName: string;
  quoteType: string;
  subtype: string;
  /** Optional, e.g. "$99.11/hour (Canada)". */
  laborPriceOverride: string;
  /** Extra Scope of Work notes after the purchase list. */
  scopeOfWorkNotes: string;
}

export const DEFAULT_QUOTE_FORM: QuoteFormState = {
  accountName: '',
  customBillingAccount: '',
  usid: 'N/A',
  customerContactName: '',
  quoteType: 'Accessories',
  subtype: 'EIS Cabinet Accessories',
  laborPriceOverride: '',
  scopeOfWorkNotes: '',
};
