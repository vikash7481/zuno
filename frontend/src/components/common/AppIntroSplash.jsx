import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Flame, ShieldCheck, ChevronRight } from 'lucide-react';

export default function AppIntroSplash() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Sourcing Grade-A Mithila Harvest...');

  useEffect(() => {
    // Show on initial session visit
    const hasSeen = sessionStorage.getItem('zuno_intro_seen');
    if (!hasSeen) {
      setVisible(true);

      // Smooth progress animation over 1.6s
      const p1 = setTimeout(() => {
        setProgress(40);
        setStatusText('Slow-roasting in organic cold-pressed oil...');
      }, 400);

      const p2 = setTimeout(() => {
        setProgress(85);
        setStatusText('Checking express doorstep serviceability...');
      }, 950);

      const p3 = setTimeout(() => {
        setProgress(100);
        setStatusText('Welcome to Zuno Artisanal Snacking');
      }, 1400);

      const dismissTimer = setTimeout(() => {
        handleDismiss();
      }, 1800);

      return () => {
        clearTimeout(p1);
        clearTimeout(p2);
        clearTimeout(p3);
        clearTimeout(dismissTimer);
      };
    }
  }, []);

  const handleDismiss = () => {
    setFading(true);
    sessionStorage.setItem('zuno_intro_seen', 'true');
    setTimeout(() => {
      setVisible(false);
    }, 450);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-[#0A1712] via-[#0E231B] to-[#07130E] text-white cursor-pointer select-none transition-all duration-500 ${
        fading ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top Brand Pill */}
      <div className="w-full flex items-center justify-between pt-2 max-w-md">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-amber-300">
          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>Express Doorstep Delivery</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-xs font-semibold text-white/60 hover:text-white px-3 py-1 rounded-full bg-white/5 border border-white/10 transition"
        >
          Skip
        </button>
      </div>

      {/* Center Cinematic Brand Emblem */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-sm my-auto">
        {/* Glowing Emblem */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#1E3F20] to-[#122A16] border-2 border-amber-400/40 shadow-2xl flex items-center justify-center animate-logo-pulse">
            <span className="font-serif text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-400 to-amber-100">
              Z
            </span>
            <Sparkles className="w-5 h-5 text-amber-400 absolute top-2 right-2 animate-bounce" />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Zuno
          </h1>
          <p className="text-xs sm:text-sm font-medium text-amber-200/90 tracking-widest uppercase">
            Artisanal Fox Nuts • Slow-Roasted
          </p>
          <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed pt-1">
            Handpicked Grade-A kernels directly from Mithila lakes, seasoned with whole spices.
          </p>
        </div>

        {/* Badges Row */}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap text-[10px] font-bold text-white/80">
          <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" /> Never Fried
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> 100% Vegan
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Gluten-Free
          </span>
        </div>
      </div>

      {/* Bottom Progress Bar & CTA */}
      <div className="w-full max-w-md space-y-3 pb-4">
        <div className="flex items-center justify-between text-[11px] font-medium text-white/70">
          <span className="truncate pr-2">{statusText}</span>
          <span className="font-mono font-bold text-amber-300">{progress}%</span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[10px] text-center text-white/40 pt-1 flex items-center justify-center gap-1">
          <span>Tap anywhere to start shopping</span>
          <ChevronRight className="w-3 h-3" />
        </p>
      </div>
    </div>
  );
}
