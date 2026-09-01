import { useState } from 'react';
import type { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  // Parse sizeCharts safely
  const parsedSizeCharts = (() => {
    try {
      if (!product?.sizeCharts) return {};
      return typeof product.sizeCharts === 'string' ? JSON.parse(product.sizeCharts) : product.sizeCharts;
    } catch {
      return {};
    }
  })();

  // Fallback: If product.sizes is empty, automatically extract size keys from sizeCharts (e.g., 'S', 'M', 'L', 'XL')
  const sizes = (product?.sizes && product.sizes.length > 0)
    ? product.sizes
    : Object.keys(parsedSizeCharts).filter(k => parsedSizeCharts[k]?.length > 0);
  const productName = product?.name || (product as any)?.title || 'Unknown Product';

  const colors = (product?.colors && product.colors.length > 0)
    ? product.colors
    : (product as any)?.colorOptions || [];

 let productImage = product?.image || (product as any)?.imageUrl || (product as any)?.images?.[0] || '';
  if (productImage.startsWith('/')) {
    productImage = `http://localhost:5001${productImage}`;
  }

  const [selectedSize, setSelectedSize] = useState(sizes.length > 0 ? sizes[0] : '');
  const [selectedColor, setSelectedColor] = useState(colors.length > 0 ? colors[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);// State to toggle size guide popup/drawer
  
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();

  

  // Get forms configured for the currently selected size (e.g. 'S', 'M', 'L', 'XL')
  const activeSizeCharts = parsedSizeCharts[selectedSize] || [];

  const handleAddToCart = () => {
    addItem(product, selectedSize, selectedColor);
    addToast(`${productName} added to cart`, 'success');
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
            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 font-body">
                No Image Available
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
                  <label className="font-body text-xs uppercase tracking-wider text-[#424242] block">
                    Size: <span className="font-semibold text-black">{selectedSize}</span>
                  </label>
                  {activeSizeCharts.length > 0 && (
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
              className="w-full bg-[#FF0000] text-white font-body font-semibold text-sm uppercase py-4 mt-8 hover:bg-[#CC0000] transition-colors"
            >
              Add to Cart — Rs. {(((product?.salePrice || product?.price || 0) * quantity)).toLocaleString()}
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
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-neutral-400 hover:text-black font-bold text-lg"
              >
                ✕
              </button>
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
              <button
                onClick={() => setShowSizeGuide(false)}
                className="bg-black text-white px-5 py-2 font-body text-xs uppercase tracking-wider hover:bg-neutral-800"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}