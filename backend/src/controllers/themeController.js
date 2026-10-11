import Theme from '../models/Theme.js';

// Pre-defined production festive themes
export const THEME_PRESETS = [
  {
    name: 'Diwali Festival of Lights Edition',
    slug: 'diwali-festival-of-lights',
    occasion: 'diwali',
    description: 'Warm glowing diyas, golden light bokeh, and royal gift box promotions.',
    isPreset: true,
    status: 'active',
    priority: 10,
    startDate: new Date('2026-10-01T00:00:00Z'),
    endDate: new Date('2026-11-15T23:59:59Z'),
    timezone: 'Asia/Kolkata',
    recurrence: 'none',
    mediaType: 'video',
    desktopMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-golden-particles-in-the-air-loop-42866-large.mp4',
    mobileMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-golden-particles-in-the-air-loop-42866-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1605722243939-f08f27f6ee65?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#451A03',
    secondaryColor: '#F59E0B',
    accentColor: '#FCD34D',
    textColor: '#FFFFFF',
    overlayOpacity: 0.45,
    blurStrength: 'backdrop-blur-md',
    badgeText: '🪔 Shubh Deepavali Exclusive',
    greeting: 'Illuminate Your Celebrations with Pure Crunch',
    subtitle: 'Royal gift hampers & gold-grade roasted fox nuts with authentic desi ghee & spices',
    ctaText: 'Explore Diwali Hampers',
    ctaLink: '/products?category=combos-and-family-packs',
    particleEffect: 'diyas',
    particleIntensity: 'vibrant',
    animationSpeed: 'normal',
    enableReducedMotionFallback: true,
    deliveryPillBadge: 'Diwali Rush Express',
    deliveryPillTime: '12 Mins',
    heroVisualType: 'diwali_lakshmi_ganesh',
    heroVisualCycleSeconds: 3.2,
    enableFloatingPetals: true,
    enableRotatingAura: true,
    enableFlickeringDiyas: true
  },
  {
    name: 'Navratri Garba & Dandiya Edition',
    slug: 'navratri-garba-and-dandiya',
    occasion: 'navratri',
    description: 'Festive garba energy, dandiya beats, and fasting-certified roasted makhana.',
    isPreset: true,
    status: 'scheduled',
    priority: 8,
    startDate: new Date('2026-10-10T00:00:00Z'),
    endDate: new Date('2026-10-22T23:59:59Z'),
    timezone: 'Asia/Kolkata',
    recurrence: 'none',
    mediaType: 'video',
    desktopMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bright-fireworks-bursting-in-the-night-sky-42871-large.mp4',
    mobileMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bright-fireworks-bursting-in-the-night-sky-42871-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#881337',
    secondaryColor: '#F59E0B',
    accentColor: '#FBBF24',
    textColor: '#FFFFFF',
    overlayOpacity: 0.42,
    blurStrength: 'backdrop-blur-md',
    badgeText: '✨ Shubh Navratri Fasting Specials',
    greeting: 'Celebrate 9 Divine Nights of Purity & Energy',
    subtitle: '100% Sendha Namak & pure rock-salt roasted jumbo makhana. Certified Vrat-Friendly.',
    ctaText: 'Shop Vrat Snacks',
    ctaLink: '/products?category=classic-roasted',
    particleEffect: 'dandiya',
    particleIntensity: 'medium',
    animationSpeed: 'normal',
    enableReducedMotionFallback: true,
    deliveryPillBadge: 'Vrat Express Dispatch',
    deliveryPillTime: '10 Mins',
    heroVisualType: 'durga_navratri',
    heroVisualCycleSeconds: 3.2,
    enableFloatingPetals: true,
    enableRotatingAura: true,
    enableFlickeringDiyas: true
  },
  {
    name: 'Holi Colors of Joy Edition',
    slug: 'holi-colors-of-joy',
    occasion: 'holi',
    description: 'Vibrant animated color dust, festive spices, and playful party snack packs.',
    isPreset: true,
    status: 'scheduled',
    priority: 7,
    startDate: new Date('2027-03-01T00:00:00Z'),
    endDate: new Date('2027-03-15T23:59:59Z'),
    timezone: 'Asia/Kolkata',
    recurrence: 'yearly',
    mediaType: 'video',
    desktopMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colored-smoke-cloud-in-slow-motion-42867-large.mp4',
    mobileMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colored-smoke-cloud-in-slow-motion-42867-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#701A75',
    secondaryColor: '#06B6D4',
    accentColor: '#FACC15',
    textColor: '#FFFFFF',
    overlayOpacity: 0.38,
    blurStrength: 'backdrop-blur-md',
    badgeText: '🎨 Rang Barse Celebration',
    greeting: 'Colors on Your Cheeks, Crunch in Your Bowl!',
    subtitle: 'Bursting flavours — Tangy Tomato, Flaming Peri Peri & Himalayan Salt Makhana.',
    ctaText: 'Grab Holi Party Packs',
    ctaLink: '/products?category=gourmet-flavoured',
    particleEffect: 'colors',
    particleIntensity: 'vibrant',
    animationSpeed: 'fast',
    enableReducedMotionFallback: true,
    deliveryPillBadge: 'Holi Express Party Dispatch',
    deliveryPillTime: '15 Mins',
    heroVisualType: 'holi_radha_krishna',
    heroVisualCycleSeconds: 3.2,
    enableFloatingPetals: true,
    enableRotatingAura: true,
    enableFlickeringDiyas: false
  },
  {
    name: 'Raksha Bandhan Sweet Bonds Edition',
    slug: 'raksha-bandhan-sweet-bonds',
    occasion: 'raksha_bandhan',
    description: 'Royal maroon & golden accents celebrating eternal sibling love with sweet makhana.',
    isPreset: true,
    status: 'draft',
    priority: 6,
    startDate: new Date('2027-08-15T00:00:00Z'),
    endDate: new Date('2027-08-30T23:59:59Z'),
    timezone: 'Asia/Kolkata',
    recurrence: 'yearly',
    mediaType: 'video',
    desktopMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-warm-bokeh-lights-loop-42868-large.mp4',
    mobileMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-warm-bokeh-lights-loop-42868-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#581C87',
    secondaryColor: '#F59E0B',
    accentColor: '#EC4899',
    textColor: '#FFFFFF',
    overlayOpacity: 0.4,
    blurStrength: 'backdrop-blur-md',
    badgeText: '💝 Rakhi Sibling Treat',
    greeting: 'Protect Their Health with Guilt-Free Sweetness',
    subtitle: 'Swap refined sugar sweets for Jaggery Caramel & Organic Dark Cocoa coated makhana.',
    ctaText: 'Gift Sweet Hampers',
    ctaLink: '/products?category=sweet-delights',
    particleEffect: 'stars',
    particleIntensity: 'medium',
    animationSpeed: 'normal',
    enableReducedMotionFallback: true,
    deliveryPillBadge: 'Rakhi Gift Express',
    deliveryPillTime: '15 Mins',
    heroVisualType: 'rakhi_sibling',
    heroVisualCycleSeconds: 3.2,
    enableFloatingPetals: true,
    enableRotatingAura: true,
    enableFlickeringDiyas: true
  },
  {
    name: 'Christmas Joy & Winter Wonderland',
    slug: 'christmas-joy-and-winter-wonderland',
    occasion: 'christmas',
    description: 'Tasteful pine emerald, falling snow, and festive holiday cheer.',
    isPreset: true,
    status: 'draft',
    priority: 5,
    startDate: new Date('2026-12-15T00:00:00Z'),
    endDate: new Date('2026-12-28T23:59:59Z'),
    timezone: 'Asia/Kolkata',
    recurrence: 'yearly',
    mediaType: 'video',
    desktopMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-winter-snowflakes-falling-down-42869-large.mp4',
    mobileMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-winter-snowflakes-falling-down-42869-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1543258108-43f742203d98?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#14532D',
    secondaryColor: '#DC2626',
    accentColor: '#FEF08A',
    textColor: '#FFFFFF',
    overlayOpacity: 0.45,
    blurStrength: 'backdrop-blur-md',
    badgeText: '🎄 Holiday Wonder & Warmth',
    greeting: 'Merry Christmas & Joyful Healthy Snacking!',
    subtitle: 'Winter evenings are cozier with warm spiced makhana & hot chocolate pairings.',
    ctaText: 'Explore Winter Treats',
    ctaLink: '/products',
    particleEffect: 'snow',
    particleIntensity: 'medium',
    animationSpeed: 'slow',
    enableReducedMotionFallback: true,
    deliveryPillBadge: 'Winter Express Delivery',
    deliveryPillTime: '15 Mins',
    heroVisualType: 'christmas_joy',
    heroVisualCycleSeconds: 3.2,
    enableFloatingPetals: true,
    enableRotatingAura: true,
    enableFlickeringDiyas: false
  },
  {
    name: 'New Year 2026 Celebration Edition',
    slug: 'new-year-celebration-edition',
    occasion: 'new_year',
    description: 'Midnight champagne gold sparkles, confetti, and clean eating resolution kick-starters.',
    isPreset: true,
    status: 'draft',
    priority: 6,
    startDate: new Date('2026-12-29T00:00:00Z'),
    endDate: new Date('2027-01-05T23:59:59Z'),
    timezone: 'Asia/Kolkata',
    recurrence: 'yearly',
    mediaType: 'video',
    desktopMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-celebration-golden-confetti-42870-large.mp4',
    mobileMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-celebration-golden-confetti-42870-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#0F172A',
    secondaryColor: '#EAB308',
    accentColor: '#38BDF8',
    textColor: '#FFFFFF',
    overlayOpacity: 0.42,
    blurStrength: 'backdrop-blur-md',
    badgeText: '🥂 Happy New Year 2026',
    greeting: 'New Year, Healthier You — Zero Guilt Superfood',
    subtitle: '10g plant protein per bowl. Make clean snacking your permanent 2026 habit.',
    ctaText: 'Start Your Resolution',
    ctaLink: '/products?category=raw-superfood',
    particleEffect: 'confetti',
    particleIntensity: 'vibrant',
    animationSpeed: 'fast',
    enableReducedMotionFallback: true,
    deliveryPillBadge: 'Midnight Express',
    deliveryPillTime: '12 Mins',
    heroVisualType: 'new_year_celebration',
    heroVisualCycleSeconds: 3.2,
    enableFloatingPetals: true,
    enableRotatingAura: true,
    enableFlickeringDiyas: false
  },
  {
    name: 'Default Zuno Artisanal Storefront',
    slug: 'default-zuno-artisanal',
    occasion: 'default',
    description: 'Clean, elegant everyday quick-commerce header with organic warm accents.',
    isPreset: true,
    status: 'active',
    priority: 0,
    startDate: null,
    endDate: null,
    timezone: 'Asia/Kolkata',
    recurrence: 'none',
    mediaType: 'gradient',
    desktopMediaUrl: '',
    mobileMediaUrl: '',
    posterUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#2E1065',
    secondaryColor: '#059669',
    accentColor: '#FBBF24',
    textColor: '#FFFFFF',
    overlayOpacity: 0.25,
    blurStrength: 'backdrop-blur-md',
    badgeText: '⚡ 10-Minute Express Grocery',
    greeting: 'Artisanal Fox Nuts — Farm Popped & Freshly Roasted',
    subtitle: 'Mithila Grade-A Makhana roasted with cold-pressed oils and Ayurvedic spice blends.',
    ctaText: 'Browse Catalog',
    ctaLink: '/products',
    particleEffect: 'none',
    particleIntensity: 'subtle',
    animationSpeed: 'normal',
    enableReducedMotionFallback: true,
    deliveryPillBadge: 'Express Dispatch',
    deliveryPillTime: '10 Mins',
    heroVisualType: 'default_lotus',
    heroVisualCycleSeconds: 3.2,
    enableFloatingPetals: true,
    enableRotatingAura: true,
    enableFlickeringDiyas: true
  }
];

