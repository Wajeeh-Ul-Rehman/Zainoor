import { API_URL } from '../../config';
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
  const { items, subtotal, clearCart } = useCartStore() as any;
  const { addToast } = useUIStore();
  const { user } = useAuthStore() as any;
  const [step, setStep] = useState<Step>('information');
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  // Affiliate Code State
  const [affiliateCodeInput, setAffiliateCodeInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [codeStatus, setCodeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: user?.fullName || user?.name || '',
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

  const handleApplyCode = async () => {
    if (!affiliateCodeInput.trim()) return;
    setIsValidatingCode(true);
    setCodeStatus(null);
    try {
      const res = await fetch(`${API_URL}/api/affiliate/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: affiliateCodeInput.trim() }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setAppliedCode(data.code);
        setCodeStatus({ type: 'success', message: 'Valid code applied! 10% commission linked.' });
      } else {
        setAppliedCode(null);
        setCodeStatus({ type: 'error', message: data.message || 'Invalid or inactive affiliate code.' });
      }
    } catch (err) {
      setCodeStatus({ type: 'error', message: 'Network error validating code.' });
    } finally {
      setIsValidatingCode(false);
    }
  };

  const shipping = 300;
  const currentSubtotal = typeof subtotal === 'function' ? subtotal() : (subtotal || 0);
  const total = currentSubtotal + shipping;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.province} (Phone: ${formData.phone}, Name: ${formData.fullName}, Email: ${formData.email})`;

      const payloadItems = items.map((item: any) => ({
        productId: item.product?.id || item.productId,
        name: item.product?.title || item.product?.name || item.name,
        price: item.product?.sale?.active && item.product?.sale?.price ? item.product.sale.price : (item.product?.price || item.price),
        qty: item.quantity || item.qty || 1,
        size: item.size || '',
        color: item.color || '',
      }));

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          shippingAddress: fullAddress,
          totalAmount: total,
          items: payloadItems,
          affiliateCode: appliedCode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        addToast('Order placed successfully!', 'success');
        navigate('/dashboard');
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

  if (!items || items.length === 0) {
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
                    type="button"
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
                      type="button"
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
                  type="button"
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
                {items.map((item: any, idx: number) => {
                  const product = item.product || {};
                  const title = product.title || product.name || item.name || 'Product';
                  const image = product.images?.[0] || product.image || '/placeholder.jpg';
                  const itemPrice = product.sale?.active && product.sale?.price ? product.sale.price : (product.price || item.price || 0);
                  const qty = item.quantity || item.qty || 1;

                  return (
                    <div key={`${product.id || idx}-${item.size}-${item.color}`} className="flex gap-4 pb-4 border-b border-[#C1C1C1]">
                      <div className="w-16 h-20 bg-white flex-shrink-0 overflow-hidden">
                        <img src={image} alt={title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body font-medium text-sm truncate">{title}</h4>
                        <p className="font-body text-xs text-[#424242]">{item.color || 'Standard'} / {item.size || 'Standard'} / Qty: {qty}</p>
                        <p className="font-body text-sm mt-1">
                          Rs. {(itemPrice * qty).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Affiliate Code Section */}
              <div className="mt-6 border-b border-[#C1C1C1] pb-6">
                <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-2 block">Affiliate Code (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={!!appliedCode || isValidatingCode}
                    value={appliedCode || affiliateCodeInput}
                    onChange={(e) => setAffiliateCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 border border-[#C1C1C1] px-3 py-2 font-body text-sm focus:outline-none focus:border-black disabled:bg-neutral-200"
                  />
                  {!appliedCode ? (
                    <button 
                      type="button"
                      onClick={handleApplyCode}
                      disabled={isValidatingCode || !affiliateCodeInput}
                      className="bg-black text-white font-body text-xs uppercase px-4 py-2 hover:bg-[#424242] disabled:opacity-50 transition-colors"
                    >
                      {isValidatingCode ? '...' : 'Apply'}
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => { setAppliedCode(null); setCodeStatus(null); setAffiliateCodeInput(''); }}
                      className="bg-[#EFEFEF] border border-[#C1C1C1] text-[#424242] font-body text-xs uppercase px-4 py-2 hover:bg-[#C1C1C1] transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {codeStatus && (
                  <p className={`font-body text-xs mt-2 ${codeStatus.type === 'success' ? 'text-green-700 font-medium' : 'text-rose-600'}`}>
                    {codeStatus.message}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between font-body text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {currentSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span>Shipping</span>
                  <span>{(shipping as number) === 0 ? 'Free' : `Rs. ${shipping.toLocaleString()}`}</span>
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