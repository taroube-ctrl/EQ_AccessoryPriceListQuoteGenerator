import { useCallback, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { formatPrice } from '../data/localeConfig';
import { Button } from '../components/ui/Button';
import {
  useQuoteDirtyState,
  useUnsavedChangesWarning,
  UNSAVED_QUOTE_MESSAGE,
} from '../hooks/useUnsavedChangesWarning';
import { DEFAULT_QUOTE_FORM, type QuoteFormState, type QuoteProductLine } from '../types/requestQuote';
import {
  buildQuoteProductsFromCart,
  copyQuoteAndOpenOutlook,
  createEmptyCplLine,
  createEmptyQuoteProductLine,
  formatQuotePreview,
  inferQuoteSubtype,
} from '../utils/requestQuote';
import { saveQuote } from '../utils/savedQuotes';

interface RequestQuoteLocationState {
  productId?: string;
  savedQuoteId?: string;
  form?: QuoteFormState;
  products?: QuoteProductLine[];
}

function QuoteField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-text-secondary block mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:border-brand-red"
      />
    </div>
  );
}

export function RequestQuotePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();
  const { displayUnit, currencyCountryId } = useCatalog();
  const locationState = (location.state as RequestQuoteLocationState | null) ?? {};
  const extraProductId = locationState.productId;
  const reusedForm = locationState.form;
  const reusedProducts = locationState.products;

  const [savedQuoteId, setSavedQuoteId] = useState<string | undefined>(
    locationState.savedQuoteId,
  );
  const [form, setForm] = useState<QuoteFormState>(() =>
    reusedForm
      ? { ...reusedForm }
      : {
          ...DEFAULT_QUOTE_FORM,
          subtype: inferQuoteSubtype(items, extraProductId),
        },
  );
  const [products, setProducts] = useState<QuoteProductLine[]>(() =>
    reusedProducts && reusedProducts.length > 0
      ? reusedProducts.map((line) => ({ ...line }))
      : buildQuoteProductsFromCart(items, displayUnit, extraProductId),
  );
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [outlookStatus, setOutlookStatus] = useState<'idle' | 'opened' | 'too-long' | 'clipboard-failed'>(
    'idle',
  );

  const formatLinePrice = useCallback(
    (value: number) => formatPrice(value, currencyCountryId),
    [currencyCountryId],
  );

  const previewText = useMemo(
    () => formatQuotePreview(form, products, { formatPrice: formatLinePrice }),
    [form, products, formatLinePrice],
  );
  const { isDirty, markPristine } = useQuoteDirtyState(form, products);
  useUnsavedChangesWarning(isDirty, UNSAVED_QUOTE_MESSAGE);

  const handleSave = () => {
    const stored = saveQuote(form, products, savedQuoteId);
    setSavedQuoteId(stored.id);
    markPristine();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const confirmNavigate = (to: string) => {
    if (!isDirty || window.confirm(UNSAVED_QUOTE_MESSAGE)) {
      navigate(to);
    }
  };

  const updateForm = (field: keyof QuoteFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateProduct = (id: string, patch: Partial<QuoteProductLine>) => {
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, ...patch } : product)),
    );
  };

  const addProduct = () => {
    setProducts((current) => [...current, createEmptyQuoteProductLine()]);
  };

  const addCpl = () => {
    setProducts((current) => [...current, createEmptyCplLine()]);
  };

  const removeProduct = (id: string) => {
    setProducts((current) =>
      current.length <= 1 ? current : current.filter((product) => product.id !== id),
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewText);
      setCopied(true);
      setOutlookStatus('idle');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleOpenOutlook = async () => {
    const result = await copyQuoteAndOpenOutlook(form, products, {
      formatPrice: formatLinePrice,
    });
    setOutlookStatus(result);
    if (result === 'opened') {
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
        setOutlookStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold m-0 mb-2">Request Quote</h1>
        <p className="text-sm text-text-muted m-0 mb-8 leading-relaxed">
          Enter the account and product details below. Product lines are pre-filled from your cart
          when available.
        </p>

        <form
          className="space-y-8"
          onSubmit={(event) => {
            event.preventDefault();
            void handleCopy();
          }}
        >
          <section className="border border-border rounded-sm bg-surface p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary m-0">
              Account Details
            </h2>
            <QuoteField
              id="account-name"
              label="Account name"
              value={form.accountName}
              onChange={(value) => updateForm('accountName', value)}
            />
            <QuoteField
              id="billing-account"
              label="Custom Billing Account"
              value={form.customBillingAccount}
              onChange={(value) => updateForm('customBillingAccount', value)}
            />
            <QuoteField
              id="usid"
              label="USID (If Applicable)"
              value={form.usid}
              onChange={(value) => updateForm('usid', value)}
            />
            <QuoteField
              id="contact-name"
              label="Customer Contact Name"
              value={form.customerContactName}
              onChange={(value) => updateForm('customerContactName', value)}
            />
          </section>

          <section className="border border-border rounded-sm bg-surface p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary m-0">
              Quote Classification
            </h2>
            <QuoteField
              id="quote-type"
              label="Quote Type (Line Item Name)"
              value={form.quoteType}
              placeholder="Accessories"
              onChange={(value) => updateForm('quoteType', value)}
            />
            <QuoteField
              id="subtype"
              label="Subtype"
              value={form.subtype}
              placeholder="EIS Cabinet Accessories"
              onChange={(value) => updateForm('subtype', value)}
            />
          </section>

          <section className="border border-border rounded-sm bg-surface p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary m-0">
                Products
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={addProduct}>
                  Add product
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={addCpl}>
                  Add CPL
                </Button>
              </div>
            </div>

            {products.map((product, index) => {
              const isCpl = product.kind === 'cpl';
              const number = products
                .slice(0, index + 1)
                .filter((line) => (line.kind === 'cpl') === isCpl).length;
              return (
                <div
                  key={product.id}
                  className="border border-border rounded-sm p-4 space-y-3 bg-surface-muted/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-text-secondary m-0">
                      {isCpl ? `Custom Parts & Labor (CPL) ${number}` : `Product ${number}`}
                    </p>
                    {products.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="text-xs text-text-muted border-none bg-transparent cursor-pointer p-0 hover:text-brand-red hover:underline"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor={`product-name-${product.id}`}
                      className="text-sm font-semibold text-text-secondary block mb-1.5"
                    >
                      {isCpl
                        ? 'Description of custom parts & labor'
                        : 'Name of product on the on-hand supply list'}
                    </label>
                    <textarea
                      id={`product-name-${product.id}`}
                      rows={3}
                      value={product.name}
                      placeholder={
                        isCpl
                          ? 'Describe the custom parts and labor scope, materials, and work required'
                          : 'ENXTL48812 – Eaton | Cabinet | 48Ux800x1200 | Closed | ENXTL48812'
                      }
                      onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                      className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-surface text-text font-mono focus:outline-none focus:border-brand-red resize-y"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="w-32">
                      <label
                        htmlFor={`product-qty-${product.id}`}
                        className="text-sm font-semibold text-text-secondary block mb-1.5"
                      >
                        QTY
                      </label>
                      <input
                        id={`product-qty-${product.id}`}
                        type="number"
                        min={1}
                        value={product.quantity}
                        onChange={(e) =>
                          updateProduct(product.id, {
                            quantity: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-surface text-text font-mono focus:outline-none focus:border-brand-red"
                      />
                    </div>

                    <div className="w-40">
                      <label
                        htmlFor={`product-price-${product.id}`}
                        className="text-sm font-semibold text-text-secondary block mb-1.5"
                      >
                        Price <span className="font-normal text-text-muted">(optional)</span>
                      </label>
                      <input
                        id={`product-price-${product.id}`}
                        type="number"
                        min={0}
                        step="0.01"
                        inputMode="decimal"
                        value={product.price ?? ''}
                        placeholder="0.00"
                        onChange={(e) => {
                          const raw = e.target.value;
                          updateProduct(product.id, {
                            price: raw === '' ? undefined : Math.max(0, Number(raw) || 0),
                          });
                        }}
                        className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-surface text-text font-mono focus:outline-none focus:border-brand-red"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="border border-border rounded-sm bg-surface p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary m-0">
              Quote Preview
            </h2>
            <pre
              className={clsx(
                'm-0 whitespace-pre-wrap break-words rounded-sm border border-border',
                'bg-surface-muted px-4 py-3 text-sm font-mono text-text-secondary leading-relaxed',
              )}
            >
              {previewText}
            </pre>
          </section>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="cart" onClick={() => void handleOpenOutlook()}>
                {outlookStatus === 'opened' ? 'Opening Outlook…' : 'Open in Outlook'}
              </Button>
              <Button type="button" onClick={handleSave}>
                {saved ? 'Quote saved' : savedQuoteId ? 'Update saved quote' : 'Save quote'}
              </Button>
              <Button type="submit" variant="secondary">
                {copied && outlookStatus === 'idle' ? 'Copied to clipboard' : 'Copy quote text'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => confirmNavigate('/cart')}>
                Back to cart
              </Button>
              <button
                type="button"
                onClick={() => confirmNavigate('/my-quotes')}
                className="inline-flex items-center text-sm text-brand-red bg-transparent border-none cursor-pointer hover:underline px-1"
              >
                My Quotes
              </button>
              {isDirty ? (
                <button
                  type="button"
                  onClick={() => confirmNavigate('/products')}
                  className="inline-flex items-center text-sm text-brand-red bg-transparent border-none cursor-pointer hover:underline px-1"
                >
                  Continue shopping
                </button>
              ) : (
                <Link
                  to="/products"
                  className="inline-flex items-center text-sm text-brand-red no-underline hover:underline px-1"
                >
                  Continue shopping
                </Link>
              )}
            </div>
            {outlookStatus === 'too-long' ? (
              <p className="text-sm text-amber-950 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 m-0">
                This quote is too long to pre-fill in Outlook automatically. Use Copy quote text and
                paste it into a new email manually.
              </p>
            ) : null}
            {outlookStatus === 'clipboard-failed' ? (
              <p className="text-sm text-amber-950 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 m-0">
                Could not copy the quote to your clipboard. Allow clipboard access or use Copy quote
                text, then open Outlook manually.
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
