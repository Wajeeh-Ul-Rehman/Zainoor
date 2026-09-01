import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
];

type Step = 'information' | 'payment';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('information');
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: user?.fullName || '',
    address: '',
    city: '',
    province: 'Punjab',
    phone: user?.phone || '',
  });

  const handleInfoSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      // Combine form fields into the required shippingAddress string format
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.province} (Phone: ${formData.phone}, Name: ${formData.fullName}, Email: ${formData.email})`;

      // Map cart items to match backend controller expectations (including productId and qty)
      const payloadItems = items.map((item) => ({
        productId: item.product.id,
        name: item.product.name || (item.product as any).title,
        price: item.product.salePrice || item.product.price,
        qty: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const res = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          shippingAddress: fullAddress,
          totalAmount: total,
          items: payloadItems,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        addToast('Order placed successfully!', 'success');
        navigate('/dashboard'); // Adjusted to match your user dashboard route
      } else {
        addToast(data.message || 'Checkout failed', 'error');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      addToast('Server connection failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const shipping = 300;
  const total = subtotal() + shipping;

  if (items.length === 0) {
    return (
      <main className="pt-24 lg:pt-32 pb-20">
        <div className="container-main text-center">
          <h1 className="font-display text-3xl">Your cart is empty</h1>
          <p className="font-body text-[#424242] mt-2">Add items to proceed to checkout.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 lg:pt-24 pb-20">
      {/* Progress */}
      <div className="container-main mb-8">
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step === 'information' || step === 'payment' ? 'text-black' : 'text-[#C1C1C1]'}`}>
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-body text-sm">1</span>
            <span className="font-body text-sm hidden sm:inline">Information</span>
          </div>
          <div className="w-12 h-[1px] bg-[#EFEFEF]" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-black' : 'text-[#C1C1C1]'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-body text-sm ${step === 'payment' ? 'bg-black text-white' : 'bg-[#EFEFEF] text-[#C1C1C1]'}`}>2</span>
            <span className="font-body text-sm hidden sm:inline">Payment</span>
          </div>
        </div>
      </div>

      <div className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-3">
            {step === 'information' ? (
              <form onSubmit={handleInfoSubmit} className="space-y-6">
                <h2 className="font-display text-2xl">Contact Information</h2>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                  />
                </div>

                <h2 className="font-display text-2xl pt-6">Shipping Address</h2>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                  />
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">Province</label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                    >
                      <option>Punjab</option>
                      <option>Sindh</option>
                      <option>KPK</option>
                      <option>Balochistan</option>
                      <option>Islamabad</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white font-body font-medium text-sm uppercase py-4 hover:bg-[#424242] transition-colors"
                >
                  Continue to Payment
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl">Payment Method</h2>
                  <button
                    onClick={() => setStep('information')}
                    className="font-body text-sm text-[#424242] hover:text-black transition-colors"
                  >
                    Back
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full flex items-center gap-4 p-4 border transition-colors text-left ${
                        selectedPayment === method.id ? 'border-black' : 'border-[#EFEFEF] hover:border-[#C1C1C1]'
                      }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-body text-sm">{method.name}</span>
                      {selectedPayment === method.id && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-black">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full bg-[#FF0000] text-white font-body font-semibold text-sm uppercase py-4 hover:bg-[#CC0000] transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : `Place Order — Rs. ${total.toLocaleString()}`}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#EFEFEF] p-6 lg:p-8 lg:sticky lg:top-28">
              <h3 className="font-body font-semibold text-lg mb-6">Order Summary</h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 pb-4 border-b border-[#C1C1C1]">
                    <div className="w-16 h-20 bg-white flex-shrink-0 overflow-hidden">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body font-medium text-sm truncate">{item.product.name}</h4>
                      <p className="font-body text-xs text-[#424242]">{item.color} / {item.size} / Qty: {item.quantity}</p>
                      <p className="font-body text-sm mt-1">
                        Rs. {((item.product.salePrice || item.product.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between font-body text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `Rs. ${shipping.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-body font-semibold text-lg pt-4 border-t border-black">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}