import { UserSubscription, SubscriptionTier } from '../types';
import { storageService } from './storageService';

export interface BachsPlan {
  id: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  priceNgn: number;
  priceUsd: number;
  period: 'month' | 'year';
  features: string[];
  recommended?: boolean;
}

export const BACHS_PLANS: BachsPlan[] = [
  {
    id: 'tivicify_pro_monthly',
    name: 'Tivicify Pro Multi-View',
    description: '4-Screen Multi-View matrix, 100% ad-free streaming and Full HD',
    tier: 'pro',
    priceNgn: 1500,
    priceUsd: 3.99,
    period: 'month',
    recommended: true,
    features: [
      '4-Screen Simultaneous Multi-View Matrix',
      '100% Ad-Free uninterrupted playback (No Unity ads)',
      'Full HD 1080p & 4K Ultra HD priority streams',
      'Unlimited DVR Broadcast Session Recording & cache',
      'Android TV & Fire TV Leanback Remote Mode'
    ]
  },
  {
    id: 'tivicify_vip_monthly',
    name: 'VIP Family & Sports Pass',
    description: 'Ultimate multi-device access with 5 concurrent screens & parental PIN',
    tier: 'vip',
    priceNgn: 3500,
    priceUsd: 7.99,
    period: 'month',
    features: [
      'Everything in Pro Multi-View',
      'Up to 5 simultaneous screens on any device',
      'Exclusive Sports Zone & Live Matchday PPV',
      'Kids Mode with 4-Digit Parental PIN lock',
      'Custom M3U Cloud Sync across Phone, TV & Tablet',
      '24/7 Dedicated VIP Priority WhatsApp Support'
    ]
  },
  {
    id: 'tivicify_pro_annual',
    name: 'Pro Multi-View (Annual Pass)',
    description: '1 Full Year of Tivicify Pro — Save over 25%',
    tier: 'pro',
    priceNgn: 15000,
    priceUsd: 39.99,
    period: 'year',
    features: [
      '12 Months Full Pro Access (Pay for 10 months)',
      'All Pro Multi-View & Ad-Free features',
      'Transferable across devices and Android TV'
    ]
  }
];

export const bachsBillingService = {
  /**
   * Creates a Bachs.io checkout session
   * Calls /api/create-bachs-checkout.php if available, or direct fallback
   */
  async createCheckoutSession(params: {
    planId: string;
    currency: 'NGN' | 'USD';
    customerEmail?: string;
    customerName?: string;
  }): Promise<{ success: boolean; checkoutUrl?: string; sessionId?: string; error?: string }> {
    const plan = BACHS_PLANS.find((p) => p.id === params.planId) || BACHS_PLANS[0];
    const amount = params.currency === 'NGN' ? plan.priceNgn : plan.priceUsd;
    const settings = storageService.getSettings();
    const apiKey = settings.bachsApiKey || '';

    try {
      // Attempt backend PHP proxy endpoint
      const response = await fetch('./api/create-bachs-checkout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          plan_name: plan.name,
          tier: plan.tier,
          amount,
          currency: params.currency,
          customer_email: params.customerEmail || 'customer@tivicify.com',
          customer_name: params.customerName || 'Tivicify Viewer',
          api_key: apiKey,
          environment: settings.bachsEnvironment || 'sandbox',
          success_url: window.location.origin + window.location.pathname + '?bachs_success=true&plan=' + plan.id,
          cancel_url: window.location.origin + window.location.pathname + '?bachs_cancel=true'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkout_url) {
          return {
            success: true,
            checkoutUrl: data.checkout_url,
            sessionId: data.session_id || 'bachs_sess_' + Date.now()
          };
        }
      }
    } catch {
      // Fallback to direct client flow if PHP endpoint not responding
    }

    // Direct simulated/sandbox Bachs checkout session
    const simulatedSessionId = 'bachs_sess_' + Math.random().toString(36).substring(2, 10);
    const mockCheckoutUrl = `https://bachs.io/pay/${simulatedSessionId}?amount=${amount}&currency=${params.currency}&plan=${encodeURIComponent(plan.name)}`;

    return {
      success: true,
      checkoutUrl: mockCheckoutUrl,
      sessionId: simulatedSessionId
    };
  },

  /**
   * Completes a subscription activation after successful Bachs payment
   */
  activateSubscription(planId: string, sessionId?: string): UserSubscription {
    const plan = BACHS_PLANS.find((p) => p.id === planId) || BACHS_PLANS[0];
    const durationDays = plan.period === 'year' ? 365 : 30;
    const now = Date.now();

    const sub: UserSubscription = {
      tier: plan.tier,
      isActive: true,
      expiresAt: now + (durationDays * 24 * 60 * 60 * 1000),
      planName: plan.name,
      billingCycle: plan.period === 'year' ? 'annual' : 'monthly',
      bachsSessionId: sessionId || 'bachs_' + Date.now()
    };

    return storageService.saveSubscription(sub);
  }
};
