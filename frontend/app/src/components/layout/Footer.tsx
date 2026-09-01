import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop Collection', path: '/products' },
  { label: 'About Us', path: '/about' },
  { label: 'Affiliate Program', path: '/affiliate' },
];

const customerCare = [
  { label: 'FAQs', path: '/faqs' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Privacy & Terms', path: '/privacy-terms' },
  { label: 'My Dashboard', path: '/dashboard' },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-neutral-900">
      <div className="container-main px-6 md:px-10 py-16 lg:py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Column 1: Brand & Socials */}
          <div className="lg:pr-8">
            <h3 className="font-display text-2xl tracking-[0.15em] uppercase mb-1">
              ZAINOOR
            </h3>
            <p className="font-body font-light text-[10px] uppercase tracking-[0.2em] text-[#C1C1C1] mb-6">
              Premium Women Fashion
            </p>
            <p className="font-body font-light text-sm text-[#C1C1C1] leading-relaxed mb-8">
              Redefining style through the timeless elegance of every fashion. Crafted in Pakistan, loved nationwide.
            </p>
            
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/zainoorpk" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-[#424242] flex items-center justify-center text-[#C1C1C1] hover:bg-white hover:text-black hover:border-white transition-all duration-300" 
                aria-label="Instagram"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-[#424242] flex items-center justify-center text-[#C1C1C1] hover:bg-white hover:text-black hover:border-white transition-all duration-300" 
                aria-label="Facebook"
              >
                <Facebook size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-[0.1em] mb-6">
              Explore
            </h4>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-body text-sm text-[#C1C1C1] hover:text-white hover:pl-1 transition-all duration-300 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-[0.1em] mb-6">
              Customer Care
            </h4>
            <ul className="flex flex-col gap-3">
              {customerCare.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-body text-sm text-[#C1C1C1] hover:text-white hover:pl-1 transition-all duration-300 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-[0.1em] mb-6">
              Get in Touch
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-[#C1C1C1]">
                <MapPin size={18} className="shrink-0 mt-0.5 text-white" />
                <span className="font-body text-sm leading-relaxed">
                  Lahore, Pakistan
                </span>
              </li>
              <li className="flex items-center gap-3 text-[#C1C1C1]">
                <Phone size={18} className="shrink-0 text-white" />
                <span className="font-body text-sm">+92 337 6831521</span>
              </li>
              <li className="flex items-center gap-3 text-[#C1C1C1]">
                <Mail size={18} className="shrink-0 text-white" />
                <span className="font-body text-sm">support@zainoor.com.pk</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#222222] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body font-light text-xs text-[#888888]">
            &copy; {new Date().getFullYear()} Zainoor. All rights reserved.
          </p> 
          <div className="flex items-center gap-4 text-[#888888] font-body text-xs">
             <span>100% Cash on Delivery</span>
             <span className="w-1 h-1 bg-[#424242] rounded-full"></span>
             <span>Nationwide Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}