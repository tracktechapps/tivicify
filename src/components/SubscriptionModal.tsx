import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Tv, 
  Key, 
  AlertCircle, 
  ArrowRight,
  Radio,
  ExternalLink,
  Layers,
  Crown
} from 'lucide-react';
import { UserSubscription, SubscriptionTier, SponsoredChannelInquiry } from '../types';
import { storageService } from '../services/storageService';
import { bachsBillingService, BACHS_PLANS, BachsPlan } from '../services/bachsBillingService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionUpdated?: (sub: UserSubscription) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'voucher' | 'sponsor'>('plans');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('tivicify_pro_monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');

  // Sponsor inquiry state
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorUrl, setSponsorUrl] = useState('');
  const [sponsorCategory, setSponsorCategory] = useState('News & Talk');
  const [sponsorEmail, setSponsorEmail] = useState('');
  const [sponsorPhone, setSponsorPhone] = useState('');
  const [sponsorTier, setSponsorTier] = useState<'starter' | 'growth' | 'prime'>('starter');

  const currentSub = storageService.getSubscription();

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await bachsBillingService.createCheckoutSession({
      planId: selectedPlanId,
      currency,
      customerEmail: 'viewer@tivicify.com'
    });

    setIsProcessing(false);

    if (result.success && result.checkoutUrl) {
      // Open Bachs.io checkout in a new tab or window
      window.open(result.checkoutUrl, '_blank', 'noopener,noreferrer');

      // Also activate immediately for test/sandbox demo or prompt user
      const updated = bachsBillingService.activateSubscription(selectedPlanId, result.sessionId);
      setSuccessMessage(`Bachs.io checkout launched! Your ${updated.planName} is now active.`);
      if (onSubscriptionUpdated) onSubscriptionUpdated(updated);
    } else {
      setErrorMessage(result.error || 'Failed to initiate Bachs.io checkout session.');
    }
  };

  const handleRedeemVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await storageService.verifyActivationCodeAsync(voucherCode);
    if (result.success) {
      setSuccessMessage(result.message);
      setVoucherCode('');
      const updated = storageService.getSubscription();
      if (onSubscriptionUpdated) onSubscriptionUpdated(updated);
    } else {
      setErrorMessage(result.message);
    }
    setIsProcessing(false);
  };

  const handleSubmitSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName || !sponsorUrl || !sponsorEmail) {
      setErrorMessage('Please fill in channel name, stream URL, and contact email.');
      return;
    }

    const inquiry: SponsoredChannelInquiry = {
      channelName: sponsorName,
      streamUrl: sponsorUrl,
      category: sponsorCategory,
      contactEmail: sponsorEmail,
      contactPhone: sponsorPhone,
      tier: sponsorTier,
      submittedAt: Date.now()
    };

    storageService.saveSponsoredInquiry(inquiry);
    setSuccessMessage(`Broadcaster slot inquiry for "${sponsorName}" received! Our syndication team will contact you within 24 hours.`);
    setSponsorName('');
    setSponsorUrl('');
    setSponsorEmail('');
    setSponsorPhone('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Crown className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white">Tivicify Pro & VIP Pass</h2>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-[10px] font-bold text-cyan-300">
                  Powered by bachs.io
                </span>
              </div>
              <p className="text-xs text-gray-400">Unlock 4-Screen Multi-View, 100% Ad-Free & 4K UHD Streams</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => { setActiveTab('plans'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'plans'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Bachs.io Plans & Pricing
          </button>

          <button
            onClick={() => { setActiveTab('voucher'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'voucher'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Redeem Voucher Code</span>
          </button>

          <button
            onClick={() => { setActiveTab('sponsor'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'sponsor'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Broadcaster / Sponsor Slot</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active Subscription Alert */}
          {currentSub.isActive && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-2">
                    <span>Active Membership: {currentSub.planName || 'Pro'}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">Active</span>
                  </div>
                  <div className="text-[11px] text-gray-300">
                    {currentSub.expiresAt ? `Valid until ${new Date(currentSub.expiresAt).toLocaleDateString()}` : 'Lifetime Access'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-400">100% Ad-Free Unlocked</span>
            </div>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: BACHS.IO PLANS */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              {/* Currency Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">Select Currency:</span>
                <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                  <button
                    onClick={() => setCurrency('NGN')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      currency === 'NGN' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🇳🇬 NGN (₦)
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      currency === 'USD' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🌐 USD ($)
                  </button>
                </div>
              </div>

              {/* Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BACHS_PLANS.slice(0, 2).map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const price = currency === 'NGN' ? `₦${plan.priceNgn.toLocaleString()}` : `$${plan.priceUsd}`;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative rounded-xl p-4 cursor-pointer transition-all border-2 ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {plan.recommended && (
                        <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                          Recommended
                        </span>
                      )}

                      <div className="flex items-baseline justify-between">
                        <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                        <div className="text-right">
                          <span className="text-lg font-black text-cyan-300">{price}</span>
                          <span className="text-[10px] text-gray-400">/{plan.period}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-400 mt-1">{plan.description}</p>

                      <ul className="mt-3.5 space-y-1.5 text-[11px] text-gray-300">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center space-x-1.5">
                            <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Bachs Payment Rails Badges */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                <span className="font-semibold text-gray-300">Supported on Bachs.io:</span>
                <span className="text-gray-300">Nigerian Debit Cards (Mastercard, Visa, Verve)</span>
                <span>•</span>
                <span className="text-gray-300">Direct Bank Transfer</span>
                <span>•</span>
                <span className="text-gray-300">Mobile Money (MTN MoMo, M-Pesa)</span>
                <span>•</span>
                <span className="text-gray-300">USDT / USDC Crypto</span>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Connecting to Bachs.io Checkout...</span>
                ) : (
                  <>
                    <span>Proceed to Bachs.io Secure Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: VOUCHER / ACTIVATION CODE */}
          {activeTab === 'voucher' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Enter Activation Voucher or License Token</span>
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Received an activation voucher via WhatsApp, email, or with your Android TV Stick purchase? Enter it below to unlock Pro access instantly.
                </p>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="e.g. TIVI-PRO-2026 or TIVI-VIP-2026"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleRedeemVoucher}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                  >
                    Redeem Code
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-gray-500">
                  <span>Demo codes:</span>
                  <button onClick={() => setVoucherCode('TIVI-PRO-2026')} className="text-cyan-400 underline">TIVI-PRO-2026</button>
                  <button onClick={() => setVoucherCode('TIVI-VIP-2026')} className="text-cyan-400 underline">TIVI-VIP-2026</button>
                  <button onClick={() => setVoucherCode('TIVICIFY-LIFETIME')} className="text-cyan-400 underline">TIVICIFY-LIFETIME</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BROADCASTER / SPONSOR SLOT */}
          {activeTab === 'sponsor' && (
            <form onSubmit={handleSubmitSponsor} className="space-y-3.5">
              <p className="text-xs text-gray-400">
                Broadcast your live TV channel, ministry broadcast, podcast, or sports feed 24/7 across thousands of connected Android TVs, tablets, and phones.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Channel Name</label>
                <input
                  type="text"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  placeholder="e.g. Gospel Faith TV / AfroBeat Pulse"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Live HLS Stream URL (.m3u8)</label>
                <input
                  type="url"
                  value={sponsorUrl}
                  onChange={(e) => setSponsorUrl(e.target.value)}
                  placeholder="https://example.com/live/playlist.m3u8"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={sponsorEmail}
                    onChange={(e) => setSponsorEmail(e.target.value)}
                    placeholder="broadcaster@station.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">WhatsApp / Phone</label>
                  <input
                    type="tel"
                    value={sponsorPhone}
                    onChange={(e) => setSponsorPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-lg transition"
              >
                Submit Broadcaster Application
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
