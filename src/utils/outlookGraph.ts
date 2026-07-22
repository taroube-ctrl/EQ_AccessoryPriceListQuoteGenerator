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

  const toRecipients = [
    {
      emailAddress: {
        address: QUOTE_EMAIL_TO,
        name: 'TCOM Support',
      },
    },
  ];
  const ccRecipients = [
    {
      emailAddress: {
        address: QUOTE_EMAIL_CC,
      },
    },
  ];

  const draft = (await client.api('/me/mailFolders/drafts/messages').post({
    subject,
    body: {
      contentType: 'Text',
      content: body,
    },
    toRecipients,
    ccRecipients,
  })) as GraphDraftMessage;

  if (!draft.id) {
    throw new Error('Outlook draft was created but no message id was returned.');
  }

  // Re-apply recipients so To is never left blank if the create response omitted them.
  await client.api(`/me/messages/${draft.id}`).patch({
    toRecipients,
    ccRecipients,
  });

  const updated = (await client
    .api(`/me/messages/${draft.id}`)
    .select('id,webLink')
    .get()) as GraphDraftMessage;

  if (updated.webLink) return updated.webLink;
  return `https://outlook.office.com/mail/deeplink/read/${encodeURIComponent(draft.id)}`;
}
