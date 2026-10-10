import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { Factory, Plus, CheckCircle2, AlertTriangle, ArrowRight, X, Sparkles, ShieldCheck } from 'lucide-react';

export default function AdminProduction() {
  const [recipes, setRecipes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('batches'); // 'batches' | 'recipes'
  const { success, error: notifyError } = useNotification();

  // Plan Batch modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planData, setPlanData] = useState({ recipeId: '', plannedOutputUnits: 200 });

  // Complete Batch modal
  const [completingBatch, setCompletingBatch] = useState(null);
  const [completionData, setCompletionData] = useState({
    actualOutputUnits: 200,
    processingLossQty: 0.5,
    qualityStatus: 'passed',
    inspectionNotes: 'Aroma, crispness, and moisture levels meet premium Zuno standards'
  });

  const fetchProductionData = async () => {
    setLoading(true);
    try {
      const [recRes, batRes] = await Promise.all([
        api.get('/production/recipes'),
        api.get('/production/batches')
      ]);
      setRecipes(recRes.data.recipes || []);
      setBatches(batRes.data.batches || []);
      if (!planData.recipeId && recRes.data.recipes?.length) {
        setPlanData(prev => ({ ...prev, recipeId: recRes.data.recipes[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionData();
  }, []);

  const handlePlanBatch = async (e) => {
    e.preventDefault();
    try {
      await api.post('/production/batches', planData);
      success('Production batch planned! You can now issue raw materials to roasting.');
      setShowPlanModal(false);
      fetchProductionData();
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleIssueMaterials = async (batchId) => {
    try {
      await api.post(`/production/batches/${batchId}/issue-materials`);
      success('Raw makhana and packaging materials deducted from warehouse inventory and issued to floor.');
      fetchProductionData();
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleCompleteBatchSubmit = async (e) => {
    e.preventDefault();
    if (!completingBatch) return;

    try {
      await api.post(`/production/batches/${completingBatch._id}/complete`, completionData);
      success('Production batch completed! Finished packaged goods added to sellable inventory.');
      setCompletingBatch(null);
      fetchProductionData();
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Manufacturing & Processing</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">Production & Roasting Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Bill of materials, raw material issue, roasting loss, and quality inspection</p>
        </div>

        <button
          onClick={() => setShowPlanModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Plan Production Batch
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cream-300 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'batches' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-400 hover:text-charcoal-900'
          }`}
        >
          <Factory className="w-4 h-4" /> Active Production Batches ({batches.length})
        </button>

        <button
          onClick={() => setActiveTab('recipes')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'recipes' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-400 hover:text-charcoal-900'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Recipes & Bill of Materials (BOM) ({recipes.length})
        </button>
      </div>

      {/* Tab: Batches */}
      {activeTab === 'batches' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-cream-300">
              <tr>
                <th className="py-3 px-4">Batch Code</th>
                <th className="py-3 px-4">Recipe & Product</th>
                <th className="py-3 px-4">Planned Output</th>
                <th className="py-3 px-4">Actual Yield</th>
                <th className="py-3 px-4">Production Status</th>
                <th className="py-3 px-4 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {batches.map((batch) => (
                <tr key={batch._id} className="hover:bg-cream-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-brand-900">
                    {batch.batchCode}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-charcoal-900 block">{batch.recipe?.name || 'Roasting Recipe'}</span>
                    <span className="text-[11px] text-gray-500 font-mono">SKU: {batch.variantSku}</span>
                  </td>

                  <td className="py-3 px-4 font-bold text-charcoal-900">
                    {batch.plannedOutputUnits} packets
                  </td>

                  <td className="py-3 px-4">
                    {batch.actualOutputUnits ? (
                      <span className="font-bold text-brand-700">
                        {batch.actualOutputUnits} pkts ({batch.actualYieldPercent}%)
                      </span>
                    ) : (
                      <span className="text-gray-400">In process</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        batch.status === 'completed'
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : batch.status === 'materials_issued'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-cream-200 text-charcoal-800'
                      }`}
                    >
                      {batch.status?.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {batch.status === 'planned' && (
                      <button
                        onClick={() => handleIssueMaterials(batch._id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-charcoal-900 text-xs font-bold transition shadow-sm"
                      >
                        Issue Materials
                      </button>
                    )}

                    {batch.status === 'materials_issued' && (
                      <button
                        onClick={() => {
                          setCompletingBatch(batch);
                          setCompletionData(prev => ({ ...prev, actualOutputUnits: batch.plannedOutputUnits }));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition shadow-sm"
                      >
                        Quality Check & Complete
                      </button>
                    )}

                    {batch.status === 'completed' && (
                      <span className="text-xs font-bold text-brand-700 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Stock Received
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Recipes */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((rec) => (
            <div key={rec._id} className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-950">{rec.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">Target SKU: {rec.variantSku} ({rec.targetPackSize})</p>
                </div>
                <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full border border-brand-200">
                  Yield: {rec.batchSizeYieldUnits} Units
                </span>
              </div>

              {/* Bill of materials breakdown */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-charcoal-900 block uppercase tracking-wider text-[10px] text-gray-400">
                  Bill of Materials (BOM) Requirements:
                </span>
                <div className="bg-cream-100 p-3 rounded-xl border border-cream-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Raw Makhana Kernels:</span>
                    <strong className="font-mono">{rec.rawMaterials?.[0]?.requiredQty} {rec.rawMaterials?.[0]?.unit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cold-Pressed Olive Oil:</span>
                    <strong className="font-mono">{rec.ingredients?.[0]?.requiredQty} {rec.ingredients?.[0]?.unit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Seasoning Blend:</span>
                    <strong className="font-mono">{rec.flavours?.[0]?.requiredQty} {rec.flavours?.[0]?.unit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Nitrogen Barrier Pouches:</span>
                    <strong className="font-mono">{rec.packagingMaterials?.[0]?.requiredQty} {rec.packagingMaterials?.[0]?.unit}</strong>
                  </div>
                  <div className="flex justify-between text-gray-500 pt-1 border-t border-cream-200">
                    <span>Expected Processing Loss:</span>
                    <span className="font-semibold text-amber-700">{rec.expectedProcessingLossPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-cream-200 leading-relaxed">
                <strong>Roasting Parameters:</strong> {rec.roastingTemperatureC}°C for {rec.roastingTimeMinutes} minutes. {rec.instructions}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Batch Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-cream-200">
              <h3 className="font-serif text-lg font-bold text-brand-950">Plan Production Batch</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlanBatch} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Select Recipe / BOM *</label>
                <select
                  required
                  value={planData.recipeId}
                  onChange={(e) => setPlanData({ ...planData, recipeId: e.target.value })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                >
                  {recipes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} (Std Yield: {r.batchSizeYieldUnits} units)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Planned Output Units (Packets) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={planData.plannedOutputUnits}
                  onChange={(e) => setPlanData({ ...planData, plannedOutputUnits: Number(e.target.value) })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold"
                >
                  Plan Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Batch Modal */}
      {completingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-cream-200">
              <h3 className="font-serif text-lg font-bold text-brand-950">
                Quality Inspection & Stock Receipt
              </h3>
              <button onClick={() => setCompletingBatch(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Batch Code: <strong className="font-mono text-brand-900">{completingBatch.batchCode}</strong> • Planned: {completingBatch.plannedOutputUnits} units
            </p>

            <form onSubmit={handleCompleteBatchSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Actual Passed Output Units *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={completionData.actualOutputUnits}
                  onChange={(e) => setCompletionData({ ...completionData, actualOutputUnits: Number(e.target.value) })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Processing Loss (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={completionData.processingLossQty}
                  onChange={(e) => setCompletionData({ ...completionData, processingLossQty: Number(e.target.value) })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Quality Inspection Status *</label>
                <select
                  value={completionData.qualityStatus}
                  onChange={(e) => setCompletionData({ ...completionData, qualityStatus: e.target.value })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl font-bold"
                >
                  <option value="passed">Passed (Approved for Customer Sale)</option>
                  <option value="failed">Failed (Quarantine / Write-off)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Inspection Tasting Notes</label>
                <input
                  type="text"
                  value={completionData.inspectionNotes}
                  onChange={(e) => setCompletionData({ ...completionData, inspectionNotes: e.target.value })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setCompletingBatch(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold"
                >
                  Accept & Add To Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
