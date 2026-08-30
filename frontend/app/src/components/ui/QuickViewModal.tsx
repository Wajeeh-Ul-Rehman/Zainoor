import { useState } from 'react';
import type { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[Math.floor(product.sizes.length / 2)]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();

  const handleAddToCart = () => {
    addItem(product, selectedSize, selectedColor);
    addToast(`${product.name} added to cart`, 'success');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/85 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[960px] max-h-[90vh] bg-white z-50 overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 z-10 hover:opacity-60 transition-opacity"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="aspect-[3/4] lg:aspect-auto lg:h-full bg-[#EFEFEF]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="p-6 lg:p-10">
            <h2 className="font-display text-2xl lg:text-4xl">{product.name}</h2>
            <div className="flex items-center gap-3 mt-3">
              <span className="font-body font-semibold text-xl lg:text-2xl">
                Rs. {(product.salePrice || product.price).toLocaleString()}
              </span>
              {product.salePrice && (
                <span className="font-body text-lg text-[#C1C1C1] line-through">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
            </div>

            <p className="font-body font-light text-[#424242] mt-4 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mt-6">
              <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-2 block">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 font-body text-sm border transition-colors ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'border-[#EFEFEF] text-black hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="mt-4">
              <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-2 block">
                Color
              </label>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-colors ${
                      color === 'black' ? 'bg-black' : 'bg-white border-[#C1C1C1]'
                    } ${selectedColor === color ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-2 block">
                Quantity
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-[#EFEFEF] flex items-center justify-center font-body hover:border-black transition-colors"
                >
                  -
                </button>
                <span className="w-12 h-10 border-t border-b border-[#EFEFEF] flex items-center justify-center font-body">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-[#EFEFEF] flex items-center justify-center font-body hover:border-black transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#FF0000] text-white font-body font-semibold text-sm uppercase py-4 mt-8 hover:bg-[#CC0000] transition-colors"
            >
              Add to Cart — Rs. {((product.salePrice || product.price) * quantity).toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
