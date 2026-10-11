/**
 * Zuno Theme Aesthetics Engine
 * "Upto this (Header) make more bold than below so that it looks like header"
 * - Upper (Navbar): Rich, bold, vibrant, authentic festive quick-commerce header.
 * - Below (Home Hero Section & Cards): Much softer, lighter, less bold tint of the same color
 *   that diffuses down into crisp, clean, real-look atmosphere.
 */

export const THEME_PALETTES = {
  // 1. DIWALI: Bold Royal Imperial Purple Header + Softer Lavender Warmth Below
  diwali: {
    id: 'diwali',
    visualType: 'diwali_lakshmi_ganesh',
    // Upper: BOLD rich royal imperial festive purple (anchors the screen as header)
    headerBg: 'linear-gradient(180deg, #2E0854 0%, #3B0764 45%, #4C1D95 100%)',
    headerBorder: 'border-purple-900/40',
    headerTextColor: 'text-white',
    headerSubtextColor: 'text-amber-200',
    etaBadgeBg: 'bg-amber-400 text-charcoal-950 font-black shadow-sm',
    addressCaretColor: 'text-amber-300',
    searchContainerBg: 'bg-white text-charcoal-900 placeholder-gray-500 shadow-sm border border-purple-200/60',
    categoryActiveBg: 'bg-amber-400 text-charcoal-950 font-black shadow-md',
    categoryInactiveText: 'text-purple-100/85 hover:text-white',
    activeUnderline: 'bg-amber-400',

    // Below: LESS BOLD — soft gentle lilac fade-down
    homeSectionBg: 'linear-gradient(180deg, #581C87 0%, #7C3AED 18%, #A78BFA 38%, #EDE9FE 62%, #FAF5FF 85%, #FFFFFF 100%)',
    cardBg: 'bg-white/95 hover:bg-white border border-purple-200/80 shadow-md backdrop-blur-xs',
    cardTitleColor: 'text-charcoal-950',
    cardSubtitleColor: 'text-purple-900 font-bold',
    cardImageBg: 'bg-purple-50/70 border border-purple-100',

    // Banner Stage
    bannerTitleColor: 'text-white drop-shadow-md',
    bannerMantraColor: 'text-amber-200 drop-shadow-sm',
    bannerSubColor: 'text-purple-100 drop-shadow-xs',
    bannerBadgeBg: 'bg-amber-400 text-charcoal-950 font-black shadow-xs',
    toranColor: '#D97706',
    accentColor: '#F59E0B',
    glowColor: '#FEF08A'
  },

  // 2. NAVRATRI: Bold Sacred Temple Vermilion Header + Softer Warm Peach Below
  navratri: {
    id: 'navratri',
    visualType: 'durga_navratri',
    // Upper: BOLD sacred temple vermilion & kumkum
    headerBg: 'linear-gradient(180deg, #7F1D1D 0%, #991B1B 45%, #B91C1C 100%)',
    headerBorder: 'border-red-900/40',
    headerTextColor: 'text-white',
    headerSubtextColor: 'text-amber-200',
    etaBadgeBg: 'bg-amber-400 text-charcoal-950 font-black shadow-sm',
    addressCaretColor: 'text-amber-300',
    searchContainerBg: 'bg-white text-charcoal-900 placeholder-gray-500 shadow-sm border border-red-200/60',
    categoryActiveBg: 'bg-amber-400 text-charcoal-950 font-black shadow-md',
    categoryInactiveText: 'text-rose-100/85 hover:text-white',
    activeUnderline: 'bg-amber-400',

    // Below: LESS BOLD — soft gentle vermilion to warm cream fade
    homeSectionBg: 'linear-gradient(180deg, #C2410C 0%, #EA580C 18%, #FB923C 38%, #FFEDD5 62%, #FFF7ED 85%, #FFFFFF 100%)',
    cardBg: 'bg-white/95 hover:bg-white border border-amber-200/80 shadow-md backdrop-blur-xs',
    cardTitleColor: 'text-charcoal-950',
    cardSubtitleColor: 'text-amber-950 font-bold',
    cardImageBg: 'bg-amber-50/70 border border-amber-100',

    // Banner Stage
    bannerTitleColor: 'text-white drop-shadow-md',
    bannerMantraColor: 'text-amber-200 drop-shadow-sm',
    bannerSubColor: 'text-rose-100 drop-shadow-xs',
    bannerBadgeBg: 'bg-amber-400 text-charcoal-950 font-black shadow-xs',
    toranColor: '#EA580C',
    accentColor: '#F59E0B',
    glowColor: '#FEF08A'
  },

  // 3. HOLI: Bold Vrindavan Rose-Magenta Header + Softer Pastel Pink Below
  holi: {
    id: 'holi',
    visualType: 'holi_radha_krishna',
    // Upper: BOLD rich Vrindavan rose-magenta
    headerBg: 'linear-gradient(180deg, #700B36 0%, #831843 45%, #9D174D 100%)',
    headerBorder: 'border-pink-900/40',
    headerTextColor: 'text-white',
    headerSubtextColor: 'text-pink-200',
    etaBadgeBg: 'bg-cyan-400 text-charcoal-950 font-black shadow-sm',
    addressCaretColor: 'text-yellow-300',
    searchContainerBg: 'bg-white text-charcoal-900 placeholder-gray-500 shadow-sm border border-pink-200/60',
    categoryActiveBg: 'bg-yellow-400 text-charcoal-950 font-black shadow-md',
    categoryInactiveText: 'text-pink-100/85 hover:text-white',
    activeUnderline: 'bg-yellow-400',

    // Below: LESS BOLD — soft gentle pastel rose fade
    homeSectionBg: 'linear-gradient(180deg, #BE185D 0%, #DB2777 18%, #F472B6 38%, #FCE7F3 62%, #FDF2F8 85%, #FFFFFF 100%)',
    cardBg: 'bg-white/95 hover:bg-white border border-pink-200/80 shadow-md backdrop-blur-xs',
    cardTitleColor: 'text-charcoal-950',
    cardSubtitleColor: 'text-pink-950 font-bold',
    cardImageBg: 'bg-pink-50/70 border border-pink-100',

    // Banner Stage
    bannerTitleColor: 'text-white drop-shadow-md',
    bannerMantraColor: 'text-yellow-200 drop-shadow-sm',
    bannerSubColor: 'text-pink-100 drop-shadow-xs',
    bannerBadgeBg: 'bg-yellow-400 text-charcoal-950 font-black shadow-xs',
    toranColor: '#F43F5E',
    accentColor: '#EC4899',
    glowColor: '#FACC15'
  },

  // 4. RAKSHA BANDHAN: Bold Royal Velvet Crimson Header + Softer Rose Quartz Below
  raksha_bandhan: {
    id: 'raksha_bandhan',
    visualType: 'rakhi_sibling',
    // Upper: BOLD royal velvet wine crimson
    headerBg: 'linear-gradient(180deg, #4C0519 0%, #700E2C 45%, #881337 100%)',
    headerBorder: 'border-rose-950/40',
    headerTextColor: 'text-white',
    headerSubtextColor: 'text-rose-200',
    etaBadgeBg: 'bg-amber-400 text-charcoal-950 font-black shadow-sm',
    addressCaretColor: 'text-amber-300',
    searchContainerBg: 'bg-white text-charcoal-900 placeholder-gray-500 shadow-sm border border-rose-200/60',
    categoryActiveBg: 'bg-amber-400 text-charcoal-950 font-black shadow-md',
    categoryInactiveText: 'text-rose-100/85 hover:text-white',
    activeUnderline: 'bg-amber-400',

    // Below: LESS BOLD — soft rose-quartz silk fade
    homeSectionBg: 'linear-gradient(180deg, #9F1239 0%, #BE123C 18%, #FB7185 38%, #FFE4E6 62%, #FFF1F2 85%, #FFFFFF 100%)',
    cardBg: 'bg-white/95 hover:bg-white border border-rose-200/80 shadow-md backdrop-blur-xs',
    cardTitleColor: 'text-charcoal-950',
    cardSubtitleColor: 'text-rose-950 font-bold',
    cardImageBg: 'bg-rose-50/70 border border-rose-100',

    // Banner Stage
    bannerTitleColor: 'text-white drop-shadow-md',
    bannerMantraColor: 'text-amber-200 drop-shadow-sm',
    bannerSubColor: 'text-rose-100 drop-shadow-xs',
    bannerBadgeBg: 'bg-amber-400 text-charcoal-950 font-black shadow-xs',
    toranColor: '#BE123C',
    accentColor: '#F43F5E',
    glowColor: '#FDE047'
  },

  // 5. CHRISTMAS & WINTER: Bold Alpine Pine Emerald Header + Softer Frosted Mint Below
  christmas: {
    id: 'christmas',
    visualType: 'christmas_joy',
    // Upper: BOLD rich alpine pine forest emerald
    headerBg: 'linear-gradient(180deg, #022C22 0%, #064E3B 45%, #065F46 100%)',
    headerBorder: 'border-emerald-950/40',
    headerTextColor: 'text-white',
    headerSubtextColor: 'text-emerald-200',
    etaBadgeBg: 'bg-red-500 text-white font-black shadow-sm',
    addressCaretColor: 'text-yellow-300',
    searchContainerBg: 'bg-white text-charcoal-900 placeholder-gray-500 shadow-sm border border-emerald-200/60',
    categoryActiveBg: 'bg-red-600 text-white font-black shadow-md',
    categoryInactiveText: 'text-emerald-100/85 hover:text-white',
    activeUnderline: 'bg-red-500',

    // Below: LESS BOLD — soft frosted mint-pine fade
    homeSectionBg: 'linear-gradient(180deg, #047857 0%, #059669 18%, #34D399 38%, #D1FAE5 62%, #ECFDF5 85%, #FFFFFF 100%)',
    cardBg: 'bg-white/95 hover:bg-white border border-emerald-200/80 shadow-md backdrop-blur-xs',
    cardTitleColor: 'text-charcoal-950',
    cardSubtitleColor: 'text-emerald-950 font-bold',
    cardImageBg: 'bg-emerald-50/70 border border-emerald-100',

    // Banner Stage
    bannerTitleColor: 'text-white drop-shadow-md',
    bannerMantraColor: 'text-amber-200 drop-shadow-sm',
    bannerSubColor: 'text-emerald-100 drop-shadow-xs',
    bannerBadgeBg: 'bg-red-500 text-white font-black shadow-xs',
    toranColor: '#16A34A',
    accentColor: '#10B981',
    glowColor: '#FEF08A'
  },

  // 6. NEW YEAR 2026: Bold Midnight Obsidian Navy Header + Softer Ice-Sapphire Below
  new_year: {
    id: 'new_year',
    visualType: 'new_year_celebration',
    // Upper: BOLD rich midnight galaxy obsidian navy
    headerBg: 'linear-gradient(180deg, #020617 0%, #0F172A 45%, #1E293B 100%)',
    headerBorder: 'border-slate-800/40',
    headerTextColor: 'text-white',
    headerSubtextColor: 'text-amber-200',
    etaBadgeBg: 'bg-amber-400 text-charcoal-950 font-black shadow-sm',
    addressCaretColor: 'text-amber-400',
    searchContainerBg: 'bg-white text-charcoal-900 placeholder-gray-500 shadow-sm border border-slate-300/40',
    categoryActiveBg: 'bg-amber-400 text-charcoal-950 font-black shadow-md',
    categoryInactiveText: 'text-gray-300 hover:text-white',
    activeUnderline: 'bg-amber-400',

    // Below: LESS BOLD — soft sapphire sky fade
    homeSectionBg: 'linear-gradient(180deg, #334155 0%, #475569 18%, #94A3B8 38%, #E2E8F0 62%, #F8FAFC 85%, #FFFFFF 100%)',
    cardBg: 'bg-white/95 hover:bg-white border border-slate-200/80 shadow-md backdrop-blur-xs',
    cardTitleColor: 'text-charcoal-950',
    cardSubtitleColor: 'text-slate-900 font-bold',
    cardImageBg: 'bg-slate-50/70 border border-slate-200',

    // Banner Stage
    bannerTitleColor: 'text-white drop-shadow-md',
    bannerMantraColor: 'text-amber-300 drop-shadow-sm',
    bannerSubColor: 'text-slate-100 drop-shadow-xs',
    bannerBadgeBg: 'bg-amber-400 text-charcoal-950 font-black shadow-xs',
    toranColor: '#CA8A04',
    accentColor: '#CA8A04',
    glowColor: '#38BDF8'
  },

  // 7. DEFAULT ZUNO ARTISANAL: Bold Wetland Jade Header + Softer Dewy Green Below
  default: {
    id: 'default',
    visualType: 'default_lotus',
    // Upper: BOLD rich wetland artisanal jade
    headerBg: 'linear-gradient(180deg, #022C22 0%, #064E3B 45%, #047857 100%)',
    headerBorder: 'border-emerald-900/40',
    headerTextColor: 'text-white',
    headerSubtextColor: 'text-emerald-100',
    etaBadgeBg: 'bg-amber-400 text-charcoal-950 font-black shadow-sm',
    addressCaretColor: 'text-amber-300',
    searchContainerBg: 'bg-white text-charcoal-900 placeholder-gray-500 shadow-sm border border-emerald-200/60',
    categoryActiveBg: 'bg-amber-400 text-charcoal-950 font-black shadow-md',
    categoryInactiveText: 'text-emerald-100/85 hover:text-white',
    activeUnderline: 'bg-amber-400',

    // Below: LESS BOLD — soft dewy wetland green fade
    homeSectionBg: 'linear-gradient(180deg, #059669 0%, #10B981 18%, #6EE7B7 38%, #D1FAE5 62%, #ECFDF5 85%, #FFFFFF 100%)',
    cardBg: 'bg-white/95 hover:bg-white border border-emerald-200/80 shadow-md backdrop-blur-xs',
    cardTitleColor: 'text-charcoal-950',
    cardSubtitleColor: 'text-emerald-950 font-bold',
    cardImageBg: 'bg-emerald-50/70 border border-emerald-100',

    // Banner Stage
    bannerTitleColor: 'text-white drop-shadow-md',
    bannerMantraColor: 'text-amber-200 drop-shadow-sm',
    bannerSubColor: 'text-emerald-100 drop-shadow-xs',
    bannerBadgeBg: 'bg-amber-400 text-charcoal-950 font-black shadow-xs',
    toranColor: '#059669',
    accentColor: '#059669',
    glowColor: '#FB7185'
  }
};

/**
 * Resolves theme styling based on theme object, occasion, or heroVisualType.
 */
export function getThemeStyles(theme) {
  if (!theme) return THEME_PALETTES.diwali;

  // Resolve by explicit heroVisualType
  const visualType = theme.heroVisualType;
  if (visualType === 'diwali_lakshmi_ganesh') return THEME_PALETTES.diwali;
  if (visualType === 'durga_navratri') return THEME_PALETTES.navratri;
  if (visualType === 'holi_radha_krishna') return THEME_PALETTES.holi;
  if (visualType === 'rakhi_sibling') return THEME_PALETTES.raksha_bandhan;
  if (visualType === 'christmas_joy') return THEME_PALETTES.christmas;
  if (visualType === 'new_year_celebration') return THEME_PALETTES.new_year;
  if (visualType === 'default_lotus') return THEME_PALETTES.default;

  // Resolve by occasion
  const occasion = theme.occasion;
  if (occasion && THEME_PALETTES[occasion]) {
    return THEME_PALETTES[occasion];
  }

  return THEME_PALETTES.diwali;
}
