import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { socket } from '@/lib/socket';

const tabs = [
  { id: 'orders', label: 'My Orders' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'affiliate', label: 'Affiliate' },
  { id: 'settings', label: 'Settings' },
];

const API_BASE = 'http://localhost:5001/api';

// Once an order reaches one of these stages, the customer can no longer self-cancel.
const CANCELLABLE_STATUSES = ['Pending', 'In Progress', 'Sent for Packing'];

interface OrderItem {
  name: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
} 

interface StatusEvent {
  status: string;
  at: string;
}

interface Order {
  id: string; // Matches backend primary key column
  orderDate: string;
  orderTime: string;
  orderStatus: string;
  shippingAddress: string;
  totalAmount: number;
  items: OrderItem[];
  statusHistory?: StatusEvent[];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: 'bg-[#FFF3CD] text-[#856404]',
    'In Progress': 'bg-[#D1ECF1] text-[#0C5460]',
    'Sent for Packing': 'bg-[#D1ECF1] text-[#0C5460]',
    Packed: 'bg-[#D1ECF1] text-[#0C5460]',
    'Out for Delivery': 'bg-[#CFE2FF] text-[#084298]',
    Delivered: 'bg-black text-white',
    'Delivery Unsuccessful': 'bg-[#F8D7DA] text-[#721C24]',
    Cancelled: 'bg-[#F8D7DA] text-[#721C24]',
  };
  return (
    <span className={`font-body text-xs uppercase tracking-wider px-3 py-1 ${styles[status] || 'bg-[#EFEFEF] text-[#424242]'}`}>
      {status}
    </span>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateProfile } = useAuthStore();
  const { addToast } = useUIStore();
  const currentTab = location.pathname.split('/').pop() || 'orders';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Load this user's real order history
  useEffect(() => {
    if (!user?.id) return;
    setLoadingOrders(true);
    fetch(`http://localhost:5001/api/orders/user/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingOrders(false);
      });
  }, [user]);

  // Live status updates — if the admin changes a status while this page is open,
  // it updates instantly without a refresh.
  useEffect(() => {
    const onStatusUpdated = (payload: { id: string; orderStatus: string; statusHistory: StatusEvent[] }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === payload.id ? { ...o, orderStatus: payload.orderStatus, statusHistory: payload.statusHistory } : o
        )
      );
    };
    socket.on('order:statusUpdated', onStatusUpdated);
    return () => {
      socket.off('order:statusUpdated', onStatusUpdated);
    };
  }, []);

  const handleTabChange = (tabId: string) => {
    navigate(`/dashboard/${tabId}`);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile(formData);
    setSavingProfile(false);
    addToast(res.success ? 'Profile updated' : res.error || 'Could not update profile', res.success ? 'success' : 'error');
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        addToast(body.message || 'Could not cancel order.', 'error');
        return;
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'Cancelled' } : o)));
      addToast('Order cancelled', 'success');
    } catch {
      addToast('Could not reach the server.', 'error');
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'orders':
        return (
          <div>
            <h2 className="font-display text-3xl mb-6">My Orders</h2>
            {loadingOrders ? (
              <p className="font-body text-[#424242]">Loading your orders…</p>
            ) : orders.length === 0 ? (
              <p className="font-body text-[#424242]">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-[#EFEFEF] p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <span className="font-body text-xs text-neutral-400 block uppercase tracking-wider">Order ID</span>
                        <span className="font-mono font-semibold text-sm">{order.id}</span>
                        <span className="font-body text-xs text-[#424242] ml-4">{order.orderDate}</span>
                      </div>
                      <StatusBadge status={order.orderStatus} />
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between font-body text-sm">
                          <span>{item.name} x{item.qty} {item.size ? `(${item.size})` : ''}</span>
                          <span>Rs. {(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#EFEFEF]">
                      <div className="flex gap-4">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          className="font-body text-sm text-[#424242] hover:text-black transition-colors"
                        >
                          {expandedOrder === order.id ? 'Hide tracking' : 'Track Order'}
                        </button>
                        {CANCELLABLE_STATUSES.includes(order.orderStatus) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="font-body text-sm text-[#721C24] hover:text-black transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                      <span className="font-body font-semibold">Rs. {order.totalAmount.toLocaleString()}</span>
                    </div>

                    {expandedOrder === order.id && (
                      <div className="mt-4 pt-4 border-t border-[#EFEFEF]">
                        <p className="font-body text-xs uppercase tracking-wider text-[#424242] mb-3">Tracking history</p>
                        <div className="space-y-2">
                          {(order.statusHistory || []).map((h, i) => (
                            <div key={i} className="flex justify-between font-body text-xs text-[#424242]">
                              <span>{h.status}</span>
                              <span>{new Date(h.at).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <p className="font-body text-xs text-[#424242] mt-3">Shipping to: {order.shippingAddress}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'addresses':
        return (
          <div>
            <h2 className="font-display text-3xl mb-6">Addresses</h2>
            <div className="border border-[#EFEFEF] p-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-body text-xs uppercase tracking-wider bg-black text-white px-2 py-0.5">Default</span>
                  <p className="font-body font-medium mt-3">{user?.name}</p>
                  <p className="font-body text-sm text-[#424242] mt-1">{user?.phone}</p>
                </div>
                <button className="font-body text-sm text-[#424242] hover:text-black">Edit</button>
              </div>
            </div>
            <button className="mt-4 font-body text-sm border border-black px-6 py-2 hover:bg-black hover:text-white transition-colors">
              + Add Address
            </button>
          </div>
        );

      case 'wishlist':
        return (
          <div>
            <h2 className="font-display text-3xl mb-6">Wishlist</h2>
            <p className="font-body text-[#424242]">Your wishlist is empty. Browse our collection to add items.</p>
          </div>
        );

      case 'affiliate':
        return (
          <div>
            <h2 className="font-display text-3xl mb-6">Affiliate Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="border border-[#EFEFEF] p-6 text-center">
                <span className="font-display text-3xl">Rs. 0</span>
                <p className="font-body text-xs text-[#424242] uppercase tracking-wider mt-1">Total Earnings</p>
              </div>
              <div className="border border-[#EFEFEF] p-6 text-center">
                <span className="font-display text-3xl">0</span>
                <p className="font-body text-xs text-[#424242] uppercase tracking-wider mt-1">Referrals</p>
              </div>
              <div className="border border-[#EFEFEF] p-6 text-center">
                <span className="font-display text-3xl">0</span>
                <p className="font-body text-xs text-[#424242] uppercase tracking-wider mt-1">Conversions</p>
              </div>
            </div>
            <div className="border border-[#EFEFEF] p-6">
              <h3 className="font-body font-semibold mb-2">Your Referral Link</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://zainoor.pk/ref/YOUR-CODE"
                  className="flex-1 border border-[#EFEFEF] px-4 py-2 font-body text-sm bg-[#EFEFEF]"
                />
                <button className="bg-black text-white font-body text-sm px-4 py-2 hover:bg-[#424242] transition-colors">
                  Copy
                </button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div>
            <h2 className="font-display text-3xl mb-6">Profile Settings</h2>
            <form onSubmit={handleSaveSettings} className="max-w-md space-y-6">
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-[#424242] mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border-b border-[#C1C1C1] py-3 font-body outline-none focus:border-black transition-colors bg-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-black text-white font-body font-medium text-sm uppercase px-8 py-3 hover:bg-[#424242] transition-colors disabled:opacity-50"
              >
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-[260px] bg-black text-white lg:min-h-screen lg:fixed lg:left-0 lg:top-0 lg:bottom-0 p-6 lg:p-10 lg:pt-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-[#424242] flex items-center justify-center font-body font-semibold text-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-body font-semibold text-sm">{user?.name}</p>
              <p className="font-body text-xs text-[#C1C1C1]">{user?.email}</p>
            </div>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`font-body text-sm py-3 px-3 lg:px-0 whitespace-nowrap transition-colors text-left ${
                  currentTab === tab.id
                    ? 'text-white lg:border-l-2 lg:border-[#FF0000] lg:pl-3'
                    : 'text-[#C1C1C1] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="font-body text-sm text-[#C1C1C1] hover:text-white transition-colors mt-8 hidden lg:block">
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-[260px] p-6 lg:p-10 pt-20 lg:pt-24">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}