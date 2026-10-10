import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import {
  Boxes,
  SlidersHorizontal,
  History,
  AlertTriangle,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('balances'); // 'balances' | 'movements'
  const [typeFilter, setTypeFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { success, error: notifyError } = useNotification();

  // Stock adjustment modal state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustment, setAdjustment] = useState({
    sku: '',
    quantityChange: 0,
    adjustmentType: 'physical',
    reason: ''
  });
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (lowStockOnly) params.set('lowStock', 'true');

      const [itemRes, movRes] = await Promise.all([
        api.get(`/inventory/items?${params.toString()}`),
        api.get('/inventory/movements?limit=40')
      ]);

      setItems(itemRes.data.items || []);
      setMovements(movRes.data.movements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [typeFilter, lowStockOnly]);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustment.reason.trim()) {
      notifyError('A clear audit reason is strictly mandatory for manual stock adjustments');
      return;
    }

    setAdjusting(true);
    try {
      await api.post('/inventory/adjust', adjustment);
      success('Inventory balance adjusted and movement logged to audit trail.');
      setShowAdjustModal(false);
      setAdjustment({ sku: '', quantityChange: 0, adjustmentType: 'physical', reason: '' });
      fetchInventory();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">First-Class Stock Engine</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">Inventory Balances & Movements</h1>
        </div>

        <button
          onClick={() => setShowAdjustModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <SlidersHorizontal className="w-4 h-4" /> Record Stock Adjustment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cream-300 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('balances')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'balances' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-400 hover:text-charcoal-900'
          }`}
        >
          <Boxes className="w-4 h-4" /> Current Warehouse Balances ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'movements' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-400 hover:text-charcoal-900'
          }`}
        >
          <History className="w-4 h-4" /> Audited Stock Movements Log ({movements.length})
        </button>
      </div>

      {/* Filter bar for balances */}
      {activeTab === 'balances' && (
        <div className="p-4 rounded-2xl bg-white border border-cream-300 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl font-medium text-charcoal-900 focus:outline-none"
            >
              <option value="">All Inventory Types</option>
              <option value="finished_goods">Finished Packaged Goods</option>
              <option value="raw_material">Raw Makhana Kernels</option>
              <option value="ingredient">Ingredients (Oils, Salts)</option>
              <option value="flavour">Flavouring Blends</option>
              <option value="packaging">Packaging & Nitrogen Pouches</option>
            </select>

            <label className="flex items-center gap-2 text-xs font-bold text-charcoal-800 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="text-brand-700 rounded"
              />
              <span>Show Low Stock Alerts Only</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab Content: Balances */}
      {activeTab === 'balances' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-cream-300">
              <tr>
                <th className="py-3 px-4">SKU & Item Name</th>
                <th className="py-3 px-4">Inventory Type</th>
                <th className="py-3 px-4">Physical Stock</th>
                <th className="py-3 px-4">Reserved Stock</th>
                <th className="py-3 px-4">Available To Sell</th>
                <th className="py-3 px-4">Damaged / Expired</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {items.map((item) => {
                const available = Math.max(0, item.physicalStock - item.reservedStock);
                const isLow = available <= item.reorderThreshold;

                return (
                  <tr key={item._id} className="hover:bg-cream-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-brand-900 block">{item.sku}</span>
                      <span className="text-charcoal-900 font-medium">{item.name}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-cream-200 text-charcoal-800 text-[10px] font-bold">
                        {item.type?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-charcoal-900">
                      {item.physicalStock} {item.unit}
                    </td>

                    <td className="py-3 px-4 text-amber-700 font-bold">
                      {item.reservedStock} {item.unit}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-serif text-sm font-bold ${
                          available <= 0
                            ? 'text-rose-600'
                            : isLow
                            ? 'text-amber-600'
                            : 'text-brand-700'
                        }`}
                      >
                        {available} {item.unit}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-500">
                      {item.damagedStock || 0} dmg • {item.expiredStock || 0} exp
                    </td>

                    <td className="py-3 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                          <AlertTriangle className="w-3 h-3" /> Reorder (&lt;{item.reorderThreshold})
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">&gt; {item.reorderThreshold} {item.unit}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustment(prev => ({ ...prev, sku: item.sku }));
                          setShowAdjustModal(true);
                        }}
                        className="text-xs font-bold text-brand-700 hover:text-brand-900 underline"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Audited Movements Log */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-cream-300">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Change</th>
                <th className="py-3 px-4">Prev → New Stock</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {movements.map((mov) => (
                <tr key={mov._id} className="hover:bg-cream-50 transition">
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(mov.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-brand-900">
                    {mov.sku}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-cream-200 text-charcoal-800 text-[10px] font-bold uppercase tracking-wider">
                      {mov.movementType?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold">
                    <span className={mov.quantityChange >= 0 ? 'text-brand-700' : 'text-rose-600'}>
                      {mov.quantityChange >= 0 ? `+${mov.quantityChange}` : mov.quantityChange} {mov.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-mono">
                    {mov.previousPhysicalStock} → {mov.newPhysicalStock}
                  </td>
                  <td className="py-3 px-4 text-charcoal-900">
                    {mov.reason}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {mov.performedByName || 'System'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-cream-200">
              <h3 className="font-serif text-lg font-bold text-brand-950">Manual Stock Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Target SKU *</label>
                <select
                  required
                  value={adjustment.sku}
                  onChange={(e) => setAdjustment({ ...adjustment, sku: e.target.value })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl font-mono"
                >
                  <option value="">-- Select SKU --</option>
                  {items.map((i) => (
                    <option key={i.sku} value={i.sku}>
                      {i.sku} — {i.name} (Current: {i.physicalStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Adjustment Type *</label>
                  <select
                    value={adjustment.adjustmentType}
                    onChange={(e) => setAdjustment({ ...adjustment, adjustmentType: e.target.value })}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  >
                    <option value="physical">Physical Count (+/-)</option>
                    <option value="damage">Damaged Units Write-off</option>
                    <option value="expired">Expired Units Write-off</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Quantity Change *</label>
                  <input
                    type="number"
                    required
                    placeholder="+10 or -5"
                    value={adjustment.quantityChange}
                    onChange={(e) => setAdjustment({ ...adjustment, quantityChange: e.target.value })}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Mandatory Audit Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Monthly physical audit count adjustment / transit seal broken"
                  value={adjustment.reason}
                  onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold"
                >
                  {adjusting ? 'Adjusting...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
