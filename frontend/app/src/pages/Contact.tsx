import { useState } from 'react';
import type { FormEvent } from 'react';
import { useUIStore } from '@/stores/uiStore';

export default function Contact() {
  const { addToast } = useUIStore();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Order Inquiry',
    message: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5001/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Message sent successfully! We will get back to you soon.', 'success');
        setFormData({ name: '', email: '', subject: 'Order Inquiry', message: '' });
      } else {
        addToast(data.message || 'Could not send message.', 'error');
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      label: 'Phone',
      value: '+92 337 6831521',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
      ),
    },
    {
      label: 'Email',
      value: 'support@zainoor.com.pk',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      label: 'Address',
      value: 'Lahore,Islamic Republic Of Pakistan',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
  ];

  return (
    <main>
      <section className="bg-black pt-32 lg:pt-40 pb-12 lg:pb-16">
        <div className="container-main">
          <h1 className="font-display text-white text-4xl lg:text-6xl xl:text-[120px] leading-[0.8]">
            Get in Touch
          </h1>
          <p className="font-body font-light text-[#C1C1C1] mt-4 max-w-[600px]">
            We&apos;d love to hear from you. Reach out for orders, support, or partnerships.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {contactInfo.map((info) => (
                  <div key={info.label}>
                    <span className="font-body text-xs uppercase tracking-wider text-[#424242]">
                      {info.label}
                    </span>
                    <div className="flex items-center gap-3 mt-2">
                      {info.icon}
                      <span className="font-body text-base">{info.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <a href="https://www.instagram.com/zainoorpk?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==" className="text-black hover:text-[#FF0000] transition-colors" aria-label="Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a href="#" className="text-black hover:text-[#FF0000] transition-colors" aria-label="Facebook">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-b border-[#C1C1C1] py-3 font-body text-base outline-none focus:border-black transition-colors bg-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border-b border-[#C1C1C1] py-3 font-body text-base outline-none focus:border-black transition-colors bg-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border-b border-[#C1C1C1] py-3 font-body text-base outline-none focus:border-black transition-colors bg-transparent"
                  >
                    <option>Order Inquiry</option>
                    <option>General Question</option>
                    <option>Partnership</option>
                    <option>Feedback</option>
                  </select>
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full border-b border-[#C1C1C1] py-3 font-body text-base outline-none focus:border-black transition-colors bg-transparent resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FF0000] text-white font-body font-semibold text-sm uppercase px-12 py-4 hover:bg-[#CC0000] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}