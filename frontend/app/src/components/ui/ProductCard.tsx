import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onQuickAdd?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickAdd?.(product);
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products?product=${product.id}`}>
        {/* Image */}
        <div className="relative aspect-[3/4] bg-[#EFEFEF] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          />

          {/* Badge */}
          {product.isNew && (
            <span className="absolute top-3 left-3 bg-[#FF0000] text-white font-body font-semibold text-[10px] uppercase px-2.5 py-1">
              New
            </span>
          )}
          {product.isSale && (
            <span className="absolute top-3 left-3 bg-[#FF0000] text-white font-body font-semibold text-[10px] uppercase px-2.5 py-1">
              Sale
            </span>
          )}

          {/* Quick Add */}
          {onQuickAdd && (
            <button
              onClick={handleQuickAdd}
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white font-body font-medium text-xs uppercase px-5 py-2 transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              Quick Add
            </button>
          )}
        </div>

        {/* Info */}
        <div className="pt-3">
          <h3 className="font-body font-medium text-sm text-black">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-body font-semibold text-sm">
              Rs. {(product.salePrice || product.price).toLocaleString()}
            </span>
            {product.salePrice && (
              <span className="font-body text-sm text-[#C1C1C1] line-through">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Color Swatches */}
          <div className="flex gap-1.5 mt-2">
            {product.colors.map((color) => (
              <span
                key={color}
                className={`w-4 h-4 rounded-full border ${
                  color === 'black'
                    ? 'bg-black border-[#424242]'
                    : 'bg-white border-[#C1C1C1]'
                }`}
                title={color}
              />
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
