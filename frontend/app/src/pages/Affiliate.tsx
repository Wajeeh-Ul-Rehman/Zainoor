import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore'; // <-- Import your real auth store
import { API_URL } from '../../config'; // <-- Adjust path if your config is elsewhere
// import { useAuthStore } from '@/stores/authStore'; // Import your auth store/context

const steps = [
  { num: '1', title: 'Register', desc: 'Fill out the application form with your details.' },
  { num: '2', title: 'Get Your Link', desc: 'Receive a unique referral link upon approval.' },
  { num: '3', title: 'Share & Promote', desc: 'Share your link on social media, blogs, etc.' },
  { num: '4', title: 'Earn Commission', desc: 'Earn 10% on every successful sale.' },
];

const rules = [
  'Commissions are 10% of the product sale price (excluding shipping).',
  'Payouts are made monthly or on your request once your balance reaches Rs. 2,000.',
  'Self-referrals are strictly prohibited; accounts found violating will be terminated.',
  'Affiliate codes must not be used on coupon/deal sites without prior approval.',
  'No spam, misleading advertising, or false claims.',
  'ZaiNoor reserves the right to reject commissions on orders that are canceled, returned, or found fraudulent.',
  'Payouts via JazzCash, EasyPaisa, or any bank transfer.',
  'Affiliates must share their bank account details (Account holder name, Account number, bank name).',
  'Bank should be registered in Pakistan.',
];

export default function Affiliate() {
  const { addToast } = useUIStore();
  
  // Get real user state
  const { user } = useAuthStore(); 
  const isLoggedIn = !!user;
  const userEmail = user?.email || ''; 

  const [form, setForm] = useState({
    fullName: '',
    email: userEmail,
    phone: '',
    cnic: '',
    socialHandle: '',
    bankHolderName: '',
    bankAccountNumber: '',
    bankName: '',
    reason: '',
  });

  const [loading, setLoading] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  useEffect(() => {
    if (userEmail) {
      setForm((prev) => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      addToast('Please log in first.', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        userId: user.id,
      };

      const response = await fetch(`${API_URL}/api/affiliate/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Prevent frontend crash if the backend crashed and sent an HTML error page
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response. Please check if the Node.js backend is running.');
      }

      const data = await response.json();

      if (response.ok || data.success) {
        setAffiliateCode(data.affiliateCode);
        addToast(
          data.message || `Successfully verified! Here is your 6 digit affiliate code: ${data.affiliateCode}`,
          'success'
        );
      } else {
        // Now it will reliably display the exact message sent from the backend
        addToast(data.message || 'Submission failed. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Affiliate Apply Error:', error);
      addToast(error.message || 'Network error. Could not submit application.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* Hero */}
      <section className="bg-black pt-32 lg:pt-40 pb-12 lg:pb-16 text-center">
        <div className="container-main">
          <h1 className="font-display text-white text-3xl lg:text-5xl max-w-[700px] mx-auto leading-[1.1]">
            Join the ZaiNoor Affiliate Program
          </h1>
          <div className="inline-block border-2 border-[#FF0000] text-[#FF0000] font-body font-semibold text-xs uppercase tracking-wider px-6 py-2 mt-6">
            Earn 10% Commission
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20 lg:py-[120px]">
        <div className="container-main">
          <h2 className="font-display text-3xl lg:text-5xl text-center mb-12 lg:mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1200px] mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] border-t-2 border-dashed border-[#EFEFEF]" />
                )}
                <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mx-auto font-body font-semibold text-lg">
                  {step.num}
                </div>
                <h3 className="font-body font-semibold text-base mt-4">{step.title}</h3>
                <p className="font-body font-light text-sm text-[#424242] mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="bg-[#EFEFEF] py-20 lg:py-[120px]">
        <div className="container-main">
          <h2 className="font-display text-3xl lg:text-5xl text-center mb-10 lg:mb-12">
            Rules & Regulations
          </h2>
          <div className="max-w-[800px] mx-auto space-y-0">
            {rules.map((rule, i) => (
              <div key={i} className="flex gap-4 py-5 border-b border-[#C1C1C1]">
                <span className="font-body font-bold text-lg text-[#FF0000] flex-shrink-0 w-6">
                  {i + 1}
                </span>
                <p className="font-body font-light text-[#424242] leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form / Auth Check */}
      <section className="bg-white py-20 lg:py-[120px]">
        <div className="container-main">
          <div className="max-w-[600px] mx-auto">
            {!isLoggedIn ? (
              <div className="text-center py-10 border-2 border-dashed border-[#C1C1C1] rounded-lg">
                <h2 className="font-display text-2xl mb-4">Account Required</h2>
                <p className="font-body text-[#424242] mb-6">
                  You must be logged in to apply for the ZaiNoor Affiliate Program.
                </p>
                <button className="bg-black text-white font-body font-semibold text-sm uppercase px-8 py-4 hover:bg-gray-800 transition-colors">
                  Log In or Register
                </button>
              </div>
            ) : affiliateCode ? (
              <div className="text-center py-12 border-2 border-green-500 rounded-lg bg-green-50">
                <h2 className="font-display text-2xl text-green-700 mb-4">Application Successful!</h2>
                <p className="font-body text-[#424242] mb-6">
                  Successfully verified! now you are eligible for our affiliate program here is your 6 digit affiliate code:
                </p>
                <div className="inline-block bg-white border-2 border-green-600 text-green-700 font-bold text-3xl tracking-widest px-8 py-4 rounded">
                  {affiliateCode}
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display text-3xl text-center mb-8">Apply Now</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                      Email (Associated with your account)
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none transition-colors bg-transparent text-black opacity-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                      CNIC Number
                    </label>
                    <input
                      type="text"
                      required
                      value={form.cnic}
                      onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                      className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                      placeholder="XXXXX-XXXXXXX-X"
                    />
                  </div>

                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                      Bank Name (Registered in Pakistan)
                    </label>
                    <input
                      type="text"
                      required
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                      placeholder="e.g. HBL, Meezan Bank, JazzCash"
                    />
                  </div>

                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.bankHolderName}
                      onChange={(e) => setForm({ ...form, bankHolderName: e.target.value })}
                      className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                      placeholder="Name on account"
                    />
                  </div>

                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                      Account Number / IBAN
                    </label>
                    <input
                      type="text"
                      required
                      value={form.bankAccountNumber}
                      onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                      className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                      placeholder="PK00XXXX00000000000000"
                    />
                  </div>

                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                      Social Media Handle (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.socialHandle}
                      onChange={(e) => setForm({ ...form, socialHandle: e.target.value })}
                      className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                      Why do you want to join?
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent resize-none"
                      placeholder="Tell us about your goals..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF0000] text-white font-body font-semibold text-sm uppercase py-4 hover:bg-[#CC0000] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Apply Now'}
                  </button>
                  <p className="font-body font-light text-xs text-[#424242] text-center">
                    By submitting, you agree to our affiliate terms and conditions.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}