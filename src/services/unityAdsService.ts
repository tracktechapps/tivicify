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
    title: 'Top Nigerian Streaming Series & Movies',
    advertiser: 'Tivicify Partner Network',
    badge: 'Sponsored',
    durationSeconds: 12,
    skipAfterSeconds: 4,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    clickUrl: 'https://github.com/tracktechapps/tivicify',
    ctaText: 'Explore More'
  }
];

export const unityAdsService = {
  getConfig(): UnityAdConfig {
    const settings = storageService.getSettings();
    return {
      gameId: settings.unityGameId || '5432101',
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
    const idx = Math.floor(Math.random() * SAMPLE_UNITY_ADS.length);
    return SAMPLE_UNITY_ADS[idx];
  },

  onAdCompleted() {
    storageService.recordAdImpression();
  }
};
