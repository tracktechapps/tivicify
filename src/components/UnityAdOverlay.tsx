import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, SkipForward, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { unityAdsService, UnityAdCreative } from '../services/unityAdsService';

interface UnityAdOverlayProps {
  onAdFinished: () => void;
  onOpenSubscription: () => void;
}

export const UnityAdOverlay: React.FC<UnityAdOverlayProps> = ({
  onAdFinished,
  onOpenSubscription
}) => {
  const [adCreative] = useState<UnityAdCreative>(() => unityAdsService.getRandomCreative());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(adCreative.durationSeconds);
  const [secondsUntilSkip, setSecondsUntilSkip] = useState<number>(adCreative.skipAfterSeconds);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          unityAdsService.onAdCompleted(adCreative);
          onAdFinished();
          return 0;
        }
        return prev - 1;
      });

      setSecondsUntilSkip((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [adCreative, onAdFinished]);

  const handleSkip = () => {
    if (secondsUntilSkip === 0) {
      unityAdsService.onAdCompleted(adCreative);
      onAdFinished();
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col justify-between select-none">
      {/* Video Player Element */}
      <video
        ref={videoRef}
        src={adCreative.videoUrl}
        autoPlay
        playsInline
        muted={isMuted}
        onEnded={() => {
          unityAdsService.onAdCompleted(adCreative);
          onAdFinished();
        }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Top Header Controls Overlay */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>{adCreative.badge}</span>
          </div>

          <span className="text-xs text-gray-300 font-mono">
            Ad ends in {secondsRemaining}s
          </span>

          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Pro Ad-Free Upgrade Banner */}
        <button
          onClick={onOpenSubscription}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Remove Ads with Pro</span>
        </button>
      </div>

      {/* Bottom Ad Action Bar */}
      <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-t from-black/95 via-black/75 to-transparent">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {adCreative.advertiser}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
            {adCreative.title}
          </h3>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-center">
          <a
            href={adCreative.clickUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => unityAdsService.onAdClicked(adCreative)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-gray-100 transition shadow-lg"
          >
            <span>{adCreative.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            disabled={secondsUntilSkip > 0}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
              secondsUntilSkip === 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-600/30'
                : 'bg-black/60 text-gray-400 border border-white/10 cursor-not-allowed'
            }`}
          >
            <span>
              {secondsUntilSkip > 0 ? `Skip in ${secondsUntilSkip}s` : 'Skip Ad'}
            </span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
