import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Right Image/Fashion Form Area */}
      <div className="absolute right-0 bottom-0 h-4/5 w-full lg:w-1/2 flex items-end justify-center z-0">
        <div className="relative h-full flex flex-col items-center">
          {/* Mannequin and Drapes */}
          <img 
            src="https://ik.imagekit.io/wajeehabdullah/Hero_Img_Zainoor-removebg-preview%20(1).png" 
            alt="Draped fashion form" 
            className="h-full object-contain object-right"
          />
        </div>
      </div>

      {/* Foreground Content */}
<div className="absolute bottom-[23%] left-0 z-10 px-5 lg:pl-24 lg:pr-10 pointer-events-none w-full lg:w-1/2">
  <div className="max-w-[800px] pointer-events-auto">
    <h1
      className="font-display text-white text-4xl sm:text-5xl lg:text-7xl xl:text-[90px] leading-[0.9] tracking-[-0.03em]"
      style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}  
    >
      Where Tradition Meets Light 
    </h1>
    <Link
      to="/products"
      className="border-4 border-blue rounded-[20px] inline-block mt-8 bg-[#000000] text-white font-body font-medium text-sm uppercase tracking-[0.05em] px-10 py-3.5 hover:bg-[#FFFFFF] hover:text-black hover:scale-[1.02] transition-all duration-200 "
    >
      Shop Now
    </Link>
  </div>
</div>

      {/* Premium Scroll Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
        {/* Custom keyframes for the elegant line animation */}
        <style>
          {`
            @keyframes scroll-line {
              0% { transform: translateY(-100%); }
              50% { transform: translateY(100%); }
              100% { transform: translateY(100%); }
            }
          `}
        </style>

        <span className="font-body font-light text-[9px] text-white/70 uppercase tracking-[0.4em] mb-4 ml-[0.4em]">
          Discover
        </span>
        
        {/* Track Container */}
        <div className="relative w-[1px] h-[60px] bg-white/20 overflow-hidden rounded-full">
          {/* Animated Falling Line */}
          <div 
            className="absolute top-0 left-0 w-full h-[30px] bg-white rounded-full"
            style={{ 
              animation: 'scroll-line 2s cubic-bezier(0.77, 0, 0.175, 1) infinite' 
            }}
          />
        </div>
      </div>
    </section>
  );
}