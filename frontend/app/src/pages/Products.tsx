import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categories, sortOptions } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import ProductCard from '@/components/ui/ProductCard';
import { useProductStore } from '../stores/productStore';
import QuickViewModal from '@/components/ui/QuickViewModal';
import { socket } from '@/lib/socket';

gsap.registerPlugin(ScrollTrigger);

export default function Products() {
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [priceRange, setPriceRange] = useState(15000);
  const [quickViewProduct, setQuickViewProduct] = useState<typeof products[0] | null>(null);
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();

    socket.on('product:created', (newProduct) => addProduct(newProduct));
    socket.on('product:updated', (updatedProduct) => updateProduct(updatedProduct.id, updatedProduct));
    socket.on('product:deleted', (productId) => deleteProduct(productId));

    return () => {
      socket.off('product:created');
      socket.off('product:updated');
      socket.off('product:deleted');
    };
  }, [fetchProducts, addProduct, updateProduct, deleteProduct]);

  useEffect(() => {
    const productId = searchParams.get('product');
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setQuickViewProduct(product);
      }
    }
  }, [searchParams, products]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll('.product-card-wrapper');

    const tl = gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
        },
      }
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [selectedCategory, selectedSort, priceRange, products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category?.toLowerCase().includes(selectedCategory.toLowerCase()));
    }

    result = result.filter((p) => {
      const price = p.sale?.price || p.salePrice || p.price;
      return price <= priceRange;
    });

    switch (selectedSort) {
      case 'price-low':
        result.sort((a, b) => (a.sale?.price || a.salePrice || a.price) - (b.sale?.price || b.salePrice || b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.sale?.price || b.salePrice || b.price) - (a.sale?.price || a.salePrice || a.price));
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0));
        break;
    }

    return result;
  }, [selectedCategory, selectedSort, priceRange, products]);

  const handleQuickAdd = (product: typeof products[0]) => {
    const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
    const size = sizes[Math.floor(sizes.length / 2)] || 'Default';
    const colors = product.colors || ['Default'];
    const color = colors[0] || 'Default';
    addItem(product, size, color);
    addToast(`${product.title || product.name} added to cart`, 'success');
  };

  const handleQuickView = (product: typeof products[0]) => {
    setQuickViewProduct(product);
    setSearchParams({ product: product.id });
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
    setSearchParams({});
  };

  return (
    <main>
      <section className="bg-black pt-32 lg:pt-40 pb-16 lg:pb-20">
        <div className="container-main">
          <h1 className="font-display text-white text-4xl lg:text-6xl xl:text-[120px] leading-[0.8]">
            Our Collection
          </h1>
        </div>
      </section>

      <section className="sticky top-16 lg:top-20 bg-white border-b border-[#EFEFEF] z-30">
        <div className="container-main py-4">
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2">
              <label className="font-body text-xs uppercase tracking-wider text-[#424242]">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="font-body text-sm border border-[#EFEFEF] px-3 py-1.5 outline-none focus:border-black transition-colors bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-body text-xs uppercase tracking-wider text-[#424242]">Sort:</label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="font-body text-sm border border-[#EFEFEF] px-3 py-1.5 outline-none focus:border-black transition-colors bg-white"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="font-body text-xs uppercase tracking-wider text-[#424242]">Max Price:</label>
              <input
                type="range"
                min="0"
                max="15000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-32 accent-black"
              />
              <span className="font-body text-sm">Rs. {priceRange.toLocaleString()}</span>
            </div>

            <span className="font-body text-xs text-[#C1C1C1] ml-auto">
              {filteredProducts.length} products
            </span>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-16">
        <div className="container-main">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-lg text-[#424242]">No products match your filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange(15000);
                }}
                className="font-body text-sm text-black underline mt-2"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card-wrapper">
                  <div onClick={() => handleQuickView(product)} className="cursor-pointer">
                    <ProductCard product={product} onQuickAdd={() => handleQuickAdd(product)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={closeQuickView} />
      )}
    </main>
  );
}