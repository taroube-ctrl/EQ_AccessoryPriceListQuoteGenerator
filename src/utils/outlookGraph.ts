import type { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { mailRequest } from '../authConfig';
import type { QuoteFormState, QuoteProductLine } from '../types/requestQuote';
import {
  buildQuoteEmailSubject,
  formatQuotePreview,
  QUOTE_EMAIL_CC,
  QUOTE_EMAIL_TO,
  type QuotePreviewOptions,
} from './requestQuote';

function createMailGraphClient(
  msalInstance: IPublicClientApplication,
  account: AccountInfo,
): Client {
  return Client.init({
    authProvider: async (done) => {
      try {
        const response = await msalInstance.acquireTokenSilent({
          ...mailRequest,
          account,
        });
        done(null, response.accessToken);
      } catch {
        const response = await msalInstance.acquireTokenPopup({
          ...mailRequest,
          account,
        });
        done(null, response.accessToken);
      }
    },
  });
}

interface GraphDraftMessage {
  id?: string;
  webLink?: string;
}

/**
 * Creates a draft in the signed-in user's Microsoft Outlook mailbox with
 * To: TCOMsupport@equinix.com and Cc: bblaski@equinix.com, plus subject/body.
 * Returns an Outlook on the web link to open the draft.
 */
export async function createOutlookQuoteDraft(
  msalInstance: IPublicClientApplication,
  account: AccountInfo,
  form: QuoteFormState,
  products: QuoteProductLine[],
  options: QuotePreviewOptions = {},
): Promise<string> {
  const client = createMailGraphClient(msalInstance, account);
  const subject = buildQuoteEmailSubject(form);
  const body = formatQuotePreview(form, products, options);

  const draft = (await client.api('/me/messages').post({
    subject,
    body: {
      contentType: 'Text',
      content: body,
    },
    toRecipients: [
      {
        emailAddress: {
          address: QUOTE_EMAIL_TO,
        },
      },
    ],
    ccRecipients: [
      {
        emailAddress: {
          address: QUOTE_EMAIL_CC,
        },
      },
    ],
    isDraft: true,
  })) as GraphDraftMessage;

  if (draft.webLink) return draft.webLink;
  if (draft.id) {
    // Fallback deep link into the draft item in Outlook on the web.
    return `https://outlook.office.com/mail/deeplink/read/${encodeURIComponent(draft.id)}`;
  }

  throw new Error('Outlook draft was created but no open link was returned.');
}
