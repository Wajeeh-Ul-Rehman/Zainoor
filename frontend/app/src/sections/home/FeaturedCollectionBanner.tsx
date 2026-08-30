import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const clipPaths = {
  step1: {
    initial: 'polygon(50% 0%, 100% 0, 100% 33.3%, 100% 66.6%, 100% 100%, 50% 100%, 0 100%, 0 66.6%, 0 33.3%, 0 0)',
    final: 'polygon(50% 0%, 83.3% 0, 100% 33.3%, 83.3% 66.6%, 50% 100%, 16.6% 66.6%, 0 33.3%, 16.6% 0, 50% 0, 50% 0)',
  },
  step2: {
    initial: 'polygon(50% 0%, 83.3% 0, 100% 33.3%, 83.3% 66.6%, 50% 100%, 16.6% 66.6%, 0 33.3%, 16.6% 0, 50% 0, 50% 0)',
    final: 'polygon(50% 0%, 100% 0, 100% 50%, 100% 50%, 50% 100%, 0 50%, 0 50%, 0 0, 50% 0, 50% 0)',
  },
  step3: {
    initial: 'polygon(50% 0%, 100% 0, 100% 50%, 100% 50%, 50% 100%, 0 50%, 0 50%, 0 0, 50% 0, 50% 0)',
    final: 'polygon(50% 0%, 50% 0, 100% 50%, 100% 50%, 50% 100%, 0 50%, 0 50%, 0 0, 0 0, 50% 0)',
  },
};

export default function FeaturedCollectionBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const panels = container.querySelectorAll<HTMLElement>('.transition-panel');
    const headlineChars = container.querySelectorAll<HTMLElement>('.panel-headline span');

    // Set initial clip paths
    panels.forEach((panel) => {
      panel.style.clipPath = clipPaths.step1.initial;
      panel.style.opacity = '1';
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top center',
        toggleActions: 'play none none none',
      },
    });

    // Animate panels
    panels.forEach((panel, i) => {
      const direction = i % 2 === 0 ? -100 : 100;

      tl.fromTo(
        panel,
        { xPercent: direction },
        { xPercent: 0, duration: 1.2, ease: 'power3.inOut' },
        i === 0 ? 0 : '-=1.05'
      );

      tl.to(
        panel,
        {
          clipPath: clipPaths.step1.final,
          duration: 1.2,
          ease: 'power3.inOut',
        },
        '<'
      );

      tl.to(
        panel,
        {
          clipPath: clipPaths.step2.final,
          duration: 0.8,
          ease: 'power3.inOut',
        },
        '+=0'
      );

      tl.fromTo(
        panel,
        { clipPath: clipPaths.step3.initial },
        {
          clipPath: clipPaths.step3.final,
          duration: 0.8,
          ease: 'power3.inOut',
        }
      );
    });

    // Animate headline characters
    if (headlineChars.length > 0) {
      tl.fromTo(
        headlineChars,
        { opacity: 0, scale: 0.2 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.1,
          stagger: 0.04,
          ease: 'none',
        },
        '-=0.8'
      );
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  // --- CHANGED: The main animated headline ---
  const headline = 'The Summer Edit';
  const chars = headline.split('').map((char, i) => (
    <span key={i} className="inline-block">
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <div ref={containerRef} className="panel-container relative flex items-center justify-center overflow-hidden" style={{ height: '60vh' }}>
      {/* 6 Panels */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="transition-panel absolute top-0 bottom-0 w-1/6"
          style={{
            left: `${(i * 16.666)}%`,
            backgroundImage: `url('/images/lifestyle/lifestyle-1.jpg')`,
            backgroundPosition: `${(i * -100) + 250}px center`,
            backgroundSize: 'cover'
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center flex flex-col items-center">
        {/* --- CHANGED: The subheadline above the main text --- */}
        <span className="font-body font-medium text-xs uppercase tracking-[0.1em] text-white/80 block mb-4">
          Exclusive Drop
        </span>
        
        <h2 className="panel-headline text-5xl md:text-7xl font-bold text-white tracking-tight">
          {chars}
        </h2>
        
        {/* --- CHANGED: Button text and link destination --- */}
        <Link
          to="/collections/summer"
          className="inline-flex items-center gap-2 font-body font-medium text-white mt-8 group border border-white/30 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-colors"
        >
          Shop the Collection
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:translate-x-1 transition-transform"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </div>
  );
}