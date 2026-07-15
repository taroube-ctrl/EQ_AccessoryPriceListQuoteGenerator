export type QuoteLineKind = 'product' | 'cpl';

export interface QuoteProductLine {
  id: string;
  name: string;
  quantity: number;
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
}

export const DEFAULT_QUOTE_FORM: QuoteFormState = {
  accountName: '',
  customBillingAccount: '',
  usid: '',
  customerContactName: '',
  quoteType: 'Accessories',
  subtype: 'EIS Cabinet Accessories',
};
