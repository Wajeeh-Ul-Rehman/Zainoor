import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'About', path: '/about' },
  { label: 'FAQs', path: '/faqs' },
  { label: 'Contact', path: '/contact' },
  { label: 'Affiliate', path: '/affiliate' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use `user` directly instead of `isAuthenticated`
  const { user, logout } = useAuthStore();
  const { toggleCart, totalItems } = useCartStore();
  const { toggleMobileNav, openAuthModal } = useUIStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const showTransparent = isHome && !scrolled;

  const handleLogout = () => {
    logout();
    // navigate('/login');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        showTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-[#EFEFEF]'
      }`}
    >
      <div className="container-main">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            className={`font-body font-medium text-lg lg:text-xl uppercase tracking-[0.1em] transition-colors ${
              showTransparent ? 'text-white' : 'text-black'
            }`}
          >
            ZaiNoor
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-sm uppercase tracking-[0.05em] relative group transition-colors ${
                  showTransparent ? 'text-white' : 'text-black'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 w-0 h-[1px] group-hover:w-full transition-all duration-300 ${
                    showTransparent ? 'bg-white' : 'bg-black'
                  }`}
                />
                {location.pathname === link.path && (
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-[1px] ${
                      showTransparent ? 'bg-white' : 'bg-black'
                    }`}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <button
              onClick={toggleCart}
              className={`relative p-2 transition-colors ${
                showTransparent ? 'text-white' : 'text-black'
              }`}
              aria-label="Cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {totalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF0000] text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </button>

            {/* Auth - Checked via user object presence */}
            {user ? (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  to={user.isAdmin ? '/admin' : '/dashboard'}
                  className={`font-body text-sm transition-colors ${
                    showTransparent ? 'text-white' : 'text-black'
                  } hover:opacity-70`}
                >
                  {user.isAdmin ? 'Admin Dashboard' : 'My Account'}
                </Link>
                <button
                  onClick={handleLogout}
                  
                  className={`font-body text-sm transition-colors ${
                    showTransparent ? 'text-white' : 'text-black'
                  } hover:opacity-70`}
                  
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className={`hidden lg:block font-body text-sm uppercase tracking-[0.05em] transition-colors ${
                  showTransparent ? 'text-white' : 'text-black'
                } hover:opacity-70`}
              >
                Log In
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileNav}
              className={`lg:hidden p-2 transition-colors ${
                showTransparent ? 'text-white' : 'text-black'
              }`}
              aria-label="Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}