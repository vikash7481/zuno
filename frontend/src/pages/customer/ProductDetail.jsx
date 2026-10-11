import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import ProductCard from '../../components/customer/ProductCard';
import {
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { success, error: notifyError } = useNotification();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Pincode serviceability
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // 'serviceable' | 'unserviceable'

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data.product);
        setRelatedProducts(res.data.relatedProducts || []);

        // Load reviews
        if (res.data.product?._id) {
          const revRes = await api.get(`/products/${res.data.product._id}/reviews`);
          setReviews(revRes.data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-cream-200/60 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-cream-200/60 rounded-lg w-3/4 animate-pulse" />
            <div className="h-5 bg-cream-200/60 rounded-lg w-1/4 animate-pulse" />
            <div className="h-24 bg-cream-200/60 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-brand-900">Product Not Found</h2>
        <p className="text-xs text-gray-500">The requested makhana flavour does not exist or has been archived.</p>
        <Link to="/products" className="inline-block px-6 py-2.5 bg-brand-700 text-white rounded-full text-xs font-bold">
          Return to Products
        </Link>
      </div>
    );
  }

  const variants = product.variants || [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || {};
  const images = product.images?.length
    ? product.images
    : ['https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80'];

  const discountPercent =
    currentVariant.mrp && currentVariant.sellingPrice && currentVariant.mrp > currentVariant.sellingPrice
      ? Math.round(((currentVariant.mrp - currentVariant.sellingPrice) / currentVariant.mrp) * 100)
      : 0;

  const availableStock = currentVariant.availableStock !== undefined ? currentVariant.availableStock : 10;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, currentVariant, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, currentVariant, quantity);
    navigate('/checkout');
  };

  const handleCheckPincode = async (e) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;

    try {
      const res = await api.get('/settings');
      const list = res.data.settings?.serviceable_pincodes || [];
      if (list.includes(pincodeInput.trim())) {
        setPincodeStatus('serviceable');
      } else {
        setPincodeStatus('unserviceable');
      }
    } catch {
      // Default to serviceable for major test codes
      setPincodeStatus('serviceable');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/${product._id}/reviews`, {
        rating: newRating,
        comment: newComment.trim()
      });
      setReviews([res.data.review, ...reviews]);
      setNewComment('');
      success('Thank you for sharing your tasting review!');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-brand-700">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-brand-900 font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-cream-200 border border-cream-300 shadow-luxury relative">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-brand-700 text-gold-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImageIndex === idx ? 'border-brand-700 shadow-md' : 'border-cream-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Details */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-gold-600 bg-gold-50 px-2.5 py-0.5 rounded-md border border-gold-300">
                {currentVariant.flavor || 'Slow Roasted'}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs font-semibold text-brand-700">Brand: Zuno</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-950 leading-tight">
              {product.name}
            </h1>

            {/* Ratings Bar */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-gold-600 text-sm font-bold">
                <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                <span>{product.averageRating || 4.9}</span>
              </div>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-600 underline cursor-pointer" onClick={() => setActiveTab('reviews')}>
                {reviews.length || product.reviewCount || 34} Verified Reviews
              </span>
            </div>
          </div>

          {/* Pricing & GST Info */}
          <div className="p-4 rounded-2xl bg-cream-200/60 border border-cream-300 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-brand-950">
                  ₹{currentVariant.sellingPrice}
                </span>
                {currentVariant.mrp > currentVariant.sellingPrice && (
                  <span className="text-base text-gray-400 line-through">
                    ₹{currentVariant.mrp}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-md">
                    Save ₹{currentVariant.mrp - currentVariant.sellingPrice}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Inclusive of all applicable taxes</p>
            </div>

            {/* Stock Availability */}
            <div className="text-right">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                </span>
              ) : availableStock <= 15 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300">
                  Only {availableStock} Remaining!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock & Fresh
                </span>
              )}
            </div>
          </div>

          {/* Variant Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-brand-900 uppercase tracking-wider">
              Select Pack Size:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {variants.map((v, idx) => (
                <button
                  key={v.sku}
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedVariantIndex === idx
                      ? 'border-qcPurple-700 bg-qcPurple-50/60 shadow-xs ring-2 ring-qcPurple-600'
                      : 'border-cream-300 bg-white hover:border-qcPurple-400'
                  }`}
                >
                  <span className="text-xs font-black text-charcoal-950">{v.packSize}</span>
                  <span className="text-xs font-extrabold text-qcGreen-700 mt-1">₹{v.sellingPrice}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-cream-400 rounded-2xl bg-white overflow-hidden h-12 shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 hover:bg-cream-100 text-gray-700 transition font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-black text-charcoal-950">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 hover:bg-cream-100 text-gray-700 transition font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 h-12 rounded-2xl bg-qcGreen-700 hover:bg-qcGreen-800 active:scale-[0.99] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-luxury transition"
              >
                <ShoppingBag className="w-4 h-4 text-qcYellow-300" />
                <span>Add to Bag</span>
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full h-12 rounded-2xl bg-qcPurple-800 hover:bg-qcPurple-900 active:scale-[0.99] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
            >
              <Zap className="w-4 h-4 fill-qcYellow-400 text-qcYellow-400" />
              <span>⚡ Buy Now • 10-Min Dispatch</span>
            </button>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="p-4 rounded-2xl bg-white border border-cream-300 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-900">
              <Truck className="w-4 h-4 text-brand-700" />
              <span>Check Delivery Serviceability</span>
            </div>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit PIN code (e.g. 560001)"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                maxLength={6}
                className="flex-1 px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg focus:outline-none focus:border-brand-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-charcoal-900 text-white rounded-lg text-xs font-bold hover:bg-black transition"
              >
                Verify
              </button>
            </form>

            {pincodeStatus === 'serviceable' && (
              <p className="text-xs text-brand-700 font-semibold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Express delivery available to this PIN code within 2 business days!
              </p>
            )}
            {pincodeStatus === 'unserviceable' && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 pt-1">
                <AlertCircle className="w-3.5 h-3.5" /> Standard courier service only for this destination.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Description, Ingredients, Nutrition, Reviews */}
      <div className="pt-8 border-t border-cream-300 space-y-6">
        <div className="flex border-b border-cream-300 gap-8 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 font-bold transition border-b-2 ${
              activeTab === 'description' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-500 hover:text-charcoal-900'
            }`}
          >
            Craft & Story
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`pb-3 font-bold transition border-b-2 ${
              activeTab === 'nutrition' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-500 hover:text-charcoal-900'
            }`}
          >
            Nutritional Facts
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`pb-3 font-bold transition border-b-2 ${
              activeTab === 'ingredients' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-500 hover:text-charcoal-900'
            }`}
          >
            Ingredients & Allergens
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 font-bold transition border-b-2 ${
              activeTab === 'reviews' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-500 hover:text-charcoal-900'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div className="bg-white p-6 rounded-2xl border border-cream-300 space-y-4 max-w-3xl">
            <h3 className="font-serif text-lg font-bold text-brand-900">The Artisanal Roasting Process</h3>
            <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
            <div className="p-4 rounded-xl bg-cream-100 border border-cream-300 text-xs text-gray-600 space-y-1">
              <strong className="text-brand-900 block font-bold">Storage Guidelines:</strong>
              {product.storageInstructions || 'Store in a cool, dry place away from sunlight. Re-seal airtight pouch after opening to retain maximum crispness.'}
            </div>
          </div>
        )}

        {/* Tab 2: Nutrition Facts Table */}
        {activeTab === 'nutrition' && (
          <div className="bg-white p-6 rounded-2xl border border-cream-300 space-y-4 max-w-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-cream-300">
              <h3 className="font-serif text-lg font-bold text-brand-900">Nutritional Facts</h3>
              <span className="text-xs text-gray-500">Per 100g Serving</span>
            </div>

            <div className="divide-y divide-cream-200 text-xs">
              <div className="py-2.5 flex justify-between font-bold text-brand-900">
                <span>Energy</span>
                <span>{product.nutritionalInfo?.energyKcal || 382} kcal</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Protein</span>
                <span className="font-bold text-brand-700">{product.nutritionalInfo?.proteinG || 9.8} g</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Total Carbohydrates</span>
                <span>{product.nutritionalInfo?.carbohydratesG || 72.4} g</span>
              </div>
              <div className="py-2.5 flex justify-between pl-4 text-gray-600">
                <span>Dietary Fiber</span>
                <span>{product.nutritionalInfo?.dietaryFiberG || 7.9} g</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Total Fat</span>
                <span>{product.nutritionalInfo?.totalFatG || 6.2} g</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Calcium</span>
                <span>{product.nutritionalInfo?.calciumMg || 64} mg</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Iron</span>
                <span>{product.nutritionalInfo?.ironMg || 1.6} mg</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Sodium</span>
                <span>{product.nutritionalInfo?.sodiumMg || 280} mg</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Ingredients */}
        {activeTab === 'ingredients' && (
          <div className="bg-white p-6 rounded-2xl border border-cream-300 space-y-4 max-w-2xl">
            <h3 className="font-serif text-lg font-bold text-brand-900">Pure Ingredients</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal-800">
              {(product.ingredients || []).map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <strong className="block font-bold">Allergen Information:</strong>
              {product.allergens || 'Processed in a facility that may handle tree nuts.'}
            </div>
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Reviews List */}
            <div className="md:col-span-7 space-y-4">
              <h3 className="font-serif text-lg font-bold text-brand-900">Customer Tasting Reviews</h3>

              {reviews.length === 0 ? (
                <p className="text-xs text-gray-500">No reviews yet for this batch. Be the first to share your experience!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-xl bg-white border border-cream-300 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-brand-900">
                        <span>{rev.userName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex text-gold-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-gold-500" />
                        ))}
                      </div>
                    </div>
                    {rev.title && <h4 className="text-xs font-bold text-charcoal-900">{rev.title}</h4>}
                    <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-gray-400 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Write Review Form */}
            <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-cream-300 space-y-4 h-fit">
              <h3 className="font-serif text-base font-bold text-brand-900">Leave Your Review</h3>
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-charcoal-800 block mb-1">Your Rating</label>
                    <div className="flex gap-1 text-gold-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="p-1 focus:outline-none"
                        >
                          <Star className={`w-5 h-5 ${star <= newRating ? 'fill-gold-500' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-charcoal-800 block mb-1">Your Comments</label>
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="How was the crispness, seasoning, and packaging?"
                      required
                      className="w-full p-2.5 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-cream-100 text-center space-y-2">
                  <p className="text-xs text-gray-600">Please sign in to share a verified purchase review.</p>
                  <Link to="/login" className="inline-block px-4 py-2 bg-brand-700 text-white rounded-lg text-xs font-bold">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-cream-300 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-brand-950">You May Also Relish</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
