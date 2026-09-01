import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { products } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore } from '@/stores/productStore';
import { useUIStore } from '@/stores/uiStore';
import ProductCard from '@/components/ui/ProductCard';

gsap.registerPlugin(ScrollTrigger);

export default function CollectionShowcase() {
  const { products, fetchProducts } = useProductStore();
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  // Take only the latest few products for the home page showcase
  const displayedProducts = products.slice(0, 4);

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
    <section className="py-16">
      <div className="container-main">
        <h2 className="font-display text-3xl mb-8">Latest Collection</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
