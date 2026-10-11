import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  occasion: {
    type: String,
    enum: [
      'navratri',
      'diwali',
      'holi',
      'raksha_bandhan',
      'christmas',
      'new_year',
      'default',
      'custom'
    ],
    default: 'custom'
  },
  description: {
    type: String,
    default: ''
  },
  isPreset: {
    type: Boolean,
    default: false
  },

  // Lifecycle & status
  status: {
    type: String,
    enum: ['active', 'scheduled', 'draft', 'expired', 'archived'],
    default: 'draft'
  },
  priority: {
    type: Number,
    default: 0
  },

  // Scheduling & Recurrence (authoritative on server)
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'yearly'],
    default: 'none'
  },

  // Visual Assets & Video loops
  mediaType: {
    type: String,
    enum: ['video', 'image', 'gradient'],
    default: 'video'
  },
  desktopMediaUrl: {
    type: String,
    default: ''
  },
  mobileMediaUrl: {
    type: String,
    default: ''
  },
  posterUrl: {
    type: String,
    default: ''
  },

  // Colors & Visual Styling
  primaryColor: {
    type: String,
    default: '#2E1065'
  },
  secondaryColor: {
    type: String,
    default: '#F59E0B'
  },
  accentColor: {
    type: String,
    default: '#10B981'
  },
  textColor: {
    type: String,
    default: '#FFFFFF'
  },
  overlayOpacity: {
    type: Number,
    default: 0.4,
    min: 0,
    max: 0.95
  },
  blurStrength: {
    type: String,
    default: 'backdrop-blur-md'
  },

  // Header Copy & Promotional Call to Action
  badgeText: {
    type: String,
    default: 'Festive Special'
  },
  greeting: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  ctaText: {
    type: String,
    default: ''
  },
  ctaLink: {
    type: String,
    default: '/products'
  },

  // Realistic Motion, Particles & Lighting
  particleEffect: {
    type: String,
    enum: ['diyas', 'dandiya', 'colors', 'confetti', 'snow', 'stars', 'none'],
    default: 'none'
  },
  particleIntensity: {
    type: String,
    enum: ['subtle', 'medium', 'vibrant'],
    default: 'medium'
  },
  animationSpeed: {
    type: String,
    enum: ['slow', 'normal', 'fast'],
    default: 'normal'
  },
  enableReducedMotionFallback: {
    type: Boolean,
    default: true
  },

  // Quick-Commerce Delivery Pill
  deliveryPillBadge: {
    type: String,
    default: 'Express Dispatch'
  },
  deliveryPillTime: {
    type: String,
    default: '12 Mins'
  },

  // Dynamic Moving Festive Deity & Hero Visual Engine
  heroVisualType: {
    type: String,
    enum: [
      'durga_navratri',
      'diwali_lakshmi_ganesh',
      'holi_radha_krishna',
      'rakhi_sibling',
      'christmas_joy',
      'new_year_celebration',
      'default_lotus',
      'none'
    ],
    default: 'durga_navratri'
  },
  heroVisualCycleSeconds: {
    type: Number,
    default: 3.2,
    min: 1,
    max: 15
  },
  enableFloatingPetals: {
    type: Boolean,
    default: true
  },
  enableRotatingAura: {
    type: Boolean,
    default: true
  },
  enableFlickeringDiyas: {
    type: Boolean,
    default: true
  },
  heroVisualCustomImages: {
    type: [String],
    default: []
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

themeSchema.index({ status: 1, priority: -1, startDate: 1, endDate: 1 });

export default mongoose.model('Theme', themeSchema);
