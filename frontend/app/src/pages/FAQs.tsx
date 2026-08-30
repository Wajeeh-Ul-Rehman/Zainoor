import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { faqs, faqCategories } from '@/data/faqs';

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#EFEFEF]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-body font-medium text-base pr-4">{question}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-400 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="font-body font-light text-[#424242] pb-6 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQs() {
  const [search, setSearch] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqs;
    const term = search.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(term) ||
        f.answer.toLowerCase().includes(term)
    );
  }, [search]);

  const groupedFaqs = useMemo(() => {
    const groups: Record<string, typeof faqs> = {};
    faqCategories.forEach((cat) => {
      const items = filteredFaqs.filter((f) => f.category === cat);
      if (items.length > 0) {
        groups[cat] = items;
      }
    });
    return groups;
  }, [filteredFaqs]);

  return (
    <main>
      {/* Header */}
      <section className="bg-black pt-32 lg:pt-40 pb-12 lg:pb-16">
        <div className="container-main">
          <h1 className="font-display text-white text-3xl lg:text-5xl xl:text-6xl leading-[1]">
            Frequently Asked Questions
          </h1>
          <p className="font-body font-light text-[#C1C1C1] mt-4 max-w-[600px]">
            Find answers to common questions about orders, shipping, returns, and more.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="sticky top-16 lg:top-20 bg-white border-b border-[#EFEFEF] z-30">
        <div className="container-main py-4">
          <div className="relative max-w-[600px]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C1C1C1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-0 top-1/2 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-3 font-body text-lg border-b-2 border-black bg-transparent outline-none focus:border-[#FF0000] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Accordion */}
      <section className="py-12 lg:py-20">
        <div className="container-main">
          <div className="max-w-[800px] mx-auto">
            {Object.entries(groupedFaqs).map(([category, items]) => (
              <div key={category} className="mb-10">
                <h3 className="font-body font-semibold text-xs uppercase tracking-[0.1em] text-[#424242] mb-4">
                  {category}
                </h3>
                {items.map((faq) => (
                  <AccordionItem key={faq.id} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="font-body text-[#424242]">No questions found matching &quot;{search}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#EFEFEF] py-20 lg:py-[120px]">
        <div className="container-main text-center">
          <h2 className="font-display text-3xl lg:text-5xl">Still have questions?</h2>
          <p className="font-body font-light text-[#424242] mt-3">
            Our support team is here to help you 24/7.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-black text-white font-body font-medium text-sm uppercase px-9 py-3.5 mt-8 hover:bg-[#424242] transition-colors"
          >
            Contact Us &rarr;
          </Link>
        </div>
      </section>
    </main>
  );
}
