import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutGrid, Package, ShoppingBag, Users, Inbox, Plus, X, Trash2, EyeOff, Eye, Tag,
  Search, ImagePlus, Download, TrendingUp, AlertTriangle, LogOut, CheckSquare,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useProductStore, type Product, type Sale } from '@/stores/productStore';
import { useOrderStore, ORDER_STATUSES, type OrderStatus } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';

const UPLOADS_BASE = 'http://localhost:5001';
const CATEGORIES = ['Outerwear', 'Dresses', 'Tops', 'Bottoms', 'Accessories'];
const rs = (n: number) => `Rs ${Number(n || 0).toLocaleString('en-US')}`;

const NAV = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'submissions', label: 'Submissions', icon: Inbox },
] as const;

/* ---------------------------------------------------------------------- */
/*  Product form modal — real image upload, real create/update            */
/* ---------------------------------------------------------------------- */

interface AttributeRow {
  name: string;
  value: string;
}

interface SizeForm {
  title: string;
  rows: AttributeRow[];
}

function SizeChartsEditor({ sizeCharts, onChange }: { sizeCharts: Record<string, SizeForm[]>, onChange: (charts: Record<string, SizeForm[]>) => void }) {
  const [activeSize, setActiveSize] = useState<'S' | 'M' | 'L' | 'XL'>('S');

  const sizes = [
    { key: 'S', label: 'Small (S)' },
    { key: 'M', label: 'Medium (M)' },
    { key: 'L', label: 'Large (L)' },
    { key: 'XL', label: 'Extra Large (XL)' },
  ];

  const currentForms = sizeCharts[activeSize] || [];

  const handleAddForm = () => {
    if (currentForms.length >= 3) return;
    const updatedForms = [...currentForms, { title: '', rows: [{ name: '', value: '' }] }];
    onChange({ ...sizeCharts, [activeSize]: updatedForms });
  };

  const handleRemoveForm = (formIndex: number) => {
    const updatedForms = currentForms.filter((_, idx) => idx !== formIndex);
    onChange({ ...sizeCharts, [activeSize]: updatedForms });
  };

  const handleTitleChange = (formIndex: number, title: string) => {
    const updatedForms = [...currentForms];
    updatedForms[formIndex].title = title;
    onChange({ ...sizeCharts, [activeSize]: updatedForms });
  };

  const handleAddRow = (formIndex: number) => {
    const updatedForms = [...currentForms];
    updatedForms[formIndex].rows.push({ name: '', value: '' });
    onChange({ ...sizeCharts, [activeSize]: updatedForms });
  };

  const handleRemoveRow = (formIndex: number, rowIndex: number) => {
    const updatedForms = [...currentForms];
    updatedForms[formIndex].rows = updatedForms[formIndex].rows.filter((_, idx) => idx !== rowIndex);
    onChange({ ...sizeCharts, [activeSize]: updatedForms });
  };

  const handleRowChange = (formIndex: number, rowIndex: number, field: 'name' | 'value', val: string) => {
    const updatedForms = [...currentForms];
    updatedForms[formIndex].rows[rowIndex][field] = val;
    onChange({ ...sizeCharts, [activeSize]: updatedForms });
  };

  return (
    <div className="bg-white border border-neutral-200 p-6 rounded-lg space-y-6 mt-6">
      <div>
        <h3 className="font-display text-lg font-medium text-black">Product Size Charts & Attributes</h3>
        <p className="font-body text-xs text-neutral-500 mt-1">Configure up to 3 attribute forms for each size category.</p>
      </div>

      <div className="flex border-b border-neutral-200">
        {sizes.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveSize(s.key as any)}
            className={`px-6 py-3 font-body text-sm font-medium border-b-2 transition-colors ${
              activeSize === s.key ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            {s.label} ({sizeCharts[s.key]?.length || 0}/3)
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {currentForms.map((form, formIdx) => (
          <div key={formIdx} className="border border-neutral-200 p-5 rounded bg-neutral-50/50 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="Main Title (e.g., Shirt Size Chart, Trouser Measurements)"
                value={form.title}
                onChange={(e) => handleTitleChange(formIdx, e.target.value)}
                className="flex-1 border-b border-neutral-300 pb-1 font-body text-sm font-medium bg-transparent focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => handleRemoveForm(formIdx)}
                className="font-body text-xs text-rose-600 hover:text-rose-800 uppercase tracking-wider"
              >
                Remove Form
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-3 font-body text-xs uppercase tracking-wider text-neutral-500 px-1">
                <div className="col-span-5">Attribute name</div>
                <div className="col-span-6">Attribute size</div>
                <div className="col-span-1"></div>
              </div>

              {form.rows.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="e.g. Chest / Length"
                      value={row.name}
                      onChange={(e) => handleRowChange(formIdx, rowIdx, 'name', e.target.value)}
                      className="w-full border border-neutral-300 bg-white p-2 font-body text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="e.g. 22 inches / 30 inches"
                      value={row.value}
                      onChange={(e) => handleRowChange(formIdx, rowIdx, 'value', e.target.value)}
                      className="w-full border border-neutral-300 bg-white p-2 font-body text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(formIdx, rowIdx)}
                      className="text-neutral-400 hover:text-rose-600 font-bold"
                      title="Remove row"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddRow(formIdx)}
                className="mt-2 font-body text-xs text-black underline underline-offset-4 hover:opacity-70"
              >
                + Add Attribute Row
              </button>
            </div>
          </div>
        ))}

        {currentForms.length < 3 ? (
          <button
            type="button"
            onClick={handleAddForm}
            className="w-full border-2 border-dashed border-neutral-300 py-3 font-body text-sm text-neutral-600 hover:border-black hover:text-black transition-colors"
          >
            + Add Attribute Form ({currentForms.length}/3)
          </button>
        ) : (
          <p className="font-body text-xs text-neutral-400 text-center">Maximum limit of 3 attribute forms reached for this size.</p>
        )}
      </div>
    </div>
  );
}

function ProductFormModal({
  initial,
  onClose,
}: {
  initial: Product | null;
  onClose: () => void;
}) {
  const { createProduct, updateProduct, uploadImages } = useProductStore();
  const { addToast } = useUIStore();

  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [cost, setCost] = useState(initial ? String(initial.cost) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '');
  const [category, setCategory] = useState(initial?.category || CATEGORIES[0]);

  const initialCharts = useMemo(() => {
    if (!initial?.sizeCharts) return {};
    return typeof initial.sizeCharts === 'string' ? JSON.parse(initial.sizeCharts) : initial.sizeCharts;
  }, [initial]);

  const [sizeCharts, setSizeCharts] = useState<Record<string, SizeForm[]>>(initialCharts);
  const [existingImages, setExistingImages] = useState<string[]>(initial?.images || []);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const stagedPreviews = useMemo(() => stagedFiles.map((f) => URL.createObjectURL(f)), [stagedFiles]);
  const totalImages = existingImages.length + stagedFiles.length;

  const addFiles = (fileList: FileList) => {
    const incoming = Array.from(fileList).slice(0, 10 - totalImages);
    setStagedFiles((prev) => [...prev, ...incoming].slice(0, 10 - existingImages.length));
  };

  const removeExisting = (idx: number) => setExistingImages((imgs) => imgs.filter((_, i) => i !== idx));
  const removeStaged = (idx: number) => setStagedFiles((files) => files.filter((_, i) => i !== idx));

  const canSave = title.trim() && Number(price) > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);

    let uploadedUrls: string[] = [];
    if (stagedFiles.length > 0) {
      uploadedUrls = await uploadImages(stagedFiles);
    }
    const images = [...existingImages, ...uploadedUrls].slice(0, 10);

    const payload = {
      title: title.trim(),
      description,
      price: Number(price),
      cost: Number(cost) || 0,
      stock: Number(stock) || 0,
      category,
      images,
      sizeCharts,
    };

    const result = initial ? await updateProduct(initial.id, payload) : await createProduct(payload);

    setSaving(false);
    if (!result.success) {
      addToast(result.error || 'Could not save the product.', 'error');
      return;
    }
    addToast(initial ? 'Product updated' : 'Product added', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <h3 className="font-display text-xl">{initial ? 'Edit product' : 'Add product'}</h3>
          <button onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">
              Images — {totalImages}/10
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {existingImages.map((src, i) => (
                <div key={`existing-${i}`} className="relative w-16 h-20 border border-neutral-300">
                  <img src={`${UPLOADS_BASE}${src}`} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              {stagedPreviews.map((src, i) => (
                <div key={`staged-${i}`} className="relative w-16 h-20 border border-neutral-300">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] text-center py-0.5">new</span>
                  <button
                    type="button"
                    onClick={() => removeStaged(i)}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              {totalImages < 10 && (
                <label className="w-16 h-20 border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 cursor-pointer hover:border-black hover:text-black">
                  <ImagePlus size={18} />
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && addFiles(e.target.files)} />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-neutral-300 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div>
            <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-neutral-300 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">Price (Rs)</label>
              <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-neutral-300 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">Cost price (Rs)</label>
              <input type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full border border-neutral-300 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">Stock</label>
              <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-neutral-300 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-neutral-300 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <SizeChartsEditor sizeCharts={sizeCharts} onChange={setSizeCharts} />

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <button type="button" onClick={onClose} className="px-4 py-2 font-body text-sm text-neutral-600 hover:text-black">Cancel</button>
            <button type="submit" disabled={!canSave || saving} className="px-5 py-2 bg-black text-white font-body text-sm disabled:opacity-40 hover:bg-neutral-800">
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Sale modal                                                             */
/* ---------------------------------------------------------------------- */

function SaleModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { setSale } = useProductStore();
  const { addToast } = useUIStore();
  const [sale, setSaleState] = useState<Sale>(product.sale);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await setSale(product.id, sale);
    setSaving(false);
    addToast('Sale settings saved', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h3 className="font-display text-xl">Sale — {product.title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-black"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="px-6 py-5">
          <label className="flex items-center gap-2 mb-4 font-body text-sm">
            <input type="checkbox" checked={sale.active} onChange={(e) => setSaleState({ ...sale, active: e.target.checked })} className="w-4 h-4" />
            Put this product on sale
          </label>

          {sale.active && (
            <>
              <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">Sale price (Rs)</label>
              <input
                type="number"
                min="0"
                value={sale.price ?? ''}
                onChange={(e) => setSaleState({ ...sale, price: e.target.value === '' ? null : Number(e.target.value) })}
                placeholder={`Regular price: ${rs(product.price)}`}
                className="w-full border border-neutral-300 px-3 py-2 mb-4 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />

              <div className="flex gap-4 font-body text-sm mb-4">
                <label className="flex items-center gap-1.5">
                  <input type="radio" checked={sale.unlimited} onChange={() => setSaleState({ ...sale, unlimited: true })} /> Unlimited
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="radio" checked={!sale.unlimited} onChange={() => setSaleState({ ...sale, unlimited: false })} /> Specific dates
                </label>
              </div>

              {!sale.unlimited && (
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">Start date</label>
                    <input type="date" value={sale.startDate || ''} onChange={(e) => setSaleState({ ...sale, startDate: e.target.value })} className="w-full border border-neutral-300 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">End date</label>
                    <input type="date" value={sale.endDate || ''} onChange={(e) => setSaleState({ ...sale, endDate: e.target.value })} className="w-full border border-neutral-300 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 font-body text-sm text-neutral-600 hover:text-black">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-black text-white font-body text-sm hover:bg-neutral-800 disabled:opacity-40">
              {saving ? 'Saving…' : 'Save sale settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Main dashboard                                                         */
/* ---------------------------------------------------------------------- */

export default function AdminDashboard() {
  const fetchSubmissions = async () => {
  try {
    const res = await fetch('http://localhost:5001/api/submissions');
    const data = await res.json();
    if (res.ok) setSubmissions(data);
  } catch (err) {
    console.error('Could not load submissions:', err);
  }
};

  const { user, logout } = useAuthStore();
  const { addToast } = useUIStore();

  const { products, fetchProducts, deleteProduct, toggleHide } = useProductStore();
  const { orders, fetchAllOrders, updateOrderStatus } = useOrderStore();
  const { users, fetchUsers, deleteUser, deleteUsersBulk } = useUserStore();

  const [submissions, setSubmissions] = useState<any[]>([]);
  

  const [tab, setTab] = useState<(typeof NAV)[number]['key']>('overview');
  const [productModal, setProductModal] = useState<{ mode: 'add' | 'edit'; product: Product | null } | null>(null);
  const [saleModal, setSaleModal] = useState<Product | null>(null);

  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | OrderStatus>('All');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [expandedAdminOrder, setExpandedAdminOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchAllOrders();
    fetchProducts();
    fetchUsers();
    fetchSubmissions();
  }, []);

  const activeOrders = orders.filter((o) => o.orderStatus !== 'Cancelled');
  const totalRevenue = activeOrders.reduce((s, o) => s + o.totalAmount, 0);
  const estimatedProfit = activeOrders.reduce((sum, o) => {
    const orderCost = o.items.reduce((s, item) => {
      const product = products.find((p) => p.id === item.productId);
      return s + (product?.cost || 0) * item.qty;
    }, 0);
    return sum + (o.totalAmount - orderCost);
  }, 0);
  const lowStock = products.filter((p) => !p.hidden && p.stock <= 5);

  const filteredProducts = products.filter((p) => p.title.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredOrders = orders.filter(
    (o) =>
      (orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter) &&
      ((o.customerName || '').toLowerCase().includes(orderSearch.toLowerCase()) || o.id.toLowerCase().includes(orderSearch.toLowerCase()))
  );
  const filteredUsers = users.filter(
    (u) => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Remove this product? This cannot be undone.')) return;
    const res = await deleteProduct(id);
    addToast(res.success ? 'Product removed' : res.error || 'Could not remove product', res.success ? 'success' : 'error');
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    const res = await updateOrderStatus(id, status);
    if (!res.success) addToast(res.error || 'Could not update order status', 'error');
  };

  const toggleSelectUser = (id: string) =>
    setSelectedUsers((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));

  const handleDeleteSelectedUsers = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Delete ${selectedUsers.length} user(s) and all their order history? This cannot be undone.`)) return;
    const res = await deleteUsersBulk(selectedUsers);
    addToast(res.success ? 'Users deleted' : res.error || 'Could not delete users', res.success ? 'success' : 'error');
    setSelectedUsers([]);
  };

  const exportOrdersCsv = () => {
    const header = 'Order ID,Customer,Email,Total,Status,Date\n';
    const rows = filteredOrders
      .map((o) => [o.id, o.customerName, o.customerEmail, o.totalAmount, o.orderStatus, o.orderDate].join(','))
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zainoor-orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSubmission = async (id: string) => {
  if (!window.confirm('Delete this inquiry?')) return;
  try {
    const res = await fetch(`http://localhost:5001/api/submissions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      addToast('Submission deleted', 'success');
    }
  } catch {
    addToast('Could not delete submission', 'error');
  }
};

  return (
    <div className="min-h-screen bg-neutral-50 text-black flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-56 shrink-0 border-r border-neutral-200 bg-white flex-col justify-between">
        <div>
          <div className="px-6 py-6 border-b border-neutral-200">
            <div className="font-display text-2xl tracking-[0.15em]">ZAINOOR</div>
            <div className="font-body text-[10px] tracking-[0.18em] uppercase text-neutral-400 mt-0.5">Admin</div>
          </div>
          <nav className="py-4">
            {NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-6 py-2.5 font-body text-sm border-l-2 ${
                  tab === key ? 'border-black text-black bg-neutral-50' : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                <Icon size={16} strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="px-6 py-5 border-t border-neutral-200">
          <div className="font-body text-xs text-neutral-500 mb-2 truncate">{user?.email}</div>
          <button onClick={logout} className="flex items-center gap-2 font-body text-sm text-neutral-500 hover:text-black">
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-neutral-200 flex overflow-x-auto">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-3 font-body text-xs whitespace-nowrap border-b-2 ${
              tab === key ? 'border-black text-black' : 'border-transparent text-neutral-500'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 px-5 md:px-10 py-6 md:py-8 mt-12 md:mt-0 max-w-6xl">
        {tab === 'overview' && (
          <section>
            <h1 className="font-display text-3xl mb-6">Overview</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-neutral-200 p-5">
                <div className="font-body text-[11px] tracking-[0.14em] uppercase text-neutral-500 mb-2">Revenue</div>
                <div className="font-display text-3xl">{rs(totalRevenue)}</div>
              </div>
              <div className="bg-white border border-neutral-200 p-5">
                <div className="font-body text-[11px] tracking-[0.14em] uppercase text-neutral-500 mb-2">Est. profit</div>
                <div className="font-display text-3xl flex items-center gap-1.5">
                  <TrendingUp size={18} className="text-emerald-700" /> {rs(estimatedProfit)}
                </div>
                <div className="font-body text-xs text-neutral-400 mt-1">based on current product cost prices</div>
              </div>
              <div className="bg-white border border-neutral-200 p-5">
                <div className="font-body text-[11px] tracking-[0.14em] uppercase text-neutral-500 mb-2">Orders</div>
                <div className="font-display text-3xl">{activeOrders.length}</div>
              </div>
              <div className="bg-white border border-neutral-200 p-5">
                <div className="font-body text-[11px] tracking-[0.14em] uppercase text-neutral-500 mb-2">Users</div>
                <div className="font-display text-3xl">{users.length}</div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-5 max-w-lg">
              <h3 className="font-body text-xs tracking-[0.12em] uppercase text-neutral-500 mb-4">Low stock</h3>
              {lowStock.length === 0 ? (
                <p className="font-body text-sm text-neutral-400">Nothing running low.</p>
              ) : (
                <div className="space-y-3">
                  {lowStock.map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="font-body text-sm truncate">{p.title}</span>
                      <span className="font-body text-xs text-rose-700 flex items-center gap-1">
                        <AlertTriangle size={12} /> {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {tab === 'orders' && (
          <section>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <h1 className="font-display text-3xl">Orders</h1>
              <button onClick={exportOrdersCsv} className="flex items-center gap-2 border border-neutral-300 px-3 py-2 font-body text-sm hover:border-black">
                <Download size={14} /> Export CSV
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-400" />
                <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search customer or order ID" className="border border-neutral-300 pl-8 pr-3 py-2 font-body text-sm w-64 focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value as any)} className="border border-neutral-300 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black">
                <option>All</option>
                {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="bg-white border border-neutral-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 font-body text-[11px] tracking-[0.1em] uppercase text-neutral-500">
                    <th className="p-3 text-left">Order</th>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <React.Fragment key={o.id}>
                      <tr className="border-b border-neutral-100 font-body">
                        <td className="p-3 font-mono text-xs whitespace-nowrap">{o.id}</td>
                        <td className="p-3">
                          <div className="font-medium">{o.customerName || 'Guest / Unknown'}</div>
                          <div className="text-xs text-neutral-500">{o.customerEmail}</div>
                          <div className="text-xs text-neutral-400">Phone: {(o as any).customerPhone || 'N/A'}</div>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap font-semibold">{rs(o.totalAmount)}</td>
                        <td className="p-3 whitespace-nowrap text-xs text-neutral-600">{o.orderDate}</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <select
                              value={o.orderStatus}
                              onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                              className="border border-neutral-300 text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                            >
                              {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                            </select>
                            {o.orderStatus === 'Cancelled' && (
                              <div className="text-[10px] text-rose-700 font-medium uppercase tracking-wider">
                                Cancelled by {o.cancelledBy === 'user' ? 'User' : 'Admin'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setExpandedAdminOrder(expandedAdminOrder === o.id ? null : o.id)}
                            className="text-xs font-semibold underline text-neutral-700 hover:text-black"
                          >
                            {expandedAdminOrder === o.id ? 'Hide Details' : 'View Details'}
                          </button>
                        </td>
                      </tr>

                      {expandedAdminOrder === o.id && (
                        <tr className="bg-neutral-50 border-b border-neutral-200">
                          <td colSpan={6} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body text-xs">
                              {/* Customer & Address */}
                              <div className="space-y-2">
                                <h4 className="font-semibold uppercase tracking-wider text-black mb-1">Customer & Shipping</h4>
                                <p><strong>Name:</strong> {o.customerName || 'N/A'}</p>
                                <p><strong>Email:</strong> {o.customerEmail || 'N/A'}</p>
                                <p><strong>Phone:</strong> {(o as any).customerPhone || 'N/A'}</p>
                                <p className="pt-2"><strong>Shipping Address:</strong><br />{o.shippingAddress || 'No address provided'}</p>
                              </div>

                              {/* Items List */}
                              <div className="space-y-2 md:col-span-1">
                                <h4 className="font-semibold uppercase tracking-wider text-black mb-1">Order Items</h4>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                                  {(o.items || []).map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-2 border border-neutral-200">
                                      <div>
                                        <p className="font-medium text-black">{item.name || item.title || 'Product'}</p>
                                        <p className="text-[10px] text-neutral-500">Qty: {item.qty} {item.size ? `/ Size: ${item.size}` : ''}</p>
                                      </div>
                                      <span className="font-semibold">{rs(item.price * item.qty)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Tracking History */}
                              <div className="space-y-2">
                                <h4 className="font-semibold uppercase tracking-wider text-black mb-1">Tracking Log</h4>
                                <div className="space-y-1 bg-white p-3 border border-neutral-200 max-h-40 overflow-y-auto">
                                  {((o as any).statusHistory || []).map((h: any, hIdx: number) => (
                                    <div key={hIdx} className="flex justify-between text-[11px] border-b border-neutral-100 pb-1 last:border-0">
                                      <span className="font-medium text-black">{h.status}</span>
                                      <span className="text-neutral-400">{new Date(h.at).toLocaleString()}</span>
                                    </div>
                                  ))}
                                  {(!((o as any).statusHistory) || (o as any).statusHistory.length === 0) && (
                                    <span className="text-neutral-400">No history available</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-neutral-400 font-body text-sm">No orders match this search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'products' && (
          <section>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <h1 className="font-display text-3xl">Products</h1>
              <button onClick={() => setProductModal({ mode: 'add', product: null })} className="flex items-center gap-2 bg-black text-white font-body text-sm px-4 py-2 hover:bg-neutral-800">
                <Plus size={15} /> Add product
              </button>
            </div>

            <div className="relative mb-5 w-64">
              <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-400" />
              <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products" className="border border-neutral-300 pl-8 pr-3 py-2 font-body text-sm w-full focus:outline-none focus:ring-2 focus:ring-black" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((p) => (
                <div key={p.id} className={`bg-white border border-neutral-200 flex flex-col ${p.hidden ? 'opacity-50' : ''}`}>
                  <div className="relative h-56 bg-neutral-100">
                    {p.images[0] && <img src={`${UPLOADS_BASE}${p.images[0]}`} alt={p.title} className="w-full h-full object-cover" />}
                    {p.hidden && <span className="absolute top-2 left-2 bg-black text-white text-[10px] uppercase tracking-widest px-2 py-0.5 font-body">Hidden</span>}
                    {p.stock === 0 && !p.hidden && <span className="absolute top-2 right-2 bg-rose-700 text-white text-[10px] uppercase tracking-widest px-2 py-0.5 font-body">Out of stock</span>}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="font-body text-[10px] tracking-[0.12em] uppercase text-neutral-400">{p.category}</div>
                    <h3 className="font-display text-lg leading-tight">{p.title}</h3>
                    <div className="font-display text-base">
                      {p.sale.active ? (
                        <span className="flex items-baseline gap-1.5">
                          <span className="line-through text-neutral-400 text-sm">{rs(p.price)}</span>
                          {rs(p.sale.price || 0)}
                        </span>
                      ) : rs(p.price)}
                    </div>
                    <div className="font-body text-xs text-neutral-400">{p.stock} in stock · {p.unitsSold} sold</div>

                    <div className="flex items-center gap-1 mt-auto pt-3 border-t border-neutral-100">
                      <button onClick={() => setProductModal({ mode: 'edit', product: p })} className="flex-1 font-body text-xs text-neutral-600 hover:text-black py-1.5">Edit</button>
                      <button onClick={() => setSaleModal(p)} className="flex-1 flex items-center justify-center gap-1 font-body text-xs text-neutral-600 hover:text-black py-1.5">
                        <Tag size={12} /> Sale
                      </button>
                      <button onClick={() => toggleHide(p.id)} className="p-1.5 text-neutral-500 hover:text-black" title={p.hidden ? 'Unhide' : 'Hide'}>
                        {p.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-neutral-500 hover:text-rose-700" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16 text-neutral-400 font-body text-sm">No products yet — add your first one.</div>
              )}
            </div>
          </section>
        )}

        {tab === 'users' && (
          <section>
            <h1 className="font-display text-3xl mb-6">Users</h1>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-400" />
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users" className="border border-neutral-300 pl-8 pr-3 py-2 font-body text-sm w-64 focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              {selectedUsers.length > 0 && (
                <button onClick={handleDeleteSelectedUsers} className="flex items-center gap-2 border border-rose-300 text-rose-700 px-3 py-2 font-body text-sm hover:bg-rose-50">
                  <Trash2 size={14} /> Delete {selectedUsers.length} selected
                </button>
              )}
            </div>

            <div className="bg-white border border-neutral-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 font-body text-[11px] tracking-[0.1em] uppercase text-neutral-500">
                    <th className="p-3 text-left">
                      <button onClick={() => setSelectedUsers(selectedUsers.length === filteredUsers.length ? [] : filteredUsers.map((u) => u.id))}>
                        <CheckSquare size={15} />
                      </button>
                    </th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-right">Orders</th>
                    <th className="p-3 text-right">Total spent</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const totalSpent = u.orders.filter((o) => o.orderStatus !== 'Cancelled').reduce((s, o) => s + o.totalAmount, 0);
                    return (
                      <tr key={u.id} className="border-b border-neutral-100 font-body">
                        <td className="p-3">
                          <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggleSelectUser(u.id)} />
                        </td>
                        <td className="p-3">
                          <div>{u.fullName}</div>
                          <div className="text-xs text-neutral-400">{u.email}</div>
                        </td>
                        <td className="p-3">{u.phone}</td>
                        <td className="p-3 text-right">{u.orders.length}</td>
                        <td className="p-3 text-right whitespace-nowrap">{rs(totalSpent)}</td>
                        <td className="p-3">
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Delete ${u.fullName} and their order history?`)) return;
                              const res = await deleteUser(u.id);
                              addToast(res.success ? 'User deleted' : res.error || 'Could not delete user', res.success ? 'success' : 'error');
                            }}
                            className="font-body text-xs text-neutral-500 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-neutral-400 font-body text-sm">No users match this search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {tab === 'submissions' && (
  <section>
    <h1 className="font-display text-3xl mb-6">Inquiries & Submissions</h1>
    <div className="space-y-4">
      {submissions.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-8 text-center text-neutral-400 font-body text-sm">
          No form submissions received yet.
        </div>
      ) : (
        submissions.map((s) => (
          <div key={s.id} className="bg-white border border-neutral-200 p-5 font-body space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="font-semibold text-sm block text-black">{s.name}</span>
                <span className="text-xs text-neutral-400">{s.email}</span>
              </div>
              <div className="text-right">
                <span className="bg-neutral-100 text-neutral-800 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 inline-block mb-1">
                  {s.subject}
                </span>
                <span className="text-xs text-neutral-400 block">
                  {new Date(s.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-sm text-neutral-700 whitespace-pre-line bg-neutral-50 p-3 border border-neutral-100">
              {s.message}
            </p>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => handleDeleteSubmission(s.id)}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium uppercase tracking-wider flex items-center gap-1"
              >
                <Trash2 size={13} /> Delete Inquiry
              </button>
            </div>
          </div>
        ))
            )}
          </div>
        </section>
      )}
      </main>

      {productModal && (
        <ProductFormModal
          initial={productModal.mode === 'edit' ? productModal.product : null}
          onClose={() => setProductModal(null)}
        />
      )}
      {saleModal && <SaleModal product={saleModal} onClose={() => setSaleModal(null)} />}
    </div>
  );
}