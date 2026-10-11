import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Palette,
  Play,
  Pause,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Layers,
  Smartphone,
  Tablet,
  Monitor,
  Upload,
  RefreshCw,
  Zap,
  Sliders,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';
import FestiveHeaderBackground from '../../components/common/FestiveHeaderBackground';
import FestiveMaaBanner from '../../components/customer/FestiveMaaBanner';

export default function BusinessThemes() {
  const [themes, setThemes] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, scheduled: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [occasionFilter, setOccasionFilter] = useState('all');

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop, tablet, mobile
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Form State for Builder
  const initialFormState = {
    name: '',
    slug: '',
    occasion: 'custom',
    description: '',
    status: 'draft',
    priority: 5,
    startDate: '',
    endDate: '',
    timezone: 'Asia/Kolkata',
    recurrence: 'none',
    mediaType: 'video',
    desktopMediaUrl: '',
    mobileMediaUrl: '',
    posterUrl: '',
    primaryColor: '#2E1065',
    secondaryColor: '#F59E0B',
    accentColor: '#10B981',
    textColor: '#FFFFFF',
    overlayOpacity: 0.4,
    badgeText: 'Festive Special',
    greeting: 'Celebrate Festive Delights with Pure Fox Nuts',
    subtitle: 'Artisanal roasted makhana crafted for joyous celebrations.',
    ctaText: 'Explore Collection',
    ctaLink: '/products',
    particleEffect: 'none',
    particleIntensity: 'medium',
    animationSpeed: 'normal',
    enableReducedMotionFallback: true,
    deliveryPillBadge: 'Express Dispatch',
    deliveryPillTime: '12 Mins',
    heroVisualType: 'durga_navratri',
    heroVisualCycleSeconds: 3.2,
    enableFloatingPetals: true,
    enableRotatingAura: true,
    enableFlickeringDiyas: true,
    heroVisualCustomImages: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [previewTheme, setPreviewTheme] = useState(null);
  const [newCustomImageUrl, setNewCustomImageUrl] = useState('');

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/themes');
      if (res.data?.success) {
        setThemes(res.data.themes || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load themes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleOpenCreate = () => {
    setEditingThemeId(null);
    setFormData(initialFormState);
    setNewCustomImageUrl('');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (theme) => {
    setEditingThemeId(theme._id);
    setFormData({
      ...theme,
      heroVisualType: theme.heroVisualType !== undefined ? theme.heroVisualType : 'durga_navratri',
      heroVisualCycleSeconds: theme.heroVisualCycleSeconds ?? 3.2,
      enableFloatingPetals: theme.enableFloatingPetals !== false,
      enableRotatingAura: theme.enableRotatingAura !== false,
      enableFlickeringDiyas: theme.enableFlickeringDiyas !== false,
      heroVisualCustomImages: theme.heroVisualCustomImages || [],
      startDate: theme.startDate ? theme.startDate.slice(0, 16) : '',
      endDate: theme.endDate ? theme.endDate.slice(0, 16) : ''
    });
    setNewCustomImageUrl('');
    setIsEditorOpen(true);
  };

  const handleOpenPreview = (theme) => {
    setPreviewTheme(theme);
    setIsPreviewModalOpen(true);
  };

  const handleDuplicate = async (themeId) => {
    try {
      const res = await api.post(`/themes/${themeId}/duplicate`);
      if (res.data?.success) {
        fetchThemes();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to duplicate theme');
    }
  };

  const handleActivate = async (themeId) => {
    try {
      const res = await api.post(`/themes/${themeId}/activate`);
      if (res.data?.success) {
        fetchThemes();
        // Broadcast sync to customer headers
        localStorage.setItem('zuno_active_theme_sync', Date.now().toString());
        setSaveSuccessMsg(`Theme is now LIVE on customer storefront!`);
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate theme');
    }
  };

  const handleDelete = async (theme) => {
    if (theme.isPreset && theme.occasion === 'default') {
      alert('The core Default Zuno theme cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${theme.name}"?`)) return;

    try {
      const res = await api.delete(`/themes/${theme._id}`);
      if (res.data?.success) {
        fetchThemes();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete theme');
    }
  };

  const handleResetPresets = async () => {
    if (!window.confirm('Reset all festive presets (Diwali, Navratri, Holi, etc.) to default settings?')) {
      return;
    }
    try {
      const res = await api.post('/themes/reset-presets');
      if (res.data?.success) {
        fetchThemes();
        alert('All festive presets reset successfully!');
      }
    } catch (err) {
      alert('Failed to reset presets');
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    setUploadError('');

    const uploadFormData = new FormData();
    uploadFormData.append('media', file);

    try {
      const res = await api.post('/themes/upload-media', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.mediaUrl) {
        setFormData((prev) => ({
          ...prev,
          [field]: res.data.mediaUrl
        }));
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'File upload failed. Max 35MB.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleAddCustomImage = (url) => {
    if (!url || !url.trim()) return;
    setFormData((prev) => ({
      ...prev,
      heroVisualCustomImages: [...(prev.heroVisualCustomImages || []), url.trim()]
    }));
    setNewCustomImageUrl('');
  };

  const handleRemoveCustomImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      heroVisualCustomImages: (prev.heroVisualCustomImages || []).filter((_, i) => i !== index)
    }));
  };

  const handleCustomImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    setUploadError('');

    const uploadFormData = new FormData();
    uploadFormData.append('media', file);

    try {
      const res = await api.post('/themes/upload-media', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.mediaUrl) {
        handleAddCustomImage(res.data.mediaUrl);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'File upload failed. Max 35MB.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSaveTheme = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null
      };

      if (editingThemeId) {
        await api.put(`/themes/${editingThemeId}`, payload);
      } else {
        await api.post('/themes', payload);
      }

      setIsEditorOpen(false);
      fetchThemes();
      // Notify customer header
      localStorage.setItem('zuno_active_theme_sync', Date.now().toString());
      setSaveSuccessMsg('Theme configuration saved successfully.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save theme configuration.');
    }
  };

  // Filtered themes
  const filteredThemes = themes.filter((t) => {
    const matchStatus = activeFilter === 'all' || t.status === activeFilter;
    const matchOccasion = occasionFilter === 'all' || t.occasion === occasionFilter;
    return matchStatus && matchOccasion;
  });

  const liveTheme = themes.find((t) => t.status === 'active');

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-charcoal-900 text-white rounded-3xl p-6 sm:p-8 border border-gold-600/30 shadow-luxury relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-brand-700/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zepto-Inspired Motion Engine</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Zuno Theme Studio — Realistic Festive Header
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Design video-style festive headers with realistic lighting, floating particles (diyas,
              gulal, confetti, snowflakes), live previews, time-zone scheduling, and automatic storefront activation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-black text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Theme</span>
            </button>
            <button
              onClick={handleResetPresets}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition"
              title="Reset all built-in presets (Diwali, Navratri, Holi, etc.)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Presets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 2. Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cream-300 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
            Total Library Themes
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-charcoal-950">{stats.total || themes.length}</span>
            <span className="text-[11px] text-gray-400 font-medium">presets & custom</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cream-300 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Storefront Theme
          </span>
          <div className="mt-1 truncate">
            <span className="text-sm font-black text-charcoal-950 truncate block">
              {liveTheme?.name || 'Default Zuno'}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Priority: {liveTheme?.priority ?? 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cream-300 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
            Scheduled Campaigns
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-charcoal-950">{stats.scheduled}</span>
            <span className="text-[11px] text-amber-600 font-bold">auto-activating</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cream-300 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block">
            Drafts & Prototypes
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-charcoal-950">{stats.draft}</span>
            <span className="text-[11px] text-gray-400 font-medium">in development</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {['all', 'active', 'scheduled', 'draft', 'expired'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                activeFilter === filter
                  ? 'bg-charcoal-900 text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-cream-100 hover:text-charcoal-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Occasion Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Occasion:</span>
          <select
            value={occasionFilter}
            onChange={(e) => setOccasionFilter(e.target.value)}
            className="text-xs font-bold bg-cream-100 border border-cream-300 rounded-xl px-3 py-1.5 text-charcoal-900 focus:outline-none focus:border-qcPurple-700"
          >
            <option value="all">All Occasions</option>
            <option value="diwali">🪔 Diwali</option>
            <option value="navratri">✨ Navratri / Garba</option>
            <option value="holi">🎨 Holi</option>
            <option value="raksha_bandhan">💝 Raksha Bandhan</option>
            <option value="christmas">🎄 Christmas</option>
            <option value="new_year">🥂 New Year</option>
            <option value="default">⚡ Default Zuno</option>
            <option value="custom">🛠️ Custom Theme</option>
          </select>
        </div>
      </div>

      {/* 4. Theme Library Grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 text-qcPurple-700 animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-500">Loading festive theme library...</p>
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-cream-300 space-y-3">
          <Palette className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-sm font-black text-charcoal-900">No themes found matching filters</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try switching filters or click "Reset Presets" to restore standard festive themes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map((theme) => {
            const isLive = theme.status === 'active';
            const isScheduled = theme.status === 'scheduled';

            return (
              <div
                key={theme._id || theme.slug}
                className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between hover:shadow-lg ${
                  isLive ? 'border-emerald-500 ring-2 ring-emerald-400/30' : 'border-cream-300'
                }`}
              >
                {/* Visual Header / Thumbnail */}
                <div
                  className="relative h-44 overflow-hidden flex items-end p-4"
                  style={{
                    backgroundColor: theme.primaryColor || '#2E1065',
                    backgroundImage: theme.posterUrl ? `url(${theme.posterUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Subtle Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/40 to-transparent pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                        isLive
                          ? 'bg-emerald-500 text-white'
                          : isScheduled
                          ? 'bg-amber-400 text-charcoal-950'
                          : 'bg-black/60 text-gray-200'
                      }`}
                    >
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      {theme.status}
                    </span>

                    <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-gold-300 text-[10px] font-mono font-bold border border-white/10">
                      Priority: {theme.priority}
                    </span>
                  </div>

                  {/* Text on Card */}
                  <div className="relative z-10 space-y-0.5 text-white">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                      {theme.occasion.replace('_', ' ')}
                    </span>
                    <h3 className="font-serif font-black text-base text-white truncate drop-shadow-sm">
                      {theme.name}
                    </h3>
                  </div>
                </div>

                {/* Card Metadata */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between bg-white">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {theme.description || theme.subtitle || 'Production festive header theme.'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cream-100 text-[10px] font-bold text-charcoal-800">
                        <Layers className="w-3 h-3 text-qcPurple-700" />
                        {theme.mediaType === 'video' ? 'Looped MP4' : 'Artwork Graphic'}
                      </span>

                      {theme.particleEffect !== 'none' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-[10px] font-bold text-amber-800 border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {theme.particleEffect}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-800 border border-blue-200">
                        <Zap className="w-3 h-3 text-blue-600" />
                        {theme.deliveryPillBadge || 'Express'}
                      </span>

                      {theme.heroVisualType !== 'none' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-[10px] font-bold text-amber-900 border border-amber-300">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>
                            {theme.heroVisualType === 'diwali_lakshmi_ganesh'
                              ? '🪔 Lakshmi & Ganesh'
                              : theme.heroVisualType === 'holi_radha_krishna'
                              ? '🎨 Radha Krishna'
                              : theme.heroVisualType === 'rakhi_sibling'
                              ? '💝 Rakhi Sutra'
                              : theme.heroVisualType === 'christmas_joy'
                              ? '🎄 Christmas Joy'
                              : theme.heroVisualType === 'new_year_celebration'
                              ? '🥂 New Year 2026'
                              : theme.heroVisualType === 'default_lotus'
                              ? '🪷 Mithila Lotus'
                              : '✨ Navratri Maa Durga'}{' '}
                            ({theme.heroVisualCycleSeconds || 3.2}s)
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 border border-gray-200">
                          🚫 No Moving Visual
                        </span>
                      )}
                    </div>

                    {/* Schedule times if configured */}
                    {theme.startDate && (
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium pt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>
                          {new Date(theme.startDate).toLocaleDateString()} –{' '}
                          {theme.endDate ? new Date(theme.endDate).toLocaleDateString() : 'Indefinite'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-cream-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenPreview(theme)}
                        className="p-2 rounded-xl text-gray-600 hover:text-qcPurple-700 hover:bg-cream-100 transition"
                        title="Live Multi-Device Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(theme)}
                        className="p-2 rounded-xl text-gray-600 hover:text-qcPurple-700 hover:bg-cream-100 transition"
                        title="Edit & Configure Theme"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(theme._id)}
                        className="p-2 rounded-xl text-gray-600 hover:text-qcPurple-700 hover:bg-cream-100 transition"
                        title="Duplicate as New Custom Theme"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {!theme.isPreset && (
                        <button
                          onClick={() => handleDelete(theme)}
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Theme"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Quick Push-to-Live Button */}
                    {!isLive ? (
                      <button
                        onClick={() => handleActivate(theme._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-black text-white font-bold text-xs shadow-2xs transition active:scale-95"
                      >
                        <Play className="w-3 h-3 text-gold-400" />
                        <span>Activate Live</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        <Check className="w-3 h-3" /> Live Now
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Theme Builder / Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-luxury max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-cream-300">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-charcoal-900 text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gold-500 text-charcoal-950 flex items-center justify-center font-bold">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">
                    {editingThemeId ? 'Customize Festive Theme' : 'Create Custom Theme'}
                  </h3>
                  <span className="text-[11px] text-gray-300">
                    Live visual header configuration with real-time quick-commerce preview
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Two-Column Builder */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Controls (Left 7 Cols) */}
              <form onSubmit={handleSaveTheme} className="lg:col-span-7 space-y-6">
                {/* Section A: Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-charcoal-950 border-b border-cream-200 pb-1">
                    1. Theme Details & Occasion
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Theme Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full text-xs font-medium px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:border-qcPurple-700"
                        placeholder="e.g. Diwali Festival of Lights"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Occasion Type
                      </label>
                      <select
                        value={formData.occasion}
                        onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                        className="w-full text-xs font-bold px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:border-qcPurple-700"
                      >
                        <option value="diwali">🪔 Diwali</option>
                        <option value="navratri">✨ Navratri</option>
                        <option value="holi">🎨 Holi</option>
                        <option value="raksha_bandhan">💝 Raksha Bandhan</option>
                        <option value="christmas">🎄 Christmas</option>
                        <option value="new_year">🥂 New Year</option>
                        <option value="default">⚡ Default Everyday</option>
                        <option value="custom">🛠️ Custom Theme</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal-900 mb-1">
                      Description / Campaign Purpose
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full text-xs font-medium px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:border-qcPurple-700"
                      placeholder="Explain the promotional concept..."
                    />
                  </div>
                </div>

                {/* Section B: Media Assets */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-charcoal-950 border-b border-cream-200 pb-1">
                    2. Background Media & Assets
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Media Format
                      </label>
                      <select
                        value={formData.mediaType}
                        onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                        className="w-full text-xs font-bold px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                      >
                        <option value="video">Seamless Looping Video (MP4)</option>
                        <option value="image">Static Artwork Graphic</option>
                        <option value="gradient">Deep Gradient + Particles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Overlay Scrim Opacity ({Math.round(formData.overlayOpacity * 100)}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="0.85"
                        step="0.05"
                        value={formData.overlayOpacity}
                        onChange={(e) =>
                          setFormData({ ...formData, overlayOpacity: parseFloat(e.target.value) })
                        }
                        className="w-full mt-2 accent-qcPurple-700"
                      />
                    </div>
                  </div>

                  {formData.mediaType === 'video' && (
                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Desktop Background Video Loop URL
                      </label>
                      <input
                        type="url"
                        value={formData.desktopMediaUrl}
                        onChange={(e) => setFormData({ ...formData, desktopMediaUrl: e.target.value })}
                        className="w-full text-xs font-medium px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl mb-1.5"
                        placeholder="https://assets.mixkit.co/...loop.mp4"
                      />
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-charcoal-900 text-[11px] font-bold transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Local MP4/WebM</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'desktopMediaUrl')}
                          />
                        </label>
                        {uploadingMedia && (
                          <span className="text-[11px] font-bold text-qcPurple-700 animate-pulse">
                            Uploading to server...
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-charcoal-900 mb-1">
                      Static Poster Image Fallback (Crucial for Instant Load)
                    </label>
                    <input
                      type="url"
                      value={formData.posterUrl}
                      onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      className="w-full text-xs font-medium px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl mb-1.5"
                      placeholder="https://images.unsplash.com/...jpg"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-charcoal-900 text-[11px] font-bold transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Poster JPG/PNG</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'posterUrl')}
                      />
                    </label>
                  </div>
                </div>

                {/* Section C: Palette & Colors */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-charcoal-950 border-b border-cream-200 pb-1">
                    3. Brand & Lighting Colors
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Primary Theme
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                        />
                        <span className="font-mono text-xs font-bold">{formData.primaryColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Secondary Glow
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                        />
                        <span className="font-mono text-xs font-bold">{formData.secondaryColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Accent / CTA
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.accentColor}
                          onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                        />
                        <span className="font-mono text-xs font-bold">{formData.accentColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section D: Realistic Particle Effects */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-charcoal-950 border-b border-cream-200 pb-1">
                    4. Realistic Motion & Festive Particles
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Particle Effect
                      </label>
                      <select
                        value={formData.particleEffect}
                        onChange={(e) => setFormData({ ...formData, particleEffect: e.target.value })}
                        className="w-full text-xs font-bold px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                      >
                        <option value="none">No Particles</option>
                        <option value="diyas">🪔 Floating Golden Diyas</option>
                        <option value="dandiya">✨ Dandiya Flares & Motifs</option>
                        <option value="colors">🎨 Floating Gulal Dust</option>
                        <option value="confetti">🎉 Shimmering Confetti</option>
                        <option value="snow">❄️ Winter Snowflakes</option>
                        <option value="stars">⭐ Shimmering Stars</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Intensity
                      </label>
                      <select
                        value={formData.particleIntensity}
                        onChange={(e) =>
                          setFormData({ ...formData, particleIntensity: e.target.value })
                        }
                        className="w-full text-xs font-bold px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                      >
                        <option value="subtle">Subtle</option>
                        <option value="medium">Medium</option>
                        <option value="vibrant">Vibrant / Lush</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Animation Speed
                      </label>
                      <select
                        value={formData.animationSpeed}
                        onChange={(e) => setFormData({ ...formData, animationSpeed: e.target.value })}
                        className="w-full text-xs font-bold px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                      >
                        <option value="slow">Slow & Elegant</option>
                        <option value="normal">Normal</option>
                        <option value="fast">Energetic</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section E: Dynamic Moving Deity Visual Engine */}
                <div className="space-y-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>5. Moving Deity & Dynamic Hero Visual Engine</span>
                    </h4>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                      Blinkit / Zepto Festive Animation
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Festive Deity & Spiritual Avatars
                      </label>
                      <select
                        value={formData.heroVisualType}
                        onChange={(e) => setFormData({ ...formData, heroVisualType: e.target.value })}
                        className="w-full text-xs font-bold px-3 py-2 bg-white border border-cream-300 rounded-xl focus:border-amber-600"
                      >
                        <option value="durga_navratri">✨ Navratri Maa Durga (6 Sacred Avatars Cycling)</option>
                        <option value="diwali_lakshmi_ganesh">🪔 Shubh Deepavali (Maa Lakshmi, Shri Ganesha & Diyas)</option>
                        <option value="holi_radha_krishna">🎨 Radha Krishna Phoolon Ki Holi & Braj Ke Rang</option>
                        <option value="rakhi_sibling">💝 Raksha Bandhan (Pavitra Rakhi Sutra & Sibling Feast)</option>
                        <option value="christmas_joy">🎄 Winter Holiday & Christmas Joy (Santa & Tree)</option>
                        <option value="new_year_celebration">🥂 Happy New Year 2026 (Midnight Countdown)</option>
                        <option value="default_lotus">🪷 Mithila Lotus Heritage & Artisanal Harvest</option>
                        <option value="none">🚫 No Moving Visual (Standard Static Header)</option>
                      </select>
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        Select the animated deity motif to cycle across your store header.
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-charcoal-900">
                          Photo Change Interval
                        </label>
                        <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                          ⏱️ Every {formData.heroVisualCycleSeconds || 3.2}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1.5"
                        max="8.0"
                        step="0.5"
                        value={formData.heroVisualCycleSeconds || 3.2}
                        onChange={(e) =>
                          setFormData({ ...formData, heroVisualCycleSeconds: parseFloat(e.target.value) })
                        }
                        className="w-full mt-2 accent-amber-600"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>1.5s (Fast)</span>
                        <span>3.2s (Standard)</span>
                        <span>8.0s (Slow)</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Visual Effects Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-amber-200/60 cursor-pointer hover:border-amber-400 transition">
                      <input
                        type="checkbox"
                        checked={formData.enableRotatingAura !== false}
                        onChange={(e) =>
                          setFormData({ ...formData, enableRotatingAura: e.target.checked })
                        }
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                      />
                      <div className="text-[11px]">
                        <span className="font-bold text-charcoal-900 block">Rotating Chakra Aura</span>
                        <span className="text-gray-500 text-[10px] leading-tight block">
                          Glowing solar chakra rotating behind avatar
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-amber-200/60 cursor-pointer hover:border-amber-400 transition">
                      <input
                        type="checkbox"
                        checked={formData.enableFlickeringDiyas !== false}
                        onChange={(e) =>
                          setFormData({ ...formData, enableFlickeringDiyas: e.target.checked })
                        }
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                      />
                      <div className="text-[11px]">
                        <span className="font-bold text-charcoal-900 block">Flickering Diyas</span>
                        <span className="text-gray-500 text-[10px] leading-tight block">
                          Glowing clay oil lamps with real flame
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-amber-200/60 cursor-pointer hover:border-amber-400 transition">
                      <input
                        type="checkbox"
                        checked={formData.enableFloatingPetals !== false}
                        onChange={(e) =>
                          setFormData({ ...formData, enableFloatingPetals: e.target.checked })
                        }
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                      />
                      <div className="text-[11px]">
                        <span className="font-bold text-charcoal-900 block">Floating Petals</span>
                        <span className="text-gray-500 text-[10px] leading-tight block">
                          Blessing petals rising smoothly
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Custom Deity Photos Upload / URL Strip (Optional) */}
                  <div className="pt-2 border-t border-amber-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-charcoal-900">
                        Custom Deity Photos (Optional Override)
                      </label>
                      <span className="text-[10px] text-gray-500">
                        {(formData.heroVisualCustomImages || []).length} custom image(s) configured
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={newCustomImageUrl}
                        onChange={(e) => setNewCustomImageUrl(e.target.value)}
                        placeholder="Paste image URL (e.g. https://.../maa-durga.jpg)"
                        className="flex-1 text-xs px-3 py-1.5 bg-white border border-cream-300 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomImage(newCustomImageUrl)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shrink-0"
                      >
                        + Add Photo
                      </button>
                      <label className="cursor-pointer px-3 py-1.5 bg-cream-200 hover:bg-cream-300 text-charcoal-900 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCustomImageUpload}
                        />
                      </label>
                    </div>

                    {/* Thumbnail strip */}
                    {(formData.heroVisualCustomImages || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {formData.heroVisualCustomImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="relative group w-14 h-14 rounded-xl border border-amber-300 overflow-hidden bg-white shadow-2xs"
                          >
                            <img
                              src={imgUrl}
                              alt={`Custom avatar ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomImage(idx)}
                              className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition shadow-xs text-[10px]"
                              title="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section F: Header Copy & Delivery Pill */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-charcoal-950 border-b border-cream-200 pb-1">
                    6. Header Announcement & Delivery Pill
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Badge Announcement Text
                      </label>
                      <input
                        type="text"
                        value={formData.badgeText}
                        onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                        className="w-full text-xs font-medium px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                        placeholder="e.g. 🪔 Shubh Deepavali Exclusive"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Delivery Pill Badge (Zepto-Style)
                      </label>
                      <input
                        type="text"
                        value={formData.deliveryPillBadge}
                        onChange={(e) => setFormData({ ...formData, deliveryPillBadge: e.target.value })}
                        className="w-full text-xs font-medium px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                        placeholder="e.g. Diwali Rush Express"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal-900 mb-1">
                      Festive Greeting Headline
                    </label>
                    <input
                      type="text"
                      value={formData.greeting}
                      onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                      className="w-full text-xs font-medium px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                      placeholder="e.g. Illuminate Your Celebrations with Pure Crunch"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Optional CTA Link Text
                      </label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        className="w-full text-xs font-medium px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                        placeholder="e.g. Explore Diwali Hampers"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        CTA Link Path
                      </label>
                      <input
                        type="text"
                        value={formData.ctaLink}
                        onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                        className="w-full text-xs font-medium px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                        placeholder="/products?category=combos-and-family-packs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section G: Scheduling & Priority */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-charcoal-950 border-b border-cream-200 pb-1">
                    7. Scheduling, Priority & Publication
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full text-xs font-bold px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                      >
                        <option value="draft">Draft (Inactive)</option>
                        <option value="scheduled">Scheduled by Date</option>
                        <option value="active">Active (Immediate Live)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Priority (0 to 100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                        }
                        className="w-full text-xs font-bold px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                        title="Higher priority wins if campaigns overlap"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Recurrence
                      </label>
                      <select
                        value={formData.recurrence}
                        onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                        className="w-full text-xs font-bold px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                      >
                        <option value="none">One-time Campaign</option>
                        <option value="daily">Daily Schedule</option>
                        <option value="weekly">Weekly</option>
                        <option value="yearly">Yearly (Annual Festival)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        Start Date & Time (Asia/Kolkata)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full text-xs font-medium px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-900 mb-1">
                        End Date & Time (Asia/Kolkata)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full text-xs font-medium px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-4 border-t border-cream-300 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-cream-300 text-charcoal-800 text-xs font-bold hover:bg-cream-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-black shadow-md transition"
                  >
                    Save & Deploy Theme
                  </button>
                </div>
              </form>

              {/* Real-time Interactive Preview Pane (Right 5 Cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-cream-200 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-charcoal-950 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-qcPurple-700" />
                    <span>Real-Time Header Simulation</span>
                  </h4>

                  {/* Device toggle */}
                  <div className="flex items-center gap-1 bg-cream-100 p-0.5 rounded-xl border border-cream-300">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg transition ${
                        previewDevice === 'desktop' ? 'bg-white shadow-2xs text-charcoal-950' : 'text-gray-500'
                      }`}
                      title="Desktop View"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('tablet')}
                      className={`p-1.5 rounded-lg transition ${
                        previewDevice === 'tablet' ? 'bg-white shadow-2xs text-charcoal-950' : 'text-gray-500'
                      }`}
                      title="Tablet View"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg transition ${
                        previewDevice === 'mobile' ? 'bg-white shadow-2xs text-charcoal-950' : 'text-gray-500'
                      }`}
                      title="Mobile View"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Simulated Header Container */}
                <div
                  className={`border border-cream-300 rounded-3xl overflow-hidden shadow-md mx-auto transition-all ${
                    previewDevice === 'mobile'
                      ? 'w-[340px]'
                      : previewDevice === 'tablet'
                      ? 'w-[480px]'
                      : 'w-full'
                  }`}
                >
                  <FestiveHeaderBackground theme={formData}>
                    {/* Announcement */}
                    {formData.greeting && (
                      <div className="bg-black/40 backdrop-blur-md text-white text-[10px] py-1 px-3 text-center border-b border-white/10">
                        <span className="font-bold text-amber-300">{formData.badgeText}</span>
                        <span className="mx-1">•</span>
                        <span>{formData.greeting}</span>
                      </div>
                    )}

                    {/* Navigation bar simulation */}
                    <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-qcPurple-800 flex items-center justify-center text-qcYellow-400 font-black">
                          <Sparkles className="w-4 h-4 text-qcYellow-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-sans font-black text-lg text-white leading-none">
                            Zuno
                          </span>
                          <span className="text-[9px] uppercase font-bold text-emerald-300">
                            {formData.deliveryPillBadge || 'Express'}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 max-w-[140px] sm:max-w-xs">
                        <div className="w-full bg-white/95 rounded-lg py-1.5 px-2.5 text-[10px] text-gray-500 font-medium">
                          Search 'Peri Peri'...
                        </div>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-qcGreen-700 flex items-center justify-center text-white text-[10px] font-bold">
                        ₹0
                      </div>
                    </div>

                    {/* Simulated categories */}
                    <div className="bg-black/30 backdrop-blur-md px-3 py-1 flex gap-2 overflow-x-hidden text-[9px] text-white/90">
                      <span className="bg-amber-400 text-charcoal-950 px-2 py-0.5 rounded font-bold">
                        All Makhana
                      </span>
                      <span className="opacity-80 px-2 py-0.5">Classic Roasted</span>
                      <span className="opacity-80 px-2 py-0.5">Sweet Delights</span>
                    </div>
                  </FestiveHeaderBackground>

                  {/* Real-Time Live Moving Deity Visual Simulator */}
                  {formData.heroVisualType !== 'none' && (
                    <div className="bg-gradient-to-b from-[#FED766]/80 via-[#FEE180]/40 to-white/90 border-t border-amber-300/50">
                      <FestiveMaaBanner activeThemeProp={formData} />
                    </div>
                  )}
                </div>

                <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200 text-[11px] text-gray-600 space-y-1">
                  <p className="font-bold text-charcoal-900">✨ How It Works on Storefront:</p>
                  <p>
                    • Highest priority eligible theme displays automatically.
                    <br />
                    • Background video loops seamlessly with high-contrast scrim.
                    <br />
                    • Respects user reduced-motion preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Multi-Device Dedicated Preview Modal */}
      {isPreviewModalOpen && previewTheme && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-charcoal-950 rounded-3xl max-w-5xl w-full border border-white/20 shadow-luxury overflow-hidden flex flex-col">
            <div className="p-4 bg-charcoal-900 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  Storefront Live Preview
                </span>
                <span className="text-white font-serif font-bold text-sm">
                  — {previewTheme.name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      previewDevice === 'desktop' ? 'bg-gold-500 text-charcoal-950' : 'text-gray-300'
                    }`}
                  >
                    Desktop (1200px)
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      previewDevice === 'tablet' ? 'bg-gold-500 text-charcoal-950' : 'text-gray-300'
                    }`}
                  >
                    Tablet (768px)
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      previewDevice === 'mobile' ? 'bg-gold-500 text-charcoal-950' : 'text-gray-300'
                    }`}
                  >
                    Mobile (375px)
                  </button>
                </div>

                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 bg-charcoal-900/60 overflow-x-auto flex justify-center items-start min-h-[360px]">
              <div
                className={`transition-all rounded-3xl overflow-hidden shadow-2xl border border-white/20 ${
                  previewDevice === 'mobile'
                    ? 'w-[375px]'
                    : previewDevice === 'tablet'
                    ? 'w-[768px]'
                    : 'w-full max-w-4xl'
                }`}
              >
                <FestiveHeaderBackground theme={previewTheme}>
                  {previewTheme.greeting && (
                    <div className="bg-black/40 backdrop-blur-md text-white text-xs py-1.5 px-4 text-center border-b border-white/10">
                      <span className="font-bold text-amber-300">{previewTheme.badgeText}</span>
                      <span className="mx-2">•</span>
                      <span>{previewTheme.greeting}</span>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-qcPurple-800 flex items-center justify-center text-qcYellow-400 font-black">
                        <Sparkles className="w-5 h-5 text-qcYellow-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-sans font-black text-xl text-white">Zuno</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-300">
                          {previewTheme.deliveryPillBadge || 'Express Dispatch'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 max-w-sm hidden sm:block">
                      <div className="w-full bg-white/95 rounded-xl py-2 px-3 text-xs text-gray-500 font-medium">
                        Search flavours, combos...
                      </div>
                    </div>

                    <div className="px-3.5 py-2 rounded-xl bg-qcGreen-700 text-white font-extrabold text-xs">
                      Cart ₹149
                    </div>
                  </div>

                  <div className="bg-black/35 backdrop-blur-md px-4 py-2 flex gap-3 text-xs text-white/90">
                    <span className="bg-amber-400 text-charcoal-950 px-2.5 py-0.5 rounded-lg font-bold">
                      All Makhana
                    </span>
                    <span className="opacity-80">⚡ Classic Roasted</span>
                    <span className="opacity-80">🌶️ Gourmet Spiced</span>
                    <span className="opacity-80">🍯 Sweet Delights</span>
                  </div>
                </FestiveHeaderBackground>

                {/* Live Animated Festive Deity Banner in Dedicated Preview */}
                {previewTheme.heroVisualType !== 'none' && (
                  <div className="bg-gradient-to-b from-[#FED766]/80 via-[#FEE180]/40 to-white/90 border-t border-amber-300/50">
                    <FestiveMaaBanner activeThemeProp={previewTheme} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
