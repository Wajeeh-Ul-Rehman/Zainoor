import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollFillHeadlineProps {
  text: string;
  className?: string;
}

export default function ScrollFillHeadline({ text, className = '' }: ScrollFillHeadlineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wrappers = container.querySelectorAll('.word-wrapper');
    if (!wrappers.length) return;

    const triggers: ScrollTrigger[] = [];

    wrappers.forEach((wrapper) => {
      const fill = wrapper.querySelector('.word-fill') as HTMLElement;
      if (!fill) return;

      const tl = gsap.to(fill, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true,
        },
      });

      if (tl.scrollTrigger) {
        triggers.push(tl.scrollTrigger);
      }
    });

    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, []);

  const words = text.split(' ');

  return (
    <div ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span key={i} className="word-wrapper">
          <span className="word-stroke" aria-hidden="true">
            {word}
          </span>
          <span className="word-fill">{word}</span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </div>
  );
}
