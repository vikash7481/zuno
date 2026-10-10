import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { Users, Plus, CheckCircle2, ShoppingCart, ArrowDownToLine, X, FileText } from 'lucide-react';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' | 'suppliers'
  const { success, error: notifyError } = useNotification();

  // Create PO modal
  const [showPOModal, setShowPOModal] = useState(false);
  const [poData, setPoData] = useState({
    supplierId: '',
    items: [
      {
        itemSku: 'RAW-MAKH-GRDA-KG',
        itemName: 'Bulk Raw Makhana Grade A (6 Suta)',
        itemType: 'raw_material',
        quantity: 200,
        unit: 'kg',
        unitCost: 520,
        taxPercent: 5,
        batchNumber: `MITHILA-2026-${Math.floor(100 + Math.random() * 900)}`
      }
    ],
    invoiceRef: 'INV-MITH-NEW',
    notes: 'Direct farm cooperative supply'
  });

  const fetchProcurement = async () => {
    setLoading(true);
    try {
      const [supRes, purRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/purchases')
      ]);
      setSuppliers(supRes.data.suppliers || []);
      setPurchases(purRes.data.purchases || []);
      if (!poData.supplierId && supRes.data.suppliers?.length) {
        setPoData(prev => ({ ...prev, supplierId: supRes.data.suppliers[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurement();
  }, []);

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      await api.post('/purchases', poData);
      success('Purchase order created successfully! Click "Receive Goods" upon arrival to add to stock.');
      setShowPOModal(false);
      fetchProcurement();
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleReceiveGoods = async (purchaseId) => {
    try {
      await api.post(`/purchases/${purchaseId}/receive`);
      success('Goods verified and raw material stock increased in warehouse inventory!');
      fetchProcurement();
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Procurement & Supply Chain</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">Suppliers & Purchase Orders</h1>
        </div>

        <button
          onClick={() => setShowPOModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Create Purchase Order
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cream-300 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'purchases' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-400 hover:text-charcoal-900'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Purchase Orders & Receipts ({purchases.length})
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'suppliers' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-400 hover:text-charcoal-900'
          }`}
        >
          <Users className="w-4 h-4" /> Supplier Directory & Payables ({suppliers.length})
        </button>
      </div>

      {/* Purchases List */}
      {activeTab === 'purchases' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-cream-300">
              <tr>
                <th className="py-3 px-4">PO Code & Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Items Procured</th>
                <th className="py-3 px-4">Total Cost</th>
                <th className="py-3 px-4">Goods Status</th>
                <th className="py-3 px-4 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {purchases.map((po) => (
                <tr key={po._id} className="hover:bg-cream-50 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-brand-900 block">{po.purchaseCode}</span>
                    <span className="text-[11px] text-gray-500">{new Date(po.createdAt).toLocaleDateString()}</span>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-charcoal-900">{po.supplierName}</p>
                    <p className="text-[11px] text-gray-500">{po.invoiceRef}</p>
                  </td>

                  <td className="py-3 px-4">
                    {po.items?.map((it, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="font-semibold text-charcoal-900">{it.itemName}</span>
                        <span className="block text-[11px] text-gray-500">
                          {it.quantity} {it.unit} @ ₹{it.unitCost}/{it.unit}
                        </span>
                      </div>
                    ))}
                  </td>

                  <td className="py-3 px-4 font-bold text-brand-950">
                    ₹{po.totalAmount}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        po.status === 'received'
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {po.status === 'ordered' ? (
                      <button
                        onClick={() => handleReceiveGoods(po._id)}
                        className="px-3 py-1.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-1.5 ml-auto shadow-sm transition"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5 text-gold-300" />
                        <span>Receive Goods</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-brand-700 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Stock Added
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suppliers List */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suppliers.map((sup) => (
            <div key={sup._id} className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-brand-950">{sup.name}</h3>
                  <p className="text-xs text-gray-500">{sup.companyName}</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                  Active
                </span>
              </div>

              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Contact:</strong> {sup.contactPerson} ({sup.phone})</p>
                <p><strong>GSTIN:</strong> {sup.gstin || 'N/A'}</p>
                <p className="text-[11px] text-gray-500">{sup.address}</p>
              </div>

              <div className="pt-2 border-t border-cream-200 flex justify-between items-center text-xs">
                <span className="text-gray-500">Payable Balance:</span>
                <span className="font-bold text-brand-900 font-serif text-sm">₹{sup.outstandingBalance || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-cream-200">
              <h3 className="font-serif text-lg font-bold text-brand-950">New Purchase Order</h3>
              <button onClick={() => setShowPOModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Select Supplier *</label>
                <select
                  required
                  value={poData.supplierId}
                  onChange={(e) => setPoData({ ...poData, supplierId: e.target.value })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                >
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.companyName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Item SKU *</label>
                  <input
                    type="text"
                    required
                    value={poData.items[0].itemSku}
                    onChange={(e) => {
                      const it = [...poData.items];
                      it[0].itemSku = e.target.value.toUpperCase();
                      setPoData({ ...poData, items: it });
                    }}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={poData.items[0].itemName}
                    onChange={(e) => {
                      const it = [...poData.items];
                      it[0].itemName = e.target.value;
                      setPoData({ ...poData, items: it });
                    }}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={poData.items[0].quantity}
                    onChange={(e) => {
                      const it = [...poData.items];
                      it[0].quantity = Number(e.target.value);
                      setPoData({ ...poData, items: it });
                    }}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    value={poData.items[0].unitCost}
                    onChange={(e) => {
                      const it = [...poData.items];
                      it[0].unitCost = Number(e.target.value);
                      setPoData({ ...poData, items: it });
                    }}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold"
                >
                  Create Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
