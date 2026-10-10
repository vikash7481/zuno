import React from 'react';

export default function Policies() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Trust & Transparency</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-950">Store Policies</h1>
      </div>

      {/* Shipping Policy */}
      <section id="shipping" className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-3">
        <h2 className="font-serif text-xl font-bold text-brand-900">Shipping & Delivery Policy</h2>
        <div className="text-xs sm:text-sm text-charcoal-800 space-y-2 leading-relaxed">
          <p>
            All Zuno orders are packed fresh from our regional fulfillment hubs and dispatched within 24 hours of placement.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li><strong>Express Local Quick-Delivery:</strong> Delivered in 2 business days across serviceable metropolitan PIN codes.</li>
            <li><strong>Standard Courier Delivery:</strong> 3–5 business days across all other serviceable Indian PIN codes.</li>
            <li><strong>Free Delivery:</strong> Automatically applied at checkout on all orders with a net cart value of ₹499 and above.</li>
            <li><strong>Standard Shipping Fee:</strong> ₹49 applied on orders below ₹499.</li>
          </ul>
        </div>
      </section>

      {/* Return & Refund Policy */}
      <section id="returns" className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-3">
        <h2 className="font-serif text-xl font-bold text-brand-900">Cancellation & Refund Policy</h2>
        <div className="text-xs sm:text-sm text-charcoal-800 space-y-2 leading-relaxed">
          <p>
            Because our snacks are fresh, perishable artisanal food products, we adhere to strict quality and food safety standards:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li><strong>Cancellation Eligibility:</strong> Orders can be cancelled from your dashboard at any point before the driver departs for dispatch.</li>
            <li><strong>Damaged or Compromised Goods:</strong> In the rare event of transit damage or broken freshness seals, contact support@zuno.com within 48 hours with a photo for an immediate full replacement or refund.</li>
            <li><strong>Refund Timeline:</strong> Online refunds are initiated instantly and credited to the original source bank/UPI account within 3–5 business days.</li>
          </ul>
        </div>
      </section>

      {/* Privacy Policy */}
      <section id="privacy" className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-3">
        <h2 className="font-serif text-xl font-bold text-brand-900">Privacy & Data Security</h2>
        <div className="text-xs sm:text-sm text-charcoal-800 space-y-2 leading-relaxed">
          <p>
            We take customer privacy and data security seriously. Customer passwords are cryptographic Argon2/Bcrypt salted hashes. Payment credentials (card numbers, UPI PINs, netbanking credentials) are never stored on Zuno servers and are handled exclusively by PCI-DSS certified gateway providers.
          </p>
        </div>
      </section>
    </div>
  );
}
