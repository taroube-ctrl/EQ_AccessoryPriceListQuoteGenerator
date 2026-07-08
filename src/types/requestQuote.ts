export interface QuoteProductLine {
  id: string;
  name: string;
  quantity: number;
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
