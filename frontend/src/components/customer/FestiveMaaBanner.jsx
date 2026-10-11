import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Award, Flame, Heart } from 'lucide-react';
import api from '../../api/client';

export default function FestiveMaaBanner({ activeThemeProp }) {
  const [theme, setTheme] = useState(activeThemeProp || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch or sync active theme if not passed as prop
  useEffect(() => {
    if (activeThemeProp) {
      setTheme(activeThemeProp);
      return;
    }

    const fetchTheme = async () => {
      try {
        const res = await api.get('/themes/active');
        if (res.data?.success && res.data.theme) {
          setTheme(res.data.theme);
        }
      } catch {
        // Fallback
      }
    };

    fetchTheme();

    const handleSync = (e) => {
      if (e.key === 'zuno_active_theme_sync') {
        fetchTheme();
      }
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, [activeThemeProp]);

  // Determine visual catalog based on theme.heroVisualType or theme.occasion
  const visualType =
    theme?.heroVisualType !== undefined
      ? theme.heroVisualType
      : (theme?.occasion === 'navratri'
      ? 'durga_navratri'
      : theme?.occasion === 'diwali'
      ? 'diwali_lakshmi_ganesh'
      : theme?.occasion === 'holi'
      ? 'holi_radha_krishna'
      : theme?.occasion === 'raksha_bandhan'
      ? 'rakhi_sibling'
      : theme?.occasion === 'christmas'
      ? 'christmas_joy'
      : theme?.occasion === 'new_year'
      ? 'new_year_celebration'
      : 'durga_navratri');

  // Multi-Festival Avatars & Moving Visual Catalog
  const visualCatalogs = {
    // 1. NAVRATRI: 6 Divine Avatars of Maa Durga
    durga_navratri: [
      {
        id: 'simhavahini',
        title: 'Maa Durga Simhavahini',
        formNumber: 'Maha Shakti',
        mantra: 'ॐ दुं दुर्गायै नमः • Victory Over All Obstacles',
        accentColor: '#D97706',
        badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
        description: 'Ten-armed Protector riding the golden lion, blessing your home with health & prosperity',
        symbol: '🔱 Trishul & Lion',
        primaryRobe: '#DC2626',
        secondaryRobe: '#F59E0B',
        visualType: 'durga'
      },
      {
        id: 'shailaputri',
        title: 'Maa Shailaputri',
        formNumber: 'Day 1 • Prathama',
        mantra: 'वन्दे वाञ्छितलाभाय चन्द्रार्धकृतशेखराम् • Purity & New Beginnings',
        accentColor: '#B45309',
        badgeBg: 'bg-orange-100 text-orange-950 border-orange-300',
        description: 'Daughter of the Himalayas, riding sacred Nandi with divine Lotus & Crescent Moon',
        symbol: '🌸 Sacred Lotus',
        primaryRobe: '#EA580C',
        secondaryRobe: '#FBBF24',
        visualType: 'durga'
      },
      {
        id: 'chandraghanta',
        title: 'Maa Chandraghanta',
        formNumber: 'Day 3 • Tritiya',
        mantra: 'पिण्डज प्रवरारूढा चण्डकोपास्त्रकैर्युता • Courage & Inner Strength',
        accentColor: '#991B1B',
        badgeBg: 'bg-rose-100 text-rose-950 border-rose-300',
        description: 'Golden radiance with bell-shaped crescent moon on forehead, warding off negative energies',
        symbol: '🔔 Golden Bell',
        primaryRobe: '#BE123C',
        secondaryRobe: '#FCD34D',
        visualType: 'durga'
      },
      {
        id: 'kushmanda',
        title: 'Maa Kushmanda',
        formNumber: 'Day 4 • Chaturthi',
        mantra: 'सुरासम्पूर्ण कलशं रुधिराप्लुतमेव च • Radiance & Solar Light',
        accentColor: '#C2410C',
        badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
        description: 'Cosmic Creator smiling inside the blazing Sun, blessing devotees with boundless vital energy',
        symbol: '☀️ Solar Chakra',
        primaryRobe: '#D97706',
        secondaryRobe: '#FEF08A',
        visualType: 'durga'
      },
      {
        id: 'katyayani',
        title: 'Maa Katyayani',
        formNumber: 'Day 6 • Shashthi',
        mantra: 'चन्द्रहासोज्ज्वलकरा शार्दूलवरवाहना • Auspicious Triumph',
        accentColor: '#9A3412',
        badgeBg: 'bg-red-100 text-red-950 border-red-300',
        description: 'Slayer of darkness with gleaming divine sword and blessing lotus mudra',
        symbol: '⚔️ Divine Sword',
        primaryRobe: '#B91C1C',
        secondaryRobe: '#F59E0B',
        visualType: 'durga'
      },
      {
        id: 'mahagauri',
        title: 'Maa Mahagauri',
        formNumber: 'Day 8 • Ashtami',
        mantra: 'श्वेते वृषेसमारूढा श्वेताम्बरधरा शुचिः • Serenity & Supreme Grace',
        accentColor: '#7C2D12',
        badgeBg: 'bg-yellow-100 text-yellow-950 border-yellow-300',
        description: 'Goddess of luminous peace, pure white garments, granting fulfillment of all auspicious wishes',
        symbol: '🤍 Sacred Conch',
        primaryRobe: '#92400E',
        secondaryRobe: '#FDE047',
        visualType: 'durga'
      }
    ],

    // 2. DIWALI: Maha Lakshmi & Shri Ganesha
    diwali_lakshmi_ganesh: [
      {
        id: 'lakshmi',
        title: 'Goddess Maha Lakshmi',
        formNumber: 'Deepavali Blessings',
        mantra: 'ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद • Wealth & Joy',
        accentColor: '#D97706',
        badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
        description: 'Seated on golden lotus, bestowing golden coins of prosperity, good health & abundance',
        symbol: '🪙 Golden Coins & Lotus',
        primaryRobe: '#DC2626',
        secondaryRobe: '#F59E0B',
        visualType: 'lakshmi'
      },
      {
        id: 'ganesha',
        title: 'Shri Vighnaharta Ganesha',
        formNumber: 'Shubh Shuruwaat',
        mantra: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ • Wisdom & Auspicious Beginnings',
        accentColor: '#B45309',
        badgeBg: 'bg-orange-100 text-orange-950 border-orange-300',
        description: 'Remover of all obstacles, blessing every new venture with sweet prosperity and wisdom',
        symbol: '🪔 Modak & Trishul',
        primaryRobe: '#EA580C',
        secondaryRobe: '#FBBF24',
        visualType: 'ganesha'
      },
      {
        id: 'deepavali_diya',
        title: 'Deepotsav Illumination',
        formNumber: 'Festival of Lights',
        mantra: 'तमसो मा ज्योतिर्गमय • From Darkness into Radiant Light',
        accentColor: '#991B1B',
        badgeBg: 'bg-yellow-100 text-yellow-950 border-yellow-300',
        description: 'Thousands of glowing earthen diyas illuminating homes with warmth and pure celebration',
        symbol: '✨ Golden Brass Diya',
        primaryRobe: '#B91C1C',
        secondaryRobe: '#FDE047',
        visualType: 'diwali_diya'
      }
    ],

    // 3. HOLI: Radha Krishna Rangotsav
    holi_radha_krishna: [
      {
        id: 'radha_krishna_phool',
        title: 'Radha Krishna Phoolon Ki Holi',
        formNumber: 'Braj Rangotsav',
        mantra: 'हरे कृष्ण हरे राम • Colors of Pure Love & Devotion',
        accentColor: '#7C3AED',
        badgeBg: 'bg-purple-100 text-purple-950 border-purple-300',
        description: 'Showering fragrant rose and marigold petals in the sacred groves of Vrindavan',
        symbol: '🌸 Phoolon Ki Holi',
        primaryRobe: '#EC4899',
        secondaryRobe: '#8B5CF6',
        visualType: 'holi'
      },
      {
        id: 'rang_barse',
        title: 'Gulal & Spring Blossom',
        formNumber: 'Joyful Colors',
        mantra: 'रंग बरसे भीगे चुनर वाली • Joyous Festive Crunch',
        accentColor: '#DB2777',
        badgeBg: 'bg-pink-100 text-pink-950 border-pink-300',
        description: 'Swirling clouds of natural gulal, golden turmeric, and joyful music of spring',
        symbol: '🎨 Gulal & Pichkari',
        primaryRobe: '#F43F5E',
        secondaryRobe: '#FACC15',
        visualType: 'holi'
      }
    ],

    // 4. RAKSHA BANDHAN: Sacred Rakhi Thread
    rakhi_sibling: [
      {
        id: 'rakhi_sutra',
        title: 'Pavitra Rakhi Sutra',
        formNumber: 'Sibling Love',
        mantra: 'येन बद्धो बली राजा दानवेन्द्रो महाबलः • Eternal Protection & Love',
        accentColor: '#991B1B',
        badgeBg: 'bg-rose-100 text-rose-950 border-rose-300',
        description: 'Golden silk thread adorned with rudraksha, celebrating the unbreakable sibling bond',
        symbol: '💝 Golden Rakhi Thread',
        primaryRobe: '#DC2626',
        secondaryRobe: '#FBBF24',
        visualType: 'rakhi'
      }
    ],

    // 5. CHRISTMAS & WINTER
    christmas_joy: [
      {
        id: 'santa_wonder',
        title: 'Holiday Wonder & Cheer',
        formNumber: 'Merry Christmas',
        mantra: 'Season of Giving & Warmth • Peace and Good Health',
        accentColor: '#15803D',
        badgeBg: 'bg-emerald-100 text-emerald-950 border-emerald-300',
        description: 'Glowing festive pine, jingling bells, and warm artisanal roasted snacks by the fireside',
        symbol: '🎄 Holiday Pine & Gifts',
        primaryRobe: '#DC2626',
        secondaryRobe: '#16A34A',
        visualType: 'christmas'
      }
    ],

    // 6. NEW YEAR CELEBRATION
    new_year_celebration: [
      {
        id: 'new_year_2026',
        title: 'Happy New Year 2026',
        formNumber: 'Clean Eating Resolution',
        mantra: 'Midnight Countdown & Golden Fireworks • 365 Days of Vitality',
        accentColor: '#1E293B',
        badgeBg: 'bg-slate-100 text-slate-950 border-slate-300',
        description: 'Champagne gold confetti, fireworks, and adopting 100% plant-based healthy snacking',
        symbol: '🥂 2026 Celebration',
        primaryRobe: '#0F172A',
        secondaryRobe: '#EAB308',
        visualType: 'new_year'
      }
    ],

    // 7. DEFAULT: Sacred Lotus & Fox Nut Harvest
    default_lotus: [
      {
        id: 'mithila_lotus',
        title: 'Mithila Lotus Heritage',
        formNumber: 'Artisanal Fox Nuts',
        mantra: 'Single-Origin Grade-A Makhana • Slow Roasted with Virgin Olive Oil',
        accentColor: '#059669',
        badgeBg: 'bg-emerald-100 text-emerald-950 border-emerald-300',
        description: 'Pristine wetland lotus seeds harvested with care and slow-roasted for ultimate crunch',
        symbol: '🪷 Blooming Lotus',
        primaryRobe: '#047857',
        secondaryRobe: '#FCD34D',
        visualType: 'lotus'
      }
    ]
  };

  // If admin sets visual to 'none', do not render banner
  if (visualType === 'none') {
    return null;
  }

  // Support custom uploaded deity images if configured in theme
  const customAvatars = (theme?.heroVisualCustomImages || []).filter(Boolean).map((url, idx) => ({
    id: `custom_${idx}`,
    title: `${theme.name || 'Festive'} Deity Visual ${idx + 1}`,
    formNumber: `Sacred Form ${idx + 1}`,
    mantra: theme.greeting || 'Festive Celebration & Auspicious Blessings',
    accentColor: theme.secondaryColor || '#D97706',
    badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
    description: theme.subtitle || 'Custom festive visual celebration',
    symbol: '✨ Divine Blessings',
    primaryRobe: theme.primaryColor || '#DC2626',
    secondaryRobe: theme.secondaryColor || '#F59E0B',
    imageUrl: url,
    visualType: 'custom_image'
  }));

  const currentAvatarList = customAvatars.length > 0
    ? customAvatars
    : (visualCatalogs[visualType] || visualCatalogs.durga_navratri);
  const cycleSeconds = Math.max(1.5, Math.min(15, theme?.heroVisualCycleSeconds || 3.2));
  const enablePetals = theme?.enableFloatingPetals !== false;
  const enableAura = theme?.enableRotatingAura !== false;
  const enableDiyas = theme?.enableFlickeringDiyas !== false;

  // Auto-advance avatar based on configured cycleSeconds
  useEffect(() => {
    if (isPaused || currentAvatarList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentAvatarList.length);
    }, cycleSeconds * 1000);
    return () => clearInterval(timer);
  }, [isPaused, currentAvatarList.length, cycleSeconds]);

  // Reset index if category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [visualType]);

  const activeAvatar = currentAvatarList[currentIndex] || currentAvatarList[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + currentAvatarList.length) % currentAvatarList.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % currentAvatarList.length);
  };

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Moving Floating Petals Background System */}
      {enablePetals && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
          {[1, 2, 3, 4, 5, 6].map((petal) => (
            <span
              key={petal}
              className="absolute rounded-full pointer-events-none opacity-70"
              style={{
                width: `${(petal % 3) * 4 + 8}px`,
                height: `${(petal % 3) * 6 + 10}px`,
                left: `${petal * 16}%`,
                bottom: '10px',
                backgroundColor: petal % 2 === 0 ? '#F59E0B' : '#E11D48',
                borderRadius: '50% 0 50% 50%',
                animation: `floatPetal ${3.5 + (petal % 3)}s ease-in-out infinite`,
                animationDelay: `${petal * 0.6}s`
              }}
            />
          ))}
        </div>
      )}

      {/* 2. Traditional Garland Toran Border */}
      <div className="w-full flex justify-center mb-2">
        <svg
          className="w-full max-w-lg h-6 text-[#D97706]/80 filter drop-shadow-xs"
          viewBox="0 0 400 24"
          fill="currentColor"
        >
          <path
            d="M0,0 Q25,20 50,0 Q75,20 100,0 Q125,20 150,0 Q175,20 200,0 Q225,20 250,0 Q275,20 300,0 Q325,20 350,0 Q375,20 400,0 L400,4 Q375,24 350,4 Q325,24 300,4 Q275,24 250,4 Q225,24 200,4 Q175,24 150,4 Q125,24 100,4 Q75,24 50,4 Q25,24 0,4 Z"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* 3. Center Hero Stage: Animated Rotating Chakra & Divine Visual */}
      <div className="relative flex flex-col items-center justify-center text-center my-1">
        {/* Navigation Arrows (if > 1 avatar) */}
        {currentAvatarList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-1 sm:left-4 z-20 w-8 h-8 rounded-full bg-white/75 hover:bg-white text-charcoal-900 shadow-md flex items-center justify-center transition active:scale-90"
              aria-label="Previous Avatar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-1 sm:right-4 z-20 w-8 h-8 rounded-full bg-white/75 hover:bg-white text-charcoal-900 shadow-md flex items-center justify-center transition active:scale-90"
              aria-label="Next Avatar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Central Stage Container */}
        <div className="relative w-56 h-36 sm:w-72 sm:h-44 flex items-center justify-center">
          {/* Animated Moving Halo Aura */}
          {enableAura && (
            <div className="absolute w-44 h-44 rounded-full bg-amber-400/40 blur-2xl animate-aura-glow pointer-events-none" />
          )}

          {/* Rotating Solar Chakra Rays behind Avatar */}
          {enableAura && (
            <div className="absolute w-40 h-40 sm:w-48 sm:h-48 animate-spin-slow pointer-events-none opacity-75">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#F59E0B]">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" />
                {[...Array(16)].map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={50 + 44 * Math.cos((i * Math.PI) / 8)}
                    y2={50 + 44 * Math.sin((i * Math.PI) / 8)}
                    stroke="currentColor"
                    strokeWidth="0.8"
                    opacity="0.5"
                  />
                ))}
              </svg>
            </div>
          )}

          {/* Flickering Traditional Clay Diyas on Left & Right */}
          {enableDiyas && (
            <>
              <div className="absolute -left-2 sm:left-1 bottom-4 flex flex-col items-center pointer-events-none z-10">
                <div className="w-3.5 h-5 rounded-full bg-gradient-to-t from-amber-500 via-yellow-300 to-white animate-flame blur-[0.5px] shadow-[0_0_12px_#F59E0B]" />
                <div className="w-7 h-3 rounded-b-full bg-[#92400E] border-t border-amber-600 shadow-xs" />
              </div>

              <div className="absolute -right-2 sm:right-1 bottom-4 flex flex-col items-center pointer-events-none z-10">
                <div className="w-3.5 h-5 rounded-full bg-gradient-to-t from-amber-500 via-yellow-300 to-white animate-flame blur-[0.5px] shadow-[0_0_12px_#F59E0B]" />
                <div className="w-7 h-3 rounded-b-full bg-[#92400E] border-t border-amber-600 shadow-xs" />
              </div>
            </>
          )}

          {/* Dynamic Changing Graphic Avatars with Smooth Crossfade */}
          <div className="relative w-full h-full flex items-center justify-center z-10">
            {currentAvatarList.map((avatar, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <div
                  key={avatar.id}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
                    isCurrent
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  {/* Visual Render according to avatar.visualType or custom image */}
                  {avatar.imageUrl ? (
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-luxury border-2 border-amber-400 bg-white/20 p-1 backdrop-blur-xs flex items-center justify-center">
                      <img
                        src={avatar.imageUrl}
                        alt={avatar.title}
                        className="w-full h-full object-contain rounded-xl drop-shadow-md"
                      />
                    </div>
                  ) : (
                    <svg
                      viewBox="0 0 200 135"
                      className="w-full h-full filter drop-shadow-md"
                      style={{ color: avatar.accentColor }}
                      fill="currentColor"
                    >
                    {/* Golden Radiating Sun Nimbus */}
                    <circle cx="100" cy="50" r="34" fill="#FEF08A" opacity="0.3" />
                    <circle cx="100" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />

                    {/* RENDER A: DURGA MOTIF */}
                    {avatar.visualType === 'durga' && (
                      <>
                        <path d="M38,48 C34,40 42,34 46,40 C50,34 58,40 54,48 C50,53 43,53 38,48 Z" fill="#E11D48" />
                        <path d="M26,34 Q32,24 41,28 Q36,37 26,34 Z" fill="#FBBF24" />
                        <path d="M162,48 C166,40 158,34 154,40 C150,34 142,40 146,48 C150,53 157,53 162,48 Z" fill="#E11D48" />
                        <path d="M174,34 Q168,24 159,28 Q164,37 174,34 Z" fill="#FBBF24" />
                        <path d="M99,6 L101,6 L101,36 L99,36 Z M96,14 Q100,7 100,7 Q100,7 104,14 Q100,21 96,14 Z M92,20 Q98,16 99,12 Q97,24 92,20 Z M108,20 Q102,16 101,12 Q103,24 108,20 Z" fill="#F59E0B" />
                        <path d="M90,36 L100,22 L110,36 L106,40 L94,40 Z" fill="#F59E0B" />
                        <circle cx="100" cy="24" r="2.5" fill="#DC2626" />
                        <ellipse cx="100" cy="49" rx="10" ry="12" fill="currentColor" />
                        <path d="M99,41 Q100,46 101,41 Z" fill="#FFF" />
                        <circle cx="100" cy="45" r="1.5" fill="#DC2626" />
                        <path d="M84,54 Q60,38 42,44 Q38,52 56,54 Q76,56 86,59 Z" fill="currentColor" />
                        <path d="M116,54 Q140,38 158,44 Q162,52 144,54 Q124,56 114,59 Z" fill="currentColor" />
                        <path d="M85,59 Q54,51 32,65 Q34,72 52,67 Q74,63 86,65 Z" fill="currentColor" />
                        <path d="M115,59 Q146,51 168,65 Q166,72 148,67 Q126,63 114,65 Z" fill="currentColor" />
                        <path d="M86,65 Q74,99 64,116 L136,116 Q126,99 114,65 Z" fill={avatar.primaryRobe} />
                        <path d="M64,116 L136,116 L136,119 L64,119 Z" fill="#FBBF24" />
                        <path d="M50,118 Q72,106 100,106 Q128,106 150,118 Q125,128 75,128 Z" fill="#D97706" opacity="0.9" />
                      </>
                    )}

                    {/* RENDER B: LAKSHMI & GANESHA / DIWALI */}
                    {(avatar.visualType === 'lakshmi' || avatar.visualType === 'ganesha' || avatar.visualType === 'diwali_diya') && (
                      <>
                        <circle cx="100" cy="50" r="32" fill="#FEF08A" opacity="0.4" />
                        {/* Golden Mukut & Halo */}
                        <path d="M88,34 L100,18 L112,34 L108,38 L92,38 Z" fill="#F59E0B" />
                        <circle cx="100" cy="20" r="2.5" fill="#DC2626" />
                        {/* Divine Face / Ganesha Trunk or Lakshmi Smile */}
                        <ellipse cx="100" cy="48" rx="11" ry="13" fill="currentColor" />
                        {avatar.visualType === 'ganesha' && (
                          <path d="M99,48 Q98,58 92,62 Q89,64 93,65 Q98,63 103,54 Z" fill="#F59E0B" />
                        )}
                        {/* Showering Gold Coins */}
                        <circle cx="68" cy="74" r="4" fill="#FBBF24" />
                        <circle cx="74" cy="85" r="3.5" fill="#F59E0B" />
                        <circle cx="132" cy="74" r="4" fill="#FBBF24" />
                        <circle cx="126" cy="85" r="3.5" fill="#F59E0B" />
                        {/* Rich Silk Robes */}
                        <path d="M85,62 Q72,96 60,114 L140,114 Q128,96 115,62 Z" fill={avatar.primaryRobe} />
                        {/* Big Pink Lotus Pedestal */}
                        <path d="M44,116 Q100,132 156,116 Q100,124 44,116 Z" fill="#F43F5E" />
                        <path d="M52,118 Q100,136 148,118 Q100,126 52,118 Z" fill="#FB7185" />
                      </>
                    )}

                    {/* RENDER C: RADHA KRISHNA & HOLI / RAKHI / CHRISTMAS / NEW YEAR / LOTUS */}
                    {(avatar.visualType === 'holi' ||
                      avatar.visualType === 'rakhi' ||
                      avatar.visualType === 'christmas' ||
                      avatar.visualType === 'new_year' ||
                      avatar.visualType === 'lotus') && (
                      <>
                        <circle cx="100" cy="50" r="34" fill="#FEF08A" opacity="0.4" />
                        <ellipse cx="100" cy="48" rx="12" ry="14" fill="currentColor" />
                        <path d="M88,62 Q74,96 62,115 L138,115 Q126,96 112,62 Z" fill={avatar.primaryRobe} />
                        {/* Floating Celebration Petals & Ornaments */}
                        <circle cx="60" cy="45" r="5" fill="#EC4899" opacity="0.8" />
                        <circle cx="140" cy="45" r="5" fill="#06B6D4" opacity="0.8" />
                        <circle cx="70" cy="80" r="4" fill="#FACC15" opacity="0.8" />
                        <circle cx="130" cy="80" r="4" fill="#10B981" opacity="0.8" />
                        <path d="M40,118 Q100,132 160,118 Q100,125 40,118 Z" fill="#F59E0B" />
                      </>
                    )}

                    {/* Blooming Sacred Pink Lotus Flowers Base */}
                    <path
                      d="M40,124 Q100,135 160,124 Q100,130 40,124 Z"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      fill="#FEF08A"
                    />
                  </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Dynamic Typography & Changing Mantras */}
        <div className="z-10 mt-1 max-w-md px-2 space-y-1">
          {/* Avatar Name & Day Badge */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-2xs transition-all ${activeAvatar.badgeBg}`}
            >
              {activeAvatar.formNumber}
            </span>
            <span className="font-serif font-black text-sm sm:text-base text-charcoal-950 tracking-tight transition-colors">
              {activeAvatar.title}
            </span>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded-md">
              {activeAvatar.symbol}
            </span>
          </div>

          {/* Changing Sacred Mantra & Blessing */}
          <p className="text-[11px] sm:text-xs font-bold text-[#8C6708] italic leading-tight transition-all duration-300">
            {activeAvatar.mantra}
          </p>

          <p className="text-[10px] text-gray-600 line-clamp-1 max-w-xs mx-auto">
            {activeAvatar.description}
          </p>
        </div>

        {/* 5. Navigation Dots Indicator with Progress Highlight */}
        {currentAvatarList.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-2.5 z-10">
            {currentAvatarList.map((avatar, idx) => (
              <button
                key={avatar.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 bg-[#D97706] shadow-xs'
                    : 'w-1.5 bg-amber-400/50 hover:bg-amber-600'
                }`}
                title={avatar.title}
                aria-label={`Switch to ${avatar.title}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
