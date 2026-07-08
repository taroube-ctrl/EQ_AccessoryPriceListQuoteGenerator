import { useCallback, useEffect, useState } from 'react';
import { useBlocker, useBeforeUnload } from 'react-router-dom';
import type { QuoteFormState, QuoteProductLine } from '../types/requestQuote';

export const UNSAVED_QUOTE_MESSAGE =
  'Leave without saving? Your progress will be lost.';

function serializeQuoteState(form: QuoteFormState, products: QuoteProductLine[]): string {
  return JSON.stringify({ form, products });
}

export interface QuoteDirtyState {
  isDirty: boolean;
  /** Resets the baseline to the current form/products, marking them as saved. */
  markPristine: () => void;
}

export function useQuoteDirtyState(
  form: QuoteFormState,
  products: QuoteProductLine[],
): QuoteDirtyState {
  const [baseline, setBaseline] = useState(() => serializeQuoteState(form, products));

  const isDirty = serializeQuoteState(form, products) !== baseline;

  const markPristine = useCallback(() => {
    setBaseline(serializeQuoteState(form, products));
  }, [form, products]);

  return { isDirty, markPristine };
}

export function useUnsavedChangesWarning(isDirty: boolean, message = UNSAVED_QUOTE_MESSAGE) {
  useBeforeUnload(
    (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = message;
    },
    { capture: true },
  );

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;

    const shouldLeave = window.confirm(message);
    if (shouldLeave) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker, message]);
}
