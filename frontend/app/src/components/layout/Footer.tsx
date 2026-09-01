import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'About Us', path: '/about' },
  { label: 'FAQs', path: '/faqs' },
  { label: 'Contact', path: '/contact' },
  { label: 'Affiliate', path: '/affiliate' },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container-main py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-body font-medium text-lg uppercase tracking-[0.15em]">
              ZAI NOOR
            </h3>
            <p className="font-body font-light text-xs text-[#C1C1C1] mt-3">
              Premium Women Fashion
            </p>
            <p className="font-body font-light text-sm text-[#C1C1C1] mt-6 leading-relaxed">
              Redefining style through the timeless elegance of every fashion. Crafted in Pakistan, loved nationwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body font-medium text-sm uppercase tracking-[0.05em] mb-6">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-body text-sm text-[#C1C1C1] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

            {/* Social */}
            <div className="flex gap-4 mt-8">
              <a href="https://www.instagram.com/zainoorpk?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==" className="text-white hover:text-[#FF0000] transition-colors" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[#FF0000] transition-colors" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-[#424242] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body font-light text-xs text-[#C1C1C1]">
            &copy; 2026 ZaiNoor. All rights reserved.
          </p>       
        </div>
      
    </footer>
  );
}
