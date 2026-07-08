import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useCatalog } from '../../context/CatalogContext';
import type { CategoryId } from '../../types';
import type { ProductSubCategoryId } from '../../types/productSubcategories';

interface AssistantAction {
  label: string;
  run: () => void;
}

interface AssistantMessage {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  actions?: AssistantAction[];
}

interface Intent {
  keywords: string[];
  respond: (nav: AssistantNav) => { text: string; actions?: AssistantAction[] };
}

interface AssistantNav {
  goToCategory: (categoryId: CategoryId | null, subCategoryId?: ProductSubCategoryId | null) => void;
  goTo: (path: string) => void;
  openExternal: (url: string) => void;
}

const SUPPORT_URL = 'https://www.equinix.com/contact-us/customer-support';

const intents: Intent[] = [
  {
    keywords: ['cabinet', 'rack', 'cabinets'],
    respond: (nav) => ({
      text: 'Cabinet Accessories cover racks, panels, cable management, and mounting hardware. You can also filter by manufacturer once the category is open.',
      actions: [
        { label: 'Browse Cabinet Accessories', run: () => nav.goToCategory('cabinet-accessories') },
      ],
    }),
  },
  {
    keywords: ['power', 'pdu', 'rpdu', 'updu', 'electrical', 'outlet'],
    respond: (nav) => ({
      text: 'Power Accessories include rack PDUs, floor/overhead PDUs, and input cables. Open the category to filter by PDU type.',
      actions: [
        { label: 'Browse Power Accessories', run: () => nav.goToCategory('power-accessories') },
      ],
    }),
  },
  {
    keywords: ['cross connect', 'cross-connect', 'patch', 'fiber cassette', 'copper module'],
    respond: (nav) => ({
      text: 'Cross Connect Accessories include patch panels, fiber cassettes, and copper modules.',
      actions: [
        {
          label: 'Browse Cross Connect Accessories',
          run: () => nav.goToCategory('cross-connect-accessories'),
        },
      ],
    }),
  },
  {
    keywords: ['cage', 'containment', 'tray', 'basket', 'structured cabling'],
    respond: (nav) => ({
      text: 'Cage Accessories cover cable trays, containment, and structured cabling.',
      actions: [
        { label: 'Browse Cage Accessories', run: () => nav.goToCategory('cage-accessories') },
      ],
    }),
  },
  {
    keywords: ['install', 'installation', 'labour', 'labor', 'smart build', 'deployment'],
    respond: (nav) => ({
      text: 'Installation Costs list Smart Build labour and deployment pricing by region and country.',
      actions: [
        { label: 'View Installation Costs', run: () => nav.goToCategory('installation-costs') },
      ],
    }),
  },
  {
    keywords: ['cart', 'basket', 'checkout'],
    respond: (nav) => ({
      text: 'Your cart holds the items you have added. Review quantities there before requesting a quote.',
      actions: [{ label: 'Open Cart', run: () => nav.goTo('/cart') }],
    }),
  },
  {
    keywords: ['saved quote', 'my quotes', 'past quote', 'previous quote', 'track quote', 'history'],
    respond: (nav) => ({
      text: 'The My Quotes page keeps the quotes you have saved on this device so you can review, copy, or continue them later.',
      actions: [{ label: 'Open My Quotes', run: () => nav.goTo('/my-quotes') }],
    }),
  },
  {
    keywords: ['quote', 'request quote', 'pricing request', 'rfq'],
    respond: (nav) => ({
      text: 'You request a quote from the cart. Add the products you need, open the cart, and choose Request Quote. You can also save quotes and find them later under My Quotes.',
      actions: [
        { label: 'Open Cart', run: () => nav.goTo('/cart') },
        { label: 'My Quotes', run: () => nav.goTo('/my-quotes') },
      ],
    }),
  },
  {
    keywords: ['price', 'prices', 'pricing', 'cost', 'currency', 'localize', 'localise'],
    respond: (nav) => ({
      text: 'Prices are localized to your selected location and currency. Change your location from the selector in the header, then browse the catalog.',
      actions: [{ label: 'Browse Catalog', run: () => nav.goToCategory(null) }],
    }),
  },
  {
    keywords: ['unit', 'units', 'mm', 'inch', 'inches', 'dimension', 'dimensions', 'size'],
    respond: (nav) => ({
      text: 'Use the Display Units selector in the filter sidebar to switch between inches and millimeters. Cabinet and product dimensions update everywhere.',
      actions: [{ label: 'Browse Catalog', run: () => nav.goToCategory(null) }],
    }),
  },
  {
    keywords: ['excel', 'spreadsheet', 'workbook', 'price list', 'data'],
    respond: (nav) => ({
      text: 'The Excel Data page lets you connect to or upload the Accessories Price List workbook.',
      actions: [{ label: 'Open Excel Data', run: () => nav.goTo('/excel') }],
    }),
  },
  {
    keywords: ['search', 'find', 'look for', 'where'],
    respond: () => ({
      text: 'Use the search bar at the top to find products by name, part number, or brand. You can also narrow results with the filters on the left.',
    }),
  },
  {
    keywords: ['support', 'contact', 'help', 'sales', 'talk to', 'representative', 'human'],
    respond: (nav) => ({
      text: 'You can reach the Equinix customer support team for volume pricing, availability, and custom quotes.',
      actions: [{ label: 'Contact Customer Support', run: () => nav.openExternal(SUPPORT_URL) }],
    }),
  },
  {
    keywords: ['home', 'start', 'landing', 'main page'],
    respond: (nav) => ({
      text: 'Here is the home page with an overview of the catalog and quick links.',
      actions: [{ label: 'Go Home', run: () => nav.goTo('/') }],
    }),
  },
];

