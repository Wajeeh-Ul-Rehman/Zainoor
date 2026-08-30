import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export default function CartDrawer() {
  const { isCartOpen, setCartOpen, items, removeItem, updateQuantity, subtotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setCartOpen(false);
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white z-50 shadow-[-4px_0_24px_rgba(0,0,0,0.1)] transform transition-transform duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EFEFEF]">
          <h2 className="font-body font-semibold text-lg">Your Cart</h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:opacity-60 transition-opacity"
            aria-label="Close cart"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C1C1C1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="font-body text-[#424242] text-sm">Your cart is empty</p>
              <p className="font-body text-[#C1C1C1] text-xs mt-1">Add items to get started</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-[100px] flex-shrink-0 bg-[#EFEFEF] overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-body font-medium text-sm truncate">{item.product.name}</h3>
                    <p className="font-body text-xs text-[#424242] mt-0.5">
                      {item.color} / {item.size}
                    </p>
                    <p className="font-body font-semibold text-sm mt-1">
                      Rs. {(item.product.salePrice || item.product.price).toLocaleString()}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                        className="w-7 h-7 border border-[#EFEFEF] flex items-center justify-center font-body text-sm hover:border-black transition-colors"
                      >
                        -
                      </button>
                      <span className="w-9 h-7 border border-[#EFEFEF] flex items-center justify-center font-body text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                        className="w-7 h-7 border border-[#EFEFEF] flex items-center justify-center font-body text-sm hover:border-black transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id, item.size, item.color)}
                        className="ml-auto font-body text-xs text-[#C1C1C1] hover:text-[#FF0000] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#EFEFEF] p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-body font-medium">Subtotal</span>
              <span className="font-body font-semibold">Rs. {subtotal().toLocaleString()}</span>
            </div>
            <p className="font-body text-xs text-[#424242] mb-4">Shipping calculated at checkout</p>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#FF0000] text-white font-body font-semibold text-sm uppercase py-4 hover:bg-[#CC0000] transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
