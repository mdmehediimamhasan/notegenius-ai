'use client'

import { useState } from 'react'
import PaymentModal from '@/components/PaymentModal'

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState({
    name: 'Pro',
    priceMonthly: '$9.99',
    priceYearly: '$95.88',
    bdtPriceMonthly: '990',
    bdtPriceYearly: '9,500',
  })
  const [isProActive, setIsProActive] = useState(false)

  const handleSelectPlan = (name: string, priceMonthly: string, priceYearly: string, bdtPriceMonthly: string, bdtPriceYearly: string) => {
    setSelectedPlan({ name, priceMonthly, priceYearly, bdtPriceMonthly, bdtPriceYearly })
    setIsModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    setIsProActive(true)
    setIsModalOpen(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16 animate-fade-in">
      {/* Header section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/20 shadow-sm">
          ⚡ Flexible Subscriptions
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Unlock Unlimited <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">AI Power</span>
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Choose the plan that fits your study or work routine. Pay easily with Credit Card, bKash, or Nagad.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className={`text-xs font-bold ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly Billing</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 p-1 relative transition-colors cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded-full bg-violet-500 shadow-md transform transition-transform ${
                isYearly ? 'translate-x-7 bg-cyan-400' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-bold flex items-center gap-1.5 ${isYearly ? 'text-white' : 'text-slate-500'}`}>
            Yearly Billing
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* FREE PLAN */}
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 flex flex-col justify-between transition-all hover:border-white/20 shadow-sm relative">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
            <p className="text-xs text-slate-400 mb-6">Perfect for trying out NoteGenius AI features.</p>
            
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-xs text-slate-500">/ forever</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-300 border-t border-white/[0.06] pt-6 mb-8">
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Up to 3 Notes per month</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>5-minute audio recording limit</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Basic AI Note Generation</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500 line-through">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span>AI Quizzes & Flashcards</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500 line-through">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span>Priority AI Processing</span>
              </li>
            </ul>
          </div>

          <button
            disabled
            className="btn-secondary w-full py-3 text-xs opacity-50 cursor-not-allowed rounded-2xl"
          >
            <span>Current Default Plan</span>
          </button>
        </div>

        {/* PRO PLAN - MOST POPULAR */}
        <div className="rounded-3xl border-2 border-violet-500/50 bg-gradient-to-b from-violet-500/10 via-violet-500/5 to-transparent p-8 flex flex-col justify-between transition-all hover:border-violet-400 shadow-[0_12px_40px_rgba(139,92,246,0.25)] relative overflow-hidden transform md:-translate-y-2">
          
          <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-l from-violet-500 to-indigo-600 text-[10px] font-extrabold uppercase tracking-wider text-white rounded-bl-2xl shadow-md">
            Most Popular
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span>Pro Plan</span>
              {isProActive && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ACTIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-300 mb-6">Unlimited AI transcription, notes, and quiz generation.</p>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-white">
                {isYearly ? '$7.99' : '$9.99'}
              </span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <p className="text-[11px] font-medium text-violet-300 mb-6">
              ৳{isYearly ? '790' : '990'} BDT / month {isYearly && '(Billed annually ৳9,500)'}
            </p>

            <ul className="space-y-3 text-xs text-slate-200 border-t border-violet-500/20 pt-6 mb-8">
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="font-bold text-white">Unlimited Notes & Uploads</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="font-bold text-white">Unlimited Audio/Video Recording</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>AI Quizzes & Interactive Flashcards</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>AI Chat Assistant for every Note</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>High-Speed Priority Transcription</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Export to PDF & Markdown</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan('Pro', '$9.99', '$95.88', '990', '9,500')}
            className="btn-primary w-full py-3 text-xs font-bold rounded-2xl shadow-lg"
          >
            <span>{isProActive ? 'Active Plan — Manage' : 'Upgrade to Pro'}</span>
          </button>
        </div>

        {/* ENTERPRISE / TEAM PLAN */}
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 flex flex-col justify-between transition-all hover:border-white/20 shadow-sm relative">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Team & API</h3>
            <p className="text-xs text-slate-400 mb-6">For universities, research groups, and teams.</p>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-white">
                {isYearly ? '$24.99' : '$29.99'}
              </span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 mb-6">
              ৳{isYearly ? '2,490' : '2,990'} BDT / month
            </p>

            <ul className="space-y-3 text-xs text-slate-300 border-t border-white/[0.06] pt-6 mb-8">
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Everything in Pro Plan</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Up to 10 Team Members</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Shared Knowledge Base & Team Notes</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Custom Prompting & API Access</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>24/7 Priority Support</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan('Team', '$29.99', '$299.88', '2,990', '29,500')}
            className="btn-secondary w-full py-3 text-xs font-bold rounded-2xl"
          >
            <span>Get Team Access</span>
          </button>
        </div>
      </div>

      {/* Payment Badges Footer */}
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 text-center space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Supported Payment Methods</p>
        <div className="flex flex-wrap items-center justify-center gap-6 pt-1 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2 bg-white/[0.04] px-4 py-2 rounded-xl border border-white/[0.06]">
            💳 Visa / Mastercard / AMEX
          </div>
          <div className="flex items-center gap-2 bg-pink-500/10 text-pink-300 px-4 py-2 rounded-xl border border-pink-500/20 font-bold">
            📱 bKash Merchant Payment
          </div>
          <div className="flex items-center gap-2 bg-orange-500/10 text-orange-300 px-4 py-2 rounded-xl border border-orange-500/20 font-bold">
            📱 Nagad Digital Payment
          </div>
        </div>
      </div>

      {/* Payment Checkout Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName={selectedPlan.name}
        priceMonthly={selectedPlan.priceMonthly}
        priceYearly={selectedPlan.priceYearly}
        bdtPriceMonthly={selectedPlan.bdtPriceMonthly}
        bdtPriceYearly={selectedPlan.bdtPriceYearly}
        isYearly={isYearly}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
