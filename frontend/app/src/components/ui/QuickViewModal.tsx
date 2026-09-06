import { useState } from 'react';
import { API_URL } from "../../../config";
import type { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const parsedSizeCharts = (() => {
    try {
      if (!product?.sizeCharts) return {};
      return typeof product.sizeCharts === 'string' ? JSON.parse(product.sizeCharts) : product.sizeCharts;
    } catch {
      return {};
    }
  })();

  const sizes = (product?.sizes && product.sizes.length > 0)
    ? product.sizes
    : Object.keys(parsedSizeCharts).filter(k => parsedSizeCharts[k]?.length > 0);
  
  const productName = product?.name || (product as any)?.title || 'Unknown Product';
  const colors = (product?.colors && product.colors.length > 0)
    ? product.colors
    : (product as any)?.colorOptions || [];

  const rawImages: string[] = product?.images?.length ? product.images : (product?.image ? [product.image] : []);
  const allImages = rawImages.map(img => img.startsWith('/') ? `${API_URL}${img}` : img);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = allImages[activeImageIndex] || '';

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // 1. Initialize size to empty string to force manual selection
  const [selectedSize, setSelectedSize] = useState(''); 
  const [sizeError, setSizeError] = useState(false); // Tracks if user tried adding without a size
  
  const [selectedColor, setSelectedColor] = useState(colors.length > 0 ? colors[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();

  const activeSizeCharts = selectedSize ? (parsedSizeCharts[selectedSize] || []) : [];

  const handleAddToCart = () => {
    // 2. Validation check: Block add to cart if sizes exist but none is selected
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      addToast('Please select a size first', 'error');
      return;
    }

    addItem(product, selectedSize, selectedColor);
    addToast(`${productName} added to cart`, 'success');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/85 z-50" onClick={onClose} />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[960px] max-h-[90vh] bg-white z-50 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 z-10 bg-white/50 rounded-full hover:bg-white transition-colors"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="flex flex-col bg-[#EFEFEF]">
            <div className="aspect-[3/4] lg:h-full relative w-full group">
              {activeImage ? (
                <img src={activeImage} alt={productName} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400 font-body">
                  No Image Available
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md transition-all opacity-80 hover:opacity-100 z-10"
                    aria-label="Previous image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md transition-all opacity-80 hover:opacity-100 z-10"
                    aria-label="Next image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            {allImages.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto bg-white border-t border-neutral-100">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-16 h-16 border-2 transition-all ${
                      activeImageIndex === idx ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 lg:p-10">
            <h2 className="font-display text-2xl lg:text-4xl">{productName}</h2>
            
            <div className="flex items-center gap-3 mt-3">
              <span className="font-body font-semibold text-xl lg:text-2xl">
                Rs. {(product?.salePrice || product?.price || 0).toLocaleString()}
              </span>
              {product?.salePrice && (
                <span className="font-body text-lg text-[#C1C1C1] line-through">
                  Rs. {(product?.price || 0).toLocaleString()}
                </span>
              )}
            </div>

            <p className="font-body font-light text-[#424242] mt-4 leading-relaxed">
              {product?.description || 'No description available.'}
            </p>

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className={`font-body text-xs uppercase tracking-wider block transition-colors ${sizeError ? 'text-[#FF0000] font-bold' : 'text-[#424242]'}`}>
                    Size: <span className="font-semibold text-black">{selectedSize || 'None Selected'}</span>
                    {sizeError && <span className="ml-2 text-[#FF0000] animate-pulse">* Required</span>}
                  </label>
                  {activeSizeCharts.length > 0 && selectedSize && (
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className="font-body text-xs text-black underline underline-offset-4 hover:opacity-70 transition-opacity"
                    >
                      View Size Guide ({selectedSize})
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false); // Clear the error once a size is clicked
                      }}
                      className={`w-10 h-10 font-body text-sm border transition-colors ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : sizeError
                            ? 'border-[#FF0000] text-[#FF0000] hover:bg-red-50'
                            : 'border-[#EFEFEF] text-black hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="mt-4">
                <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-2 block">
                  Color
                </label>
                <div className="flex gap-2">
                  {colors.map((color: string) => (
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
            )}

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
              className={`w-full text-white font-body font-semibold text-sm uppercase py-4 mt-8 transition-colors ${
                sizes.length > 0 && !selectedSize 
                  ? 'bg-neutral-400 cursor-not-allowed hover:bg-neutral-500' 
                  : 'bg-[#FF0000] hover:bg-[#CC0000]'
              }`}
            >
              {sizes.length > 0 && !selectedSize
                ? 'Select a Size'
                : `Add to Cart — Rs. ${(((product?.salePrice || product?.price || 0) * quantity)).toLocaleString()}`
              }
            </button>
          </div>
        </div>
      </div>

      {/* Size Guide Sub-Modal / Drawer */}
      {showSizeGuide && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
         <div className="bg-white w-full max-w-lg p-6 rounded shadow-xl relative max-h-[85vh] overflow-y-auto">
           <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
             <h3 className="font-display text-lg font-semibold">Size Guide — {selectedSize}</h3>
             <button onClick={() => setShowSizeGuide(false)} className="text-neutral-400 hover:text-black font-bold text-lg">✕</button>
           </div>
           <div className="space-y-6">
             {activeSizeCharts.length === 0 ? (
               <p className="font-body text-sm text-neutral-500 text-center py-6">No attribute charts available for size {selectedSize}.</p>
             ) : (
               activeSizeCharts.map((chart: any, idx: number) => (
                 <div key={idx} className="border border-neutral-200 p-4 bg-neutral-50">
                   <h4 className="font-display text-sm font-medium text-black mb-3">{chart.title || `Chart ${idx + 1}`}</h4>
                   <table className="w-full text-xs font-body">
                     <thead>
                       <tr className="border-b border-neutral-300 text-neutral-500 uppercase tracking-wider text-left">
                         <th className="pb-2">Attribute name</th>
                         <th className="pb-2 text-right">Attribute size</th>
                       </tr>
                     </thead>
                     <tbody>
                       {chart.rows?.map((row: any, rIdx: number) => (
                         <tr key={rIdx} className="border-b border-neutral-200 last:border-0">
                           <td className="py-2.5 text-neutral-700 font-medium">{row.name || '—'}</td>
                           <td className="py-2.5 text-right text-black">{row.value || '—'}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ))
             )}
           </div>
           <div className="mt-6 pt-3 border-t border-neutral-200 text-right">
             <button onClick={() => setShowSizeGuide(false)} className="bg-black text-white px-5 py-2 font-body text-xs uppercase tracking-wider hover:bg-neutral-800">Close Guide</button>
           </div>
         </div>
       </div>
      )}
    </>
  );
}