import React from 'react';
import { Sparkles, Flame, Leaf, Award, HeartHandshake } from 'lucide-react';

export default function BrandStory() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-300">
          The Zuno Heritage
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-950 leading-tight">
          Mindful Indian Snacking, <br />
          <span className="gold-gradient-text">Rooted in Mithila.</span>
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          How we journeyed to the freshwater wetlands of Bihar to rediscover India’s most revered superfood kernel.
        </p>
      </div>

      {/* Origin Story Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="aspect-square rounded-3xl overflow-hidden bg-cream-200 border border-cream-300 shadow-luxury">
          <img
            src="https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80"
            alt="Mithila Lake Fox Nut Harvesting"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-charcoal-800 leading-relaxed">
          <h2 className="font-serif text-2xl font-bold text-brand-950">Hand-Harvested from Lotus Ponds</h2>
          <p>
            Over 85% of the world's finest fox nuts originate from the sacred, nutrient-rich wetlands of the Mithila region in Bihar. Each kernel is diving-harvested by generational indigenous farming families who protect these tranquil aquatic ecosystems.
          </p>
          <p>
            At Zuno, we forge direct fair-trade alliances with farmer-producer cooperatives. By cutting out exploitative middlemen, our harvesters receive premium compensation, while you receive fresh, single-origin Grade-A (6 Suta) jumbo kernels.
          </p>
        </div>
      </div>

      {/* Craft Section */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-cream-300 shadow-card space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">The 4-Step Craft</span>
          <h2 className="font-serif text-3xl font-bold text-brand-950">How We Roast</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 font-bold text-base">
              1
            </div>
            <h3 className="font-bold text-brand-950 text-sm">Grading & Sieving</h3>
            <p className="text-xs text-gray-500">Separating small shells, selecting uniform 6-suta jumbo puffs.</p>
          </div>

          <div className="space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gold-50 flex items-center justify-center text-gold-600 font-bold text-base">
              2
            </div>
            <h3 className="font-bold text-brand-950 text-sm">Slow Drum Roasting</h3>
            <p className="text-xs text-gray-500">Toasting at 165°C in rotary drum roasters until moisture is &lt;2.5%.</p>
          </div>

          <div className="space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 font-bold text-base">
              3
            </div>
            <h3 className="font-bold text-brand-950 text-sm">Olive Oil Infusion</h3>
            <p className="text-xs text-gray-500">Micro-atomized spray of virgin olive oil and hand-ground spices.</p>
          </div>

          <div className="space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gold-50 flex items-center justify-center text-gold-600 font-bold text-base">
              4
            </div>
            <h3 className="font-bold text-brand-950 text-sm">Nitrogen Sealing</h3>
            <p className="text-xs text-gray-500">Packed in triple-layer barrier pouches to preserve acoustic crunch.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
