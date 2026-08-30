import { useState } from 'react';
import type { FormEvent } from 'react';
import { useUIStore } from '@/stores/uiStore';

const steps = [
  { num: '1', title: 'Register', desc: 'Fill out the application form with your details.' },
  { num: '2', title: 'Get Your Link', desc: 'Receive a unique referral link upon approval.' },
  { num: '3', title: 'Share & Promote', desc: 'Share your link on social media, blogs, etc.' },
  { num: '4', title: 'Earn Commission', desc: 'Earn 20% on every successful sale.' },
];

const rules = [
  'Commissions are 20% of the product sale price (excluding shipping).',
  'Payouts are made monthly once your balance reaches Rs. 2,000.',
  'Self-referrals are strictly prohibited; accounts found violating will be terminated.',
  'Affiliate links must not be used on coupon/deal sites without prior approval.',
  'No spam, misleading advertising, or false claims.',
  'ZaiNoor reserves the right to reject commissions on orders that are canceled, returned, or found fraudulent.',
  'Payouts via JazzCash, EasyPaisa, or bank transfer.',
  'Affiliates must be 18+ with a valid Pakistani CNIC.',
];

export default function Affiliate() {
  const { addToast } = useUIStore();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    socialHandle: '',
    reason: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addToast('Application submitted! We will review within 2-3 business days.', 'success');
    setForm({ fullName: '', email: '', phone: '', cnic: '', socialHandle: '', reason: '' });
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
            Earn 20% Commission
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
                {/* Connector line */}
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

      {/* Registration Form */}
      <section className="bg-white py-20 lg:py-[120px]">
        <div className="container-main">
          <div className="max-w-[600px] mx-auto">
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
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                  placeholder="your@email.com"
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
                className="w-full bg-[#FF0000] text-white font-body font-semibold text-sm uppercase py-4 hover:bg-[#CC0000] transition-colors"
              >
                Apply Now
              </button>
              <p className="font-body font-light text-xs text-[#424242] text-center">
                Our team will review your application within 2-3 business days.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
