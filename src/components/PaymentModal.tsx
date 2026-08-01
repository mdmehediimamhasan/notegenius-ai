'use client'

import { useState } from 'react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  priceMonthly: string
  priceYearly: string
  isYearly: boolean
  bdtPriceMonthly: string
  bdtPriceYearly: string
  onSuccess: () => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  planName,
  priceMonthly,
  priceYearly,
  isYearly,
  bdtPriceMonthly,
  bdtPriceYearly,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bkash' | 'nagad'>('bkash')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  // Card State
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  // Mobile Banking State
  const [mobileNumber, setMobileNumber] = useState('')
  const [trxId, setTrxId] = useState('')

  if (!isOpen) return null

  const displayPriceUSD = isYearly ? priceYearly : priceMonthly
  const displayPriceBDT = isYearly ? bdtPriceYearly : bdtPriceMonthly

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    }, 2000)
  }

  const resetAndClose = () => {
    setSuccess(false)
    setProcessing(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[var(--card)] p-6 sm:p-8 shadow-2xl overflow-hidden text-left">
        
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Payment Successful! 🎉</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Your <span className="font-bold text-violet-400">{planName} Plan</span> is now active. Enjoy unlimited AI power!
            </p>
            <div className="pt-4">
              <button
                onClick={resetAndClose}
                className="btn-primary py-2.5 px-8 text-sm font-bold w-full rounded-2xl"
              >
                <span>Continue to Dashboard</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/20 mb-2">
                ⚡ Upgrade Membership
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Checkout: {planName}</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-white">{displayPriceUSD}</span>
                <span className="text-sm text-slate-400">({displayPriceBDT} BDT) / {isYearly ? 'year' : 'month'}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2.5">
                
                {/* bKash Tab */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-pink-500 bg-pink-500/15 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                      : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-pink-600/30 flex items-center justify-center text-pink-400 font-extrabold text-xs">
                    bKash
                  </div>
                  <span className="text-[11px] font-bold">bKash</span>
                </button>

                {/* Nagad Tab */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'nagad'
                      ? 'border-orange-500 bg-orange-500/15 text-white shadow-[0_0_15px_rgba(249,115,22,0.25)]'
                      : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-600/30 flex items-center justify-center text-orange-400 font-extrabold text-xs">
                    Nagad
                  </div>
                  <span className="text-[11px] font-bold">Nagad</span>
                </button>

                {/* Card Tab */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-violet-500 bg-violet-500/15 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                      : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-violet-600/30 flex items-center justify-center text-violet-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <span className="text-[11px] font-bold">Card</span>
                </button>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayment} className="space-y-4">

              {/* BKASH / NAGAD INSTRUCTIONS & FORM */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                <div className="space-y-3.5">
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                    paymentMethod === 'bkash' 
                      ? 'bg-pink-950/20 border-pink-500/30 text-pink-200' 
                      : 'bg-orange-950/20 border-orange-500/30 text-orange-200'
                  }`}>
                    <p className="font-bold text-sm mb-1 flex items-center gap-1.5">
                      <span>{paymentMethod === 'bkash' ? '📱 bKash Merchant Payment Instructions:' : '📱 Nagad Payment Instructions:'}</span>
                    </p>
                    <p>1. Go to your {paymentMethod === 'bkash' ? 'bKash App or Dial *247#' : 'Nagad App or Dial *167#'}</p>
                    <p>2. Select <span className="font-bold">"Send Money"</span> or <span className="font-bold">"Make Payment"</span></p>
                    <p>3. Merchant Number: <span className="font-mono font-bold text-sm bg-black/40 px-2 py-0.5 rounded text-white">01700000000</span></p>
                    <p>4. Enter Amount: <span className="font-bold text-white">{displayPriceBDT} BDT</span></p>
                    <p>5. Enter Reference: <span className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-white">PRO</span> and enter your PIN.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Mobile Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 01712345678"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="input-field py-2.5 px-3.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction ID (TrxID)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9N7A6X2Y8Z"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      className="input-field py-2.5 px-3.5 text-xs font-mono uppercase tracking-wider"
                    />
                  </div>
                </div>
              )}

              {/* CARD FORM */}
              {paymentMethod === 'card' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="input-field py-2.5 px-3.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="4532 •••• •••• 8892"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="input-field py-2.5 px-3.5 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Expires (MM/YY)</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="08/28"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="input-field py-2.5 px-3.5 text-xs font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">CVC Code</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="input-field py-2.5 px-3.5 text-xs font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                type="submit"
                disabled={processing}
                className="btn-primary w-full py-3 text-sm font-bold rounded-2xl shadow-lg mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <span>Verifying & Processing...</span>
                  </>
                ) : (
                  <span>
                    Pay {paymentMethod === 'card' ? displayPriceUSD : `${displayPriceBDT} BDT`} & Upgrade Now
                  </span>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-500 mt-2">
                🔒 256-bit encrypted secure checkout. Cancel or change plans anytime.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
