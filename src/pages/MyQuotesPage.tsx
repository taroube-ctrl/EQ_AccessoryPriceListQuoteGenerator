import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import type { SavedQuote } from '../types/savedQuote';
import {
  SAVED_QUOTES_EVENT,
  clearSavedQuotes,
  deleteSavedQuote,
  getQuoteTitle,
  getQuoteTotalQuantity,
  loadSavedQuotes,
} from '../utils/savedQuotes';
import { formatQuotePreview } from '../utils/requestQuote';

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function QuoteCard({
  quote,
  onDelete,
  onReuse,
}: {
  quote: SavedQuote;
  onDelete: (id: string) => void;
  onReuse: (quote: SavedQuote) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalQty = getQuoteTotalQuantity(quote);
  const namedLines = quote.products.filter((line) => line.name.trim().length > 0).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatQuotePreview(quote.form, quote.products));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="border border-border rounded-sm bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold m-0 mb-1">{getQuoteTitle(quote)}</h2>
          <p className="text-xs text-text-muted m-0">
            Saved {formatDate(quote.updatedAt)}
            {quote.updatedAt !== quote.createdAt ? ' (updated)' : ''}
          </p>
        </div>
        <span className="text-xs font-mono text-text-muted whitespace-nowrap">
          {namedLines} {namedLines === 1 ? 'product' : 'products'} · {totalQty} qty
        </span>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mt-4 m-0">
        <div className="flex gap-2">
          <dt className="font-semibold text-text-secondary">Quote type:</dt>
          <dd className="m-0 text-text-muted">{quote.form.quoteType || '—'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold text-text-secondary">Subtype:</dt>
          <dd className="m-0 text-text-muted">{quote.form.subtype || '—'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold text-text-secondary">Billing account:</dt>
          <dd className="m-0 text-text-muted">{quote.form.customBillingAccount || '—'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold text-text-secondary">Contact:</dt>
          <dd className="m-0 text-text-muted">{quote.form.customerContactName || '—'}</dd>
        </div>
      </dl>

      {expanded ? (
        <pre className="mt-4 m-0 whitespace-pre-wrap break-words rounded-sm border border-border bg-surface-muted px-4 py-3 text-xs font-mono text-text-secondary leading-relaxed">
          {formatQuotePreview(quote.form, quote.products)}
        </pre>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <Button type="button" size="sm" onClick={() => onReuse(quote)}>
          Open in Request Quote
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => void handleCopy()}>
          {copied ? 'Copied' : 'Copy quote text'}
        </Button>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-sm text-brand-red bg-transparent border-none cursor-pointer hover:underline px-1"
        >
          {expanded ? 'Hide details' : 'View details'}
        </button>
        <button
          type="button"
          onClick={() => onDelete(quote.id)}
          className="text-sm text-text-muted bg-transparent border-none cursor-pointer hover:text-brand-red hover:underline px-1 ml-auto"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export function MyQuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);

  const refresh = useCallback(() => setQuotes(loadSavedQuotes()), []);

  useEffect(() => {
    refresh();
    window.addEventListener(SAVED_QUOTES_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(SAVED_QUOTES_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this saved quote? This cannot be undone.')) return;
    deleteSavedQuote(id);
    refresh();
  };

  const handleClearAll = () => {
    if (!window.confirm('Delete all saved quotes? This cannot be undone.')) return;
    clearSavedQuotes();
    refresh();
  };

  const handleReuse = (quote: SavedQuote) => {
    navigate('/request-quote', {
      state: {
        savedQuoteId: quote.id,
        form: quote.form,
        products: quote.products,
      },
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
          <h1 className="text-3xl font-extrabold m-0">My Quotes</h1>
          {quotes.length > 0 ? (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-sm text-text-muted bg-transparent border-none cursor-pointer hover:text-brand-red hover:underline p-0"
            >
              Clear all
            </button>
          ) : null}
        </div>
        <p className="text-sm text-text-muted m-0 mb-8 leading-relaxed">
          Quotes you save from the Request Quote page are kept here on this device so you can review,
          copy, or continue them later.
        </p>

        {quotes.length === 0 ? (
          <div className="border border-dashed border-border rounded-sm bg-surface p-10 text-center">
            <p className="text-base font-semibold m-0 mb-2">No saved quotes yet</p>
            <p className="text-sm text-text-muted m-0 mb-6 leading-relaxed">
              Build a quote from your cart, then choose <strong>Save quote</strong> to keep track of
              it here.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-sm no-underline bg-brand-red text-white hover:bg-brand-red-hover transition-colors"
              >
                Browse catalog
              </Link>
              <Link
                to="/cart"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-sm no-underline border border-border text-text hover:border-brand-red hover:text-brand-red transition-colors"
              >
                Go to cart
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                onDelete={handleDelete}
                onReuse={handleReuse}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
