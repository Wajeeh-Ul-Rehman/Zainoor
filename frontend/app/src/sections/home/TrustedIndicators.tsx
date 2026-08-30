import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { 
    numericValue: 1, 
    suffix: 'K+', 
    label: 'Happy Customers',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    )
  },
  { 
    numericValue: 10, 
    suffix: '/10', 
    label: 'Customer Feedback',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  },
  { 
    numericValue: 24, 
    suffix: '/7', 
    label: 'Customer Support',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  { 
    numericValue: 300, 
    suffix: '+', 
    label: 'Cities Covered',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    )
  },
  { 
    numericValue: 100, 
    suffix: '%', 
    label: 'Quality Guaranteed',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    )
  },
];

export default function TrustedIndicators() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const countRefs = useRef<HTMLSpanElement[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const items = section.querySelectorAll('.stat-item');
    const icons = section.querySelectorAll('.stat-icon');

    // 1. Core reveal master timeline
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
      }
    });

    // Expand the decorative title line
    masterTl.fromTo(
      lineRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 1, ease: 'power3.out' }
    );

    // Fade and lift the card containers
    masterTl.fromTo(
      items,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power4.out' },
      '-=0.5'
    );

    // Delicate spin/fade for the icons, then trigger continuous floating
    masterTl.fromTo(
      icons,
      { opacity: 0, scale: 0.7, rotation: -15 },
      { 
        opacity: 0.6, 
        scale: 1, 
        rotation: 0, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: 'back.out(1.5)',
        onComplete: () => {
          // Continuous breathing effect
          gsap.to(icons, {
            y: -5,
            duration: 2.5,
            stagger: 0.2,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut'
          });
        }
      },
      '-=0.6'
    );

    // 2. High-end number counting ticker animation
    stats.forEach((stat, idx) => {
      const target = countRefs.current[idx];
      if (!target) return;

      const obj = { count: 0 };
      
      gsap.to(obj, {
        count: stat.numericValue,
        duration: 2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        },
        onUpdate: () => {
          target.innerText = Math.floor(obj.count).toString();
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-black text-white py-24 lg:py-32 overflow-hidden border-t border-white/5 relative">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        
        <div className="flex flex-col items-center mb-20">
          <h2 className="font-display text-2xl lg:text-4xl uppercase tracking-[0.2em] text-center text-white/90 mb-6">
            Our Standard of Excellence
          </h2>
          {/* Animated decorative line */}
          <div ref={lineRef} className="h-[1px] w-16 lg:w-24 bg-gradient-to-r from-transparent via-[#FF0000] to-transparent origin-center" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-4 lg:gap-x-6 justify-center">
          {stats.map((stat, i) => (
            <div
              key={i}
              // The magic logic for mobile centering is right here: i === stats.length - 1 ? 'col-span-2 md:col-span-1' : ''
              className={`stat-item group relative flex flex-col items-center text-center py-10 px-4 rounded-2xl transition-all duration-500 hover:bg-white/[0.02] border border-transparent hover:border-white/10 overflow-hidden ${
                i === stats.length - 1 ? 'col-span-2 md:col-span-1' : ''
              }`}
            >
              {/* Subtle hover radial glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Animated Icon Wrap */}
              <div className="stat-icon relative z-10 text-white/60 mb-6 transition-colors duration-500 group-hover:text-[#FF0000]">
                {stat.icon}
              </div>

              {/* Counter Display Area */}
              <div className="relative z-10 font-display font-light text-4xl lg:text-5xl xl:text-6xl text-white tracking-tight flex items-baseline justify-center">
                <span 
                  ref={(el) => { if (el) countRefs.current[i] = el; }}
                >
                  0
                </span>
                <span className="text-white/80 font-normal text-2xl lg:text-3xl ml-0.5">
                  {stat.suffix}
                </span>
              </div>

              {/* Delicate Label Text */}
              <span className="relative z-10 font-body text-[11px] lg:text-xs text-white/50 uppercase tracking-[0.15em] mt-4 font-light group-hover:text-white/85 transition-colors duration-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}