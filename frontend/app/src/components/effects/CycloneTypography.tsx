import { useRef, useEffect } from 'react';

interface CycloneText {
  strings: string[];
  angles: number[];
  radius: number;
  speed: number;
  scroll: number;
  dragStart: number;
  isDragging: boolean;
  lastMouseX: number;
}

export default function CycloneTypography({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectRef = useRef<CycloneText | null>(null);
  const glInitialized = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (glInitialized.current) return;
    glInitialized.current = true;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const textParams = {
      strings: ['****', 'ZAI NOOR', '------', 'BLACK', '&', 'WHITE', '//'],
    };

    const effect: CycloneText = {
      strings: textParams.strings,
      angles: textParams.strings.map((_, i) => (i / textParams.strings.length) * Math.PI * 2),
      radius: 120,
      speed: 0.005,
      scroll: 0,
      dragStart: 0,
      isDragging: false,
      lastMouseX: 0,
    };

    effectRef.current = effect;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      effect.scroll += e.deltaY * 0.001;
    };

    const handleMouseDown = (e: MouseEvent) => {
      effect.isDragging = true;
      effect.lastMouseX = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!effect.isDragging) return;
      const dx = e.clientX - effect.lastMouseX;
      effect.lastMouseX = e.clientX;
      effect.scroll += dx * 0.005;
    };

    const handleMouseUp = () => {
      effect.isDragging = false;
    };

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      effect.isDragging = true;
      effect.lastMouseX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!effect.isDragging) return;
      const dx = e.touches[0].clientX - effect.lastMouseX;
      effect.lastMouseX = e.touches[0].clientX;
      effect.scroll += dx * 0.005;
    };

    const handleTouchEnd = () => {
      effect.isDragging = false;
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', resize);

    let time = 0;

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      time += 0.016;

      const cx = w / 2;
      const cy = h / 2;
      const stringCount = effect.strings.length;

      // Draw each string in the helix
      for (let s = 0; s < stringCount; s++) {
        const baseAngle = effect.angles[s] + effect.scroll + time * 0.3;

        // Draw the text multiple times around the circle for the helix effect
        const repetitions = 3;
        for (let r = 0; r < repetitions; r++) {
          const repetitionAngle = (r / repetitions) * Math.PI * 2;
          const angle = baseAngle + repetitionAngle;

          const x = cx + Math.cos(angle) * effect.radius;
          const y = cy + Math.sin(angle) * effect.radius * 0.3;
          const z = Math.sin(angle + time * 0.5);

          // Scale based on Z depth
          const depthScale = 0.6 + (z + 1) * 0.4;
          const fontSize = 16 * depthScale;
          const opacity = 0.3 + (z + 1) * 0.35;

          ctx.save();
          ctx.translate(x, y);

          // Rotation to face outward from center
          const rotation = angle + Math.PI / 2;
          ctx.rotate(rotation);

          // Vertical wobble
          const wobbleY = Math.sin(s * 0.8 + time * 2) * 8 * depthScale;
          ctx.translate(0, wobbleY);

          // Scale
          ctx.scale(depthScale, depthScale);

          // Draw text
          ctx.font = `600 ${fontSize}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fillText(effect.strings[s], 0, 0);

          ctx.restore();
        }
      }

      // Draw "ZAI NOOR" prominently in center
      const centerOpacity = 0.15 + Math.sin(time * 0.5) * 0.05;
      ctx.font = `700 ${Math.min(w * 0.08, 120)}px 'Playfair Display', serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(255, 255, 255, ${centerOpacity})`;
      ctx.fillText('ZAI NOOR', cx, cy);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', resize);
      glInitialized.current = false;
      effectRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        background: '#000000',
        touchAction: 'none',
      }}
    />
  );
}
