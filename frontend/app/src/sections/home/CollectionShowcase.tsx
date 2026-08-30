import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { products } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import ProductCard from '@/components/ui/ProductCard';

gsap.registerPlugin(ScrollTrigger);

export default function CollectionShowcase() {
  const gridRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();

  const handleQuickAdd = (product: typeof products[0]) => {
    // Default to first available size and color
    const size = product.sizes[Math.floor(product.sizes.length / 2)];
    const color = product.colors[0];
    addItem(product, size, color);
    addToast(`${product.name} added to cart`, 'success');
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll('.product-card-wrapper');

    const tl = gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        },
      }
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  // Split products into 3 columns
  const leftProducts = products.filter((_, i) => i % 3 === 0);
  const centerProducts = products.filter((_, i) => i % 3 === 1);
  const rightProducts = products.filter((_, i) => i % 3 === 2);

  return (
    <section ref={sectionRef} className="bg-white pt-[120px] lg:pt-[180px] pb-20 lg:pb-[120px]">
      <div className="container-main">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-12 lg:mb-16">
          <h2 className="font-display text-3xl lg:text-5xl text-black">Our Collection</h2>
          <Link
            to="/products"
            className="font-body text-sm text-black hover:underline transition-all"
          >
            View All &rarr;
          </Link>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-4 lg:gap-6">
            {leftProducts.map((product) => (
              <div key={product.id} className="product-card-wrapper">
                <ProductCard product={product} onQuickAdd={handleQuickAdd} />
              </div>
            ))}
          </div>

          {/* Center Column */}
          <div className="flex flex-col gap-4 lg:gap-6">
            {centerProducts.map((product) => (
              <div key={product.id} className="product-card-wrapper">
                <ProductCard product={product} onQuickAdd={handleQuickAdd} />
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="hidden lg:flex flex-col gap-6">
            {rightProducts.map((product) => (
              <div key={product.id} className="product-card-wrapper">
                <ProductCard product={product} onQuickAdd={handleQuickAdd} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
