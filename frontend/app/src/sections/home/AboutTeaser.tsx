import { Link } from 'react-router-dom';
import ScrollFillHeadline from '@/components/effects/ScrollFillHeadline';

export default function AboutTeaser() {
  return (
    <section className="bg-[#EFEFEF] py-20 lg:py-[120px]">
      <div className="container-main">
        <div className="max-w-[800px] mx-auto text-center">
          <ScrollFillHeadline
            text="Born with a Passion for Timeless Fashion"
            className="font-serif text-3xl lg:text-5xl text-black leading-[1.1] tracking-[-0.01em]"
          />

          <p className="font-body font-light text-base lg:text-lg text-[#424242] mt-6 leading-relaxed max-w-[600px] mx-auto">
            ZaiNoor is a Pakistani clothing brand that celebrates the power of simplicity.
            For over a decade, we&apos;ve dressed thousands with premium fabrics and impeccable cuts.
          </p>

          <Link
            to="/about"
            className="inline-flex items-center gap-2 font-body font-medium text-black mt-8 group"
          >
            Our Story
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
    </section>
  );
}