function buildReply(input: string, nav: AssistantNav): { text: string; actions?: AssistantAction[] } {
  const text = input.toLowerCase();
  const match = intents.find((intent) => intent.keywords.some((kw) => text.includes(kw)));
  if (match) return match.respond(nav);

  return {
    text: "I can help you get around. Try asking about cabinet, power, cross connect, or cage accessories, installation costs, pricing, units, your cart, or requesting a quote.",
    actions: [
      { label: 'Browse Catalog', run: () => nav.goToCategory(null) },
      { label: 'Contact Support', run: () => nav.openExternal(SUPPORT_URL) },
    ],
  };
}

const QUICK_PROMPTS = [
  'Browse the catalog',
  'How do I request a quote?',
  'Show power accessories',
  'Switch units to inches',
];

let messageId = 0;
const nextId = () => (messageId += 1);

export function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>(() => [
    {
      id: nextId(),
      role: 'assistant',
      text: "Hi! I'm your site assistant. I can help you find products and navigate the quote generator. What are you looking for?",
    },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setCategory } = useCatalog();

  const nav: AssistantNav = {
    goToCategory: (categoryId, subCategoryId = null) => {
      setCategory(categoryId, subCategoryId);
      navigate('/products');
      setOpen(false);
    },
    goTo: (path) => {
      navigate(path);
      setOpen(false);
    },
    openExternal: (url) => {
      window.open(url, '_blank', 'noreferrer');
    },
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const send = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const reply = buildReply(trimmed, nav);
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text: trimmed },
      { id: nextId(), role: 'assistant', text: reply.text, actions: reply.actions },
    ]);
    setInput('');
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        aria-label="Virtual Assistant"
        title="Virtual Assistant"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={clsx(
          'w-9 h-9 flex items-center justify-center rounded-sm border-none bg-transparent text-white cursor-pointer transition-colors',
          open ? 'bg-white/15' : 'hover:bg-white/10',
        )}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <circle cx="9" cy="10" r="0.5" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-surface text-text border border-border rounded-md shadow-2xl z-50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-brand-red text-white">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <circle cx="9" cy="10" r="0.5" fill="currentColor" stroke="none" />
                <circle cx="15" cy="10" r="0.5" fill="currentColor" stroke="none" />
              </svg>
              <span className="text-sm font-bold">Site Assistant</span>
            </div>
            <button
              type="button"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-sm border-none bg-transparent text-white cursor-pointer hover:bg-white/20 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="max-h-[360px] overflow-y-auto px-4 py-3 space-y-3 bg-surface">
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={clsx(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'bg-brand-red text-white rounded-br-sm'
                      : 'bg-surface-muted text-text rounded-bl-sm',
                  )}
                >
                  <p className="m-0">{message.text}</p>
                  {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.actions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          onClick={action.run}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-sm border border-brand-red text-brand-red bg-transparent cursor-pointer hover:bg-brand-red hover:text-white transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-surface-muted text-text-secondary cursor-pointer hover:border-brand-red hover:text-brand-red transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3 bg-surface"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about products, pricing, quotes..."
              className="flex-1 h-9 px-3 rounded-sm border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/40"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="w-9 h-9 flex items-center justify-center rounded-sm border-none bg-brand-red text-white cursor-pointer hover:bg-brand-red-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
