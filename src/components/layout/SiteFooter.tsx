import { Link } from 'react-router-dom';

interface FooterLink {
  label: string;
  href: string;
}

const footerColumns: Record<string, FooterLink[]> = {
  Account: [
    { label: 'Sign In', href: '/account?mode=signin' },
    { label: 'Create Account', href: '/account?mode=create' },
    { label: 'My Quotes', href: '/my-quotes' },
  ],
  Offerings: [
    { label: 'Cabinet Accessories', href: '#' },
    { label: 'Power Accessories', href: '#' },
    { label: 'Cross Connect', href: '#' },
    { label: 'Installation', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: 'https://www.equinix.com/about' },
    { label: 'Careers', href: 'https://www.equinix.com/about/careers' },
    { label: 'Newsroom', href: 'https://www.equinix.com/about/newsroom' },
    { label: 'Investors', href: 'https://www.equinix.com/about/investor-relations' },
  ],
};

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <div className="bg-gray-900 text-white">
        <div className="max-w-[1440px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-3 gap-8">
          {Object.entries(footerColumns).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold text-sm mb-4 uppercase tracking-wide">{title}</h3>
              <ul className="space-y-2.5 list-none m-0 p-0">
                {links.map((link) => {
                  const isExternal = link.href.startsWith('http');
                  const isInternal = link.href.startsWith('/');
                  const linkClass =
                    'text-gray-400 text-sm no-underline hover:text-white hover:underline';
                  return (
                    <li key={link.label}>
                      {isInternal ? (
                        <Link to={link.href} className={linkClass}>
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noreferrer' : undefined}
                          className={linkClass}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black text-gray-500 text-xs">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex flex-wrap gap-x-6 gap-y-2">
          <span>&copy; 2026 Equinix, Inc. All rights reserved.</span>
          <a href="#" className="text-gray-500 no-underline hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-500 no-underline hover:underline">
            Terms of Sale
          </a>
          <a href="#" className="text-gray-500 no-underline hover:underline">
            Do Not Sell My Personal Information
          </a>
          <a href="#" className="text-gray-500 no-underline hover:underline">
            Accessibility
          </a>
        </div>
      </div>
    </footer>
  );
}
