import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Search, Edit2, Archive, CheckCircle2, X, Package, Sparkles } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { success, error: notifyError } = useNotification();

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    shortDescription: '',
    description: '',
    images: ['https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80'],
    variants: [
      {
        sku: '',
        flavor: 'Classic Salt',
        packSize: '100g Pouch',
        weightGrams: 100,
        mrp: 149,
        sellingPrice: 129,
        costPrice: 52,
        isDefault: true,
        isActive: true
      }
    ],
    ingredients: ['Fox Nuts 88%', 'Cold-Pressed Olive Oil 8%', 'Salt 4%'],
    isFeatured: false
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?all=true&search=${search}`),
        api.get('/products/categories')
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
      if (!newProduct.category && catRes.data.categories?.length) {
        setNewProduct(prev => ({ ...prev, category: catRes.data.categories[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.variants[0].sku) {
      newProduct.variants[0].sku = `ZUNO-${newProduct.name.slice(0, 4).toUpperCase()}-100G`;
    }

    setSaving(true);
    try {
      await api.post('/products', newProduct);
      success('New makhana product created successfully with inventory SKU linked!');
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (prod) => {
    try {
      await api.put(`/products/${prod._id}`, { isPublished: !prod.isPublished });
      success(`Product ${prod.isPublished ? 'archived' : 'published'}`);
      fetchProducts();
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Inventory Catalog</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">Product Management</h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add New Makhana Product
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-white border border-cream-300 shadow-sm flex items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search products, SKUs, flavors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-cream-300">
            <tr>
              <th className="py-3 px-4">Product Details</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Variants & Pricing</th>
              <th className="py-3 px-4">Available Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {products.map((p) => {
              const defVariant = p.variants?.[0] || {};
              const totalStock = p.variants?.reduce((sum, v) => sum + (v.availableStock || 0), 0) || 0;

              return (
                <tr key={p._id} className="hover:bg-cream-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=80&q=80'}
                        alt={p.name}
                        className="w-11 h-11 object-cover rounded-xl bg-cream-200 shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-brand-950 text-sm">{p.name}</h3>
                        <p className="text-[11px] text-gray-500 font-mono">SKU: {defVariant.sku}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-gray-600 font-medium">
                    {p.category?.name || 'General'}
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-brand-900">
                        ₹{defVariant.sellingPrice} <span className="text-[10px] text-gray-400 line-through">₹{defVariant.mrp}</span>
                      </span>
                      <p className="text-[11px] text-gray-500">{p.variants?.length} variant(s) configured</p>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        totalStock <= 0
                          ? 'text-rose-600'
                          : totalStock <= 20
                          ? 'text-amber-600'
                          : 'text-brand-700'
                      }`}
                    >
                      {totalStock} units available
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.isPublished
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}
                    >
                      {p.isPublished ? 'Published' : 'Archived'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleTogglePublish(p)}
                      className="text-xs font-bold text-brand-700 hover:text-brand-900 underline"
                    >
                      {p.isPublished ? 'Archive' : 'Publish'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-cream-300 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-cream-200">
              <h3 className="font-serif text-lg font-bold text-brand-950">Add New Makhana Product</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smoky Tandoori Tikka Makhana"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Flavour Profile *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tandoori Spice"
                    value={newProduct.variants[0].flavor}
                    onChange={(e) => {
                      const v = [...newProduct.variants];
                      v[0].flavor = e.target.value;
                      setNewProduct({ ...newProduct, variants: v });
                    }}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.variants[0].sellingPrice}
                    onChange={(e) => {
                      const v = [...newProduct.variants];
                      v[0].sellingPrice = Number(e.target.value);
                      setNewProduct({ ...newProduct, variants: v });
                    }}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.variants[0].mrp}
                    onChange={(e) => {
                      const v = [...newProduct.variants];
                      v[0].mrp = Number(e.target.value);
                      setNewProduct({ ...newProduct, variants: v });
                    }}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={newProduct.variants[0].costPrice}
                    onChange={(e) => {
                      const v = [...newProduct.variants];
                      v[0].costPrice = Number(e.target.value);
                      setNewProduct({ ...newProduct, variants: v });
                    }}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="Single-line tasting hook"
                  value={newProduct.shortDescription}
                  onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Full Description & Roasting Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed description of kernels, origin, and spices"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold transition shadow-sm"
                >
                  {saving ? 'Saving...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
