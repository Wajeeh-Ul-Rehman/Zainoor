import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const values = [
  {
    title: 'Premium Quality',
    description: 'Only the finest fabrics sourced from Pakistan\'s best mills.',
  },
  {
    title: 'Nationwide Delivery',
    description: 'Fast shipping to 300+ cities across Pakistan.',
  },
  {
    title: '10/10 Customer Feedback',
    description: 'Thousands of trusted customers.',
  },
];

export default function About() {
  const storyRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const story = storyRef.current;
    const valuesSection = valuesRef.current;

    if (story) {
      const elements = story.querySelectorAll('.story-animate');
      gsap.fromTo(elements, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: story, start: 'top 80%' },
      });
    }

    if (valuesSection) {
      const cards = valuesSection.querySelectorAll('.value-card');
      gsap.fromTo(cards, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: valuesSection, start: 'top 80%' },
      });
    }
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="bg-black pt-32 lg:pt-40 pb-16 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="absolute font-display text-white whitespace-nowrap select-none"
              style={{
                fontSize: 'clamp(80px, 15vw, 200px)',
                top: `${i * 15}%`,
                left: `${(i % 2) * -10}%`,
                transform: 'rotate(-5deg)',
              }}
            >
              ZAI NOOR
            </span>
          ))}
        </div>
        <div className="container-main relative z-10">
          <h1 className="font-display text-white text-4xl lg:text-6xl xl:text-[120px] leading-[0.8]">
            About ZaiNoor
          </h1>
          <div className="flex items-center gap-2 mt-8">
            <Link to="/" className="font-body text-xs text-[#C1C1C1] hover:text-white transition-colors">Home</Link>
            <span className="text-[#424242]">/</span>
            <span className="font-body text-xs text-white">About</span>
          </div>
        </div>
      </section>

      {/* Story */}
      <section ref={storyRef} className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 lg:p-16 xl:p-20 flex flex-col justify-center">
            <span className="story-animate font-body font-medium text-xs uppercase tracking-[0.1em] text-[#424242] mb-4">
              Our Story
            </span>
            <h2 className="story-animate font-display text-3xl lg:text-5xl leading-[1.1]">
              Born from a Passion for Timeless Fashion
            </h2>
            <div className="story-animate mt-6 space-y-4">
              <p className="font-body font-light text-[#424242] leading-relaxed">
                Born from a passion for timeless fashion, ZaiNoor is a Pakistani clothing brand that celebrates the power of simplicity. Our design philosophy revolves around the pure contrast of black and white — two colors that speak louder than any.
              </p>
              <p className="font-body font-light text-[#424242] leading-relaxed">
                For over a decade, we&apos;ve dressed thousands across the nation with premium fabrics, impeccable cuts, and a promise of elegance that never fades. Whether it&apos;s a crisp white kurta or a bold black ensemble, every piece is crafted to make you feel confident, modern, and effortlessly stylish.
              </p>
              <p className="font-body font-light text-[#424242] leading-relaxed">
                At ZaiNoor, we believe fashion is not just about what you wear, but how it makes you feel. Join us in rewriting the rules of style — in black and white.
              </p>
            </div>
            <p className="story-animate font-display italic text-xl mt-8">
              — The ZaiNoor Family
            </p>
          </div>
          <div className="h-[400px] lg:h-auto">
            <img
              src="/images/about/story.jpg"
              alt="ZaiNoor Atelier"
              className="w-full h-full object-cover grayscale"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section ref={valuesRef} className="bg-[#EFEFEF] py-20 lg:py-[120px]">
        <div className="container-main">
          <h2 className="font-display text-3xl lg:text-5xl text-center mb-12 lg:mb-16">
            Why Choose ZaiNoor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-[1200px] mx-auto">
            {values.map((value, i) => (
              <div key={i} className="value-card text-center p-8">
                <div className="w-12 h-12 mx-auto mb-5">
                  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-black">
                    {i === 0 && (
                      <>
                        <path d="M24 4L6 14v20l18 10 18-10V14L24 4z" />
                        <path d="M24 24v20" />
                        <path d="M24 24L6 14" />
                        <path d="M24 24l18-10" />
                      </>
                    )}
                    {i === 1 && (
                      <>
                        <rect x="6" y="12" width="36" height="28" rx="2" />
                        <path d="M6 20h36" />
                        <path d="M16 28h16" />
                      </>
                    )}
                    {i === 2 && (
                      <>
                        <circle cx="24" cy="24" r="18" />
                        <path d="M24 12v12l8 8" />
                      </>
                    )}
                  </svg>
                </div>
                <h3 className="font-body font-semibold text-lg">{value.title}</h3>
                <p className="font-body font-light text-sm text-[#424242] mt-2 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
