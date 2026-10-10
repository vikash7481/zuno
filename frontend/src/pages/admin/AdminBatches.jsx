import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { CalendarDays, AlertTriangle, CheckCircle2, Search } from 'lucide-react';

export default function AdminBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expiringOnly, setExpiringOnly] = useState(false);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (expiringOnly) params.set('expiringSoon', 'true');

      const res = await api.get(`/inventory/batches?${params.toString()}`);
      setBatches(res.data.batches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [expiringOnly]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Traceability & Shelf Life</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">FEFO Batches & Expiry Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">First-Expiry, First-Out (FEFO) batch allocation prevents inventory spoilage</p>
        </div>

        <label className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-cream-300 shadow-sm text-xs font-bold text-charcoal-800 cursor-pointer">
          <input
            type="checkbox"
            checked={expiringOnly}
            onChange={(e) => setExpiringOnly(e.target.checked)}
            className="text-brand-700 rounded"
          />
          <span>Show Batches Expiring in &lt;30 Days</span>
        </label>
      </div>

      <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-cream-300">
            <tr>
              <th className="py-3 px-4">Batch Number</th>
              <th className="py-3 px-4">SKU & Item Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Remaining Units</th>
              <th className="py-3 px-4">Mfg Date</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4">Shelf Status</th>
              <th className="py-3 px-4 text-right">Quality Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {batches.map((batch) => {
              const daysLeft = Math.round(
                (new Date(batch.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
              );
              const isExpired = daysLeft <= 0;
              const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;

              return (
                <tr key={batch._id} className="hover:bg-cream-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-brand-900">
                    {batch.batchNumber}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-charcoal-900 block">{batch.itemName}</span>
                    <span className="text-[11px] text-gray-400 font-mono">{batch.sku}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="capitalize px-2 py-0.5 rounded-full bg-cream-200 text-charcoal-800 text-[10px] font-bold">
                      {batch.type?.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold text-brand-950">
                    {batch.quantityRemaining} / {batch.quantityReceived} {batch.unit}
                  </td>

                  <td className="py-3 px-4 text-gray-500">
                    {new Date(batch.mfgDate).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 font-bold text-charcoal-900">
                    {new Date(batch.expiryDate).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4">
                    {isExpired ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        Expired ({Math.abs(daysLeft)}d ago)
                      </span>
                    ) : isExpiringSoon ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                        Expiring in {daysLeft} days
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                        Fresh ({daysLeft} days left)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        batch.qualityStatus === 'passed'
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {batch.qualityStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
