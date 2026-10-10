import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Package, Truck, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export default function OrdersHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Your Activity</span>
        <h1 className="font-serif text-3xl font-bold text-brand-950">Order History</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-cream-300 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mx-auto text-gray-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-900">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Explore our slow-roasted Himalayan salt, spicy peri peri, and jaggery caramel flavours today.
          </p>
          <Link
            to="/catalogue"
            className="inline-block px-6 py-2.5 rounded-full bg-brand-700 text-white text-xs font-bold shadow-sm"
          >
            Explore Makhana
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-5 rounded-2xl border border-cream-300 shadow-card hover:border-gold-300 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-cream-200 pb-3 text-xs">
                <div>
                  <span className="font-mono font-bold text-brand-900 text-sm">#{order.orderNumber}</span>
                  <p className="text-gray-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.orderStatus === 'delivered'
                        ? 'bg-brand-100 text-brand-800'
                        : order.orderStatus === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-gold-100 text-gold-800'
                    }`}
                  >
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                  <span className="font-serif text-base font-bold text-brand-950">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Items summary */}
              <div className="flex items-center justify-between text-xs gap-4">
                <div className="flex -space-x-2 overflow-hidden py-1">
                  {order.items.slice(0, 4).map((it, idx) => (
                    <img
                      key={idx}
                      src={it.image || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=80&q=80'}
                      alt={it.productName}
                      className="w-10 h-10 object-cover rounded-lg border-2 border-white bg-cream-200 shadow-sm"
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <span>Track & Receipt</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