// Seed presets if collection is empty
export const seedPresetsIfEmpty = async () => {
  try {
    const count = await Theme.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding festive theme presets into MongoDB...');
      await Theme.insertMany(THEME_PRESETS);
      console.log(`✅ Seeded ${THEME_PRESETS.length} festive theme presets successfully.`);
    }
  } catch (error) {
    console.error('Error seeding theme presets:', error.message);
  }
};

/**
 * Public: Get the currently active/eligible theme for customer header.
 * Server is the single source of truth for scheduling and priority resolution.
 */
export const getActiveTheme = async (req, res, next) => {
  try {
    const now = new Date();

    // Find all active or scheduled themes
    const candidateThemes = await Theme.find({
      status: { $in: ['active', 'scheduled'] }
    }).sort({ priority: -1, updatedAt: -1 });

    let chosenTheme = null;

    for (const theme of candidateThemes) {
      // 1. Manually activated theme always eligible if not expired
      if (theme.status === 'active') {
        if (!theme.endDate || new Date(theme.endDate) >= now) {
          chosenTheme = theme;
          break;
        }
      }

      // 2. Scheduled theme checking exact time window
      if (theme.status === 'scheduled') {
        const start = theme.startDate ? new Date(theme.startDate) : null;
        const end = theme.endDate ? new Date(theme.endDate) : null;

        // Non-recurring schedule
        if (theme.recurrence === 'none') {
          if ((!start || start <= now) && (!end || end >= now)) {
            chosenTheme = theme;
            break;
          }
        } else if (theme.recurrence === 'daily') {
          // Compare current hour & minute
          const curMinutes = now.getHours() * 60 + now.getMinutes();
          const startMinutes = start ? start.getHours() * 60 + start.getMinutes() : 0;
          const endMinutes = end ? end.getHours() * 60 + end.getMinutes() : 1440;
          if (curMinutes >= startMinutes && curMinutes <= endMinutes) {
            chosenTheme = theme;
            break;
          }
        } else if (theme.recurrence === 'weekly') {
          if (start && start.getDay() === now.getDay()) {
            chosenTheme = theme;
            break;
          }
        } else if (theme.recurrence === 'yearly') {
          if (start && end) {
            const curMonthDay = now.getMonth() * 100 + now.getDate();
            const startMonthDay = start.getMonth() * 100 + start.getDate();
            const endMonthDay = end.getMonth() * 100 + end.getDate();
            if (curMonthDay >= startMonthDay && curMonthDay <= endMonthDay) {
              chosenTheme = theme;
              break;
            }
          }
        }
      }
    }

    // Fallback: If no scheduled/active theme met criteria, return default Zuno theme
    if (!chosenTheme) {
      chosenTheme = await Theme.findOne({ occasion: 'default' });
    }

    // Fallback in case DB has no theme yet
    if (!chosenTheme) {
      chosenTheme = THEME_PRESETS.find(p => p.occasion === 'default') || THEME_PRESETS[0];
    }

    res.json({
      success: true,
      theme: chosenTheme,
      serverTime: now.toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all themes with filter and analytics
 */
export const getAllThemes = async (req, res, next) => {
  try {
    const { occasion, status } = req.query;
    const query = {};

    if (occasion && occasion !== 'all') query.occasion = occasion;
    if (status && status !== 'all') query.status = status;

    const themes = await Theme.find(query).sort({ priority: -1, createdAt: -1 });

    const stats = {
      total: await Theme.countDocuments(),
      active: await Theme.countDocuments({ status: 'active' }),
      scheduled: await Theme.countDocuments({ status: 'scheduled' }),
      draft: await Theme.countDocuments({ status: 'draft' }),
      expired: await Theme.countDocuments({ status: 'expired' })
    };

    res.json({
      success: true,
      count: themes.length,
      stats,
      themes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get single theme by ID
 */
export const getThemeById = async (req, res, next) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }
    res.json({ success: true, theme });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create new custom theme
 */
export const createTheme = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Theme name is required' });
    }

    let finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Theme.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const theme = await Theme.create({
      ...req.body,
      slug: finalSlug,
      isPreset: false,
      createdBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: 'Custom theme created successfully',
      theme
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update theme
 */
export const updateTheme = async (req, res, next) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    // Preserve preset slug to avoid breaking defaults
    if (theme.isPreset && req.body.slug && req.body.slug !== theme.slug) {
      delete req.body.slug;
    }

    const updated = await Theme.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Theme updated successfully',
      theme: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Duplicate an existing theme (preset or custom)
 */
export const duplicateTheme = async (req, res, next) => {
  try {
    const sourceTheme = await Theme.findById(req.params.id);
    if (!sourceTheme) {
      return res.status(404).json({ success: false, message: 'Source theme not found' });
    }

    const themeData = sourceTheme.toObject();
    delete themeData._id;
    delete themeData.createdAt;
    delete themeData.updatedAt;

    themeData.name = `${sourceTheme.name} (Copy)`;
    themeData.slug = `${sourceTheme.slug}-copy-${Date.now().toString().slice(-4)}`;
    themeData.isPreset = false;
    themeData.status = 'draft';
    themeData.createdBy = req.user?._id;

    const duplicated = await Theme.create(themeData);

    res.status(201).json({
      success: true,
      message: `Duplicated "${sourceTheme.name}" as new custom theme`,
      theme: duplicated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Instantly activate a theme
 */
export const activateTheme = async (req, res, next) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    // If activating this theme with high priority, set its status to active
    theme.status = 'active';
    theme.priority = Math.max(theme.priority || 0, 10);
    theme.updatedBy = req.user?._id;
    await theme.save();

    res.json({
      success: true,
      message: `Theme "${theme.name}" is now live on customer storefront!`,
      theme
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete a theme
 */
export const deleteTheme = async (req, res, next) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    if (theme.isPreset && theme.occasion === 'default') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the core default Zuno theme.'
      });
    }

    await Theme.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Theme "${theme.name}" removed successfully.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Reset / reseed presets
 */
export const resetPresets = async (req, res, next) => {
  try {
    for (const preset of THEME_PRESETS) {
      await Theme.findOneAndUpdate(
        { slug: preset.slug },
        { $set: preset },
        { upsert: true, new: true }
      );
    }
    const all = await Theme.find().sort({ priority: -1 });
    res.json({
      success: true,
      message: 'All standard festive presets reset to defaults successfully',
      themes: all
    });
  } catch (error) {
    next(error);
  }
};
