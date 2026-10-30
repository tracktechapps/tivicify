import { storageService } from './storageService';
import { UnityAdConfig } from '../types';

export interface UnityAdCreative {
  id: string;
  title: string;
  advertiser: string;
  badge: string;
  durationSeconds: number;
  skipAfterSeconds: number;
  videoUrl: string;
  clickUrl: string;
  ctaText: string;
  numericId?: number;
}

export const SAMPLE_UNITY_ADS: UnityAdCreative[] = [
  {
    id: 'unity_ad_1',
    title: 'EA SPORTS FC Mobile & Ultimate Matchdays',
    advertiser: 'Electronic Arts / Unity Ads Network',
    badge: 'Ad by Unity',
    durationSeconds: 15,
    skipAfterSeconds: 5,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    clickUrl: 'https://unity.com/solutions/unity-ads',
    ctaText: 'Install Free Now'
  },
  {
    id: 'unity_ad_2',
    title: 'Asphalt Legends Unite — High Speed Racing',
    advertiser: 'Gameloft / Unity Ads Network',
    badge: 'Ad by Unity',
    durationSeconds: 15,
    skipAfterSeconds: 5,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    clickUrl: 'https://unity.com/solutions/unity-ads',
    ctaText: 'Play Instantly'
  },
  {
    id: 'unity_ad_3',
    title: 'Tivicify Pro Multi-View — 4 Streams Simultaneously',
    advertiser: 'Tivicify Network',
    badge: 'Sponsored',
    durationSeconds: 12,
    skipAfterSeconds: 4,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    clickUrl: 'https://tivicify.tracktechdigitals.com.ng/#multiview',
    ctaText: 'Explore More'
  }
];

let dynamicAds: UnityAdCreative[] = [...SAMPLE_UNITY_ADS];
let dynamicConfigLoaded = false;

export const unityAdsService = {
  async fetchLiveAds() {
    if (dynamicConfigLoaded) return;
    try {
      const res = await fetch('/api/get-ads.php');
      const data = await res.json();
      if (data.success && Array.isArray(data.custom_ads) && data.custom_ads.length > 0) {
        const liveCreatives: UnityAdCreative[] = data.custom_ads
          .filter((ad: { media_url?: string; format?: string }) => ad.media_url && (ad.format === 'video_interstitial' || ad.format === 'video_rewarded'))
          .map((ad: { id: number; title: string; sponsor_name: string; media_url: string; target_url: string; cta_text?: string }) => ({
            id: `custom_ad_${ad.id}`,
            numericId: ad.id,
            title: ad.title,
            advertiser: ad.sponsor_name,
            badge: 'Sponsored',
            durationSeconds: 15,
            skipAfterSeconds: 5,
            videoUrl: ad.media_url,
            clickUrl: ad.target_url,
            ctaText: ad.cta_text || 'Learn More'
          }));

        if (liveCreatives.length > 0) {
          dynamicAds = [...liveCreatives, ...SAMPLE_UNITY_ADS];
        }
      }
      dynamicConfigLoaded = true;
    } catch {
      // Offline fallback
    }
  },

  getConfig(): UnityAdConfig {
    const settings = storageService.getSettings();
    return {
      gameId: settings.unityGameId || '5738491',
      adUnitId: 'Interstitial_Android',
      testMode: settings.unityTestMode !== false,
      enabled: settings.unityAdsEnabled !== false,
      minIntervalMinutes: 4 // Show at most once every 4 minutes for free users
    };
  },

  /**
   * Check if Unity ad should be served based on Pro status and frequency cooldown
   */
  shouldServeAd(): boolean {
    const config = this.getConfig();
    if (!config.enabled) return false;
    // Pro and VIP users NEVER see Unity ads!
    if (storageService.isPro()) return false;
    return storageService.canShowAd(config.minIntervalMinutes);
  },

  getRandomCreative(): UnityAdCreative {
    if (!dynamicConfigLoaded) {
      this.fetchLiveAds().catch(() => {});
    }
    const idx = Math.floor(Math.random() * dynamicAds.length);
    return dynamicAds[idx] || SAMPLE_UNITY_ADS[0];
  },

  onAdCompleted(creative?: UnityAdCreative) {
    storageService.recordAdImpression();
    if (creative?.numericId) {
      fetch('/api/track-ad.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_id: creative.numericId, type: 'impression' })
      }).catch(() => {});
    }
  },

  onAdClicked(creative?: UnityAdCreative) {
    if (creative?.numericId) {
      fetch('/api/track-ad.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_id: creative.numericId, type: 'click' })
      }).catch(() => {});
    }
  }
};

// Initial background load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    unityAdsService.fetchLiveAds().catch(() => {});
  }, 1000);
}
