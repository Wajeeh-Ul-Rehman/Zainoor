import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'About', path: '/about' },
  { label: 'FAQs', path: '/faqs' },
  { label: 'Contact', path: '/contact' },
  { label: 'Affiliate', path: '/affiliate' },
];

export default function MobileNav() {
  const { isMobileNavOpen, setMobileNavOpen, openAuthModal } = useUIStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();

  const handleLinkClick = () => {
    setMobileNavOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-400 lg:hidden ${
          isMobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-sm bg-black z-50 transform transition-transform duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] lg:hidden ${
          isMobileNavOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-8">
          {/* Close */}
          <button
            onClick={() => setMobileNavOpen(false)}
            className="self-end text-white p-2"
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Links */}
          <div className="flex flex-col gap-6 mt-12">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleLinkClick}
                className={`font-body text-4xl text-white leading-[0.85] tracking-[-0.02em] transition-opacity ${
                  location.pathname === link.path ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="mt-auto">
            {isAuthenticated ? (
              <div className="flex flex-col gap-4">
                <Link
                  to={user?.isAdmin ? '/admin' : '/dashboard'}
                  onClick={handleLinkClick}
                  className="font-body text-white text-sm uppercase tracking-[0.05em]"
                >
                  {user?.isAdmin ? 'Admin Dashboard' : 'My Account'}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    handleLinkClick();
                  }}
                  className="font-body text-white/60 text-sm uppercase tracking-[0.05em] text-left"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  openAuthModal('login');
                }}
                className="font-body text-white text-sm uppercase tracking-[0.05em]"
              >
                Log In / Sign Up
              </button>
            )}

            {/* Social */}
            <div className="flex gap-4 mt-8">
              <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
