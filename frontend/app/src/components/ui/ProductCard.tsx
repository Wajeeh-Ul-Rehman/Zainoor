import { useState } from 'react';
import { API_URL } from "../../../config";
import { Link } from 'react-router-dom';
import type { Product } from '@/types';

const UPLOADS_BASE = API_URL;

interface ProductCardProps {
  product: Product & { title?: string; images?: string[] };
  onQuickAdd?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const productName = product.title || product.name || 'Product';
  
  // Safely extract the first and second images
  const firstRawImage = product.images?.[0] || product.image || '';
  const secondRawImage = product.images?.[1] || firstRawImage; // Fallback to first if no second image

  // Helper to format URLs
  const formatUrl = (img: string) => 
    img.startsWith('http') || img.startsWith('/') 
      ? (img.startsWith('/') ? `${UPLOADS_BASE}${img}` : img) 
      : img;

  const firstImage = formatUrl(firstRawImage);
  const secondImage = formatUrl(secondRawImage);
  const hasMultipleImages = firstImage !== secondImage;

  const productPrice = product.price || 0;
  const isSaleActive = product.sale?.active || product.isSale;
  const salePrice = product.sale?.price || product.salePrice;

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
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-[#EFEFEF] overflow-hidden">
          {/* Primary Image */}
          <img
            src={firstImage}
            alt={productName}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
              hasMultipleImages && isHovered ? 'opacity-0 scale-105' : 'opacity-100 group-hover:scale-105'
            }`}
          />
          
          {/* Secondary Image (Shown on Hover) */}
          {hasMultipleImages && (
            <img
              src={secondImage}
              alt={`${productName} alternate view`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            />
          )}

          {/* Badge */}
          {product.isNew && (
            <span className="absolute top-3 left-3 bg-[#FF0000] text-white font-body font-semibold text-[10px] uppercase px-2.5 py-1 z-10">
              New
            </span>
          )}
          {isSaleActive && (
            <span className="absolute top-3 left-3 bg-[#FF0000] text-white font-body font-semibold text-[10px] uppercase px-2.5 py-1 z-10">
              Sale
            </span>
          )}

          {/* Quick Add */}
          {onQuickAdd && (
            <button
              onClick={handleQuickAdd}
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white font-body font-medium text-xs uppercase px-5 py-2 transition-all duration-300 z-20 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              Quick Add
            </button>
          )}
        </div>

        {/* Info */}
        <div className="pt-3">
          <h3 className="font-body font-medium text-sm text-black">{productName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-body font-semibold text-sm">
              Rs. {((isSaleActive && salePrice) ? salePrice : productPrice).toLocaleString()}
            </span>
            {isSaleActive && salePrice && (
              <span className="font-body text-sm text-[#C1C1C1] line-through">
                Rs. {productPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex gap-1.5 mt-2">
            {product.colors?.map((color) => (
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