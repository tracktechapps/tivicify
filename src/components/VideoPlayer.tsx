import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Tv,
  Radio,
  PictureInPicture2,
  Loader2,
  AlertCircle,
  Captions,
  Sliders,
  Check,
  Minimize2,
  Moon,
  List,
  Activity,
  Zap,
  Ear
} from 'lucide-react';
import { MediaItem, ChannelItem, StreamStats } from '../types';
import { storageService } from '../services/storageService';
import { audioEnhancer } from '../services/audioEnhancer';
import { SleepTimerModal } from './SleepTimerModal';
import { ChannelSurferDrawer } from './ChannelSurferDrawer';

interface VideoPlayerProps {
  media: MediaItem;
  onClose: () => void;
  onPlayNext?: () => void;
  onMinimize?: () => void;
  liveChannels?: ChannelItem[];
  onSwitchChannel?: (item: MediaItem) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  media,
  onClose,
  onPlayNext,
  onMinimize,
  liveChannels = [],
  onSwitchChannel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover' | 'fill'>('contain');

  // Menus & Modals
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [showChannelSurfer, setShowChannelSurfer] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Audio Enhancements
  const [audioBoost, setAudioBoost] = useState<number>(1); // 1 = 100%, 1.5 = 150%, 2 = 200%
  const [nightModeAudio, setNightModeAudio] = useState<boolean>(false);

  // Sleep Timer countdown
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Subtitles & Quality
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [availableQualities, setAvailableQualities] = useState<{ id: number; label: string }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 is auto

  // Stream Stats
  const [streamStats, setStreamStats] = useState<StreamStats>({
    resolution: '1920x1080',
    bitrateKbps: 0,
    bufferedSeconds: 0,
    droppedFrames: 0,
    latencyMs: 12,
    hlsVersion: Hls.version,
  });

  const controlsTimeoutRef = useRef<number | null>(null);
  const isLive = media.type === 'live' || media.streamUrl.includes('live') || duration === Infinity;

  // Auto hide controls after 3.5 seconds
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !showChannelSurfer && !showSleepTimer) {
        setShowControls(false);
        setShowSettingsMenu(false);
        setShowSubtitleMenu(false);
      }
    }, 3500);
  }, [isPlaying, showChannelSurfer, showSleepTimer]);

  // Sleep Timer countdown interval
  useEffect(() => {
    if (!sleepTimerMinutes) {
      setSleepTimerRemaining(null);
      return;
    }

    setSleepTimerRemaining(sleepTimerMinutes * 60);

    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  // Handle HLS and Native video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError(null);
    setAvailableQualities([]);
    setCurrentQuality(-1);

    // Attach Web Audio enhancer
    try {
      audioEnhancer.attachToVideo(video);
      audioEnhancer.setGain(audioBoost);
      audioEnhancer.setNightMode(nightModeAudio);
    } catch {
      // Ignore if browser restricts auto audio context
    }

    const isHlsStream = media.streamUrl.endsWith('.m3u8') || media.streamType === 'hls';

    if (isHlsStream && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(media.streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsLoading(false);

        if (data.levels && data.levels.length > 1) {
          const qualities = [
            { id: -1, label: 'Auto' },
            ...data.levels.map((lvl, index) => ({
              id: index,
              label: `${lvl.height ? lvl.height + 'p' : Math.round(lvl.bitrate / 1000) + 'k'}`,
            })),
          ];
          setAvailableQualities(qualities);
        }

        if (!isLive) {
          const savedTime = storageService.getProgress(media.id);
          if (savedTime > 5) {
            video.currentTime = savedTime;
          }
        }
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const lvl = hls.levels[data.level];
        if (lvl) {
          setStreamStats((prev) => ({
            ...prev,
            resolution: `${lvl.width || 1920}x${lvl.height || 1080}`,
            bitrateKbps: Math.round(lvl.bitrate / 1000),
          }));
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError('Failed to load stream. The live broadcast or video file might be temporarily unreachable.');
              setIsLoading(false);
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else {
      video.src = media.streamUrl;
      video.load();

      const onLoadedMetadata = () => {
        setIsLoading(false);
        if (!isLive) {
          const savedTime = storageService.getProgress(media.id);
          if (savedTime > 5) {
            video.currentTime = savedTime;
          }
        }
        setStreamStats((prev) => ({
          ...prev,
          resolution: `${video.videoWidth || 1920}x${video.videoHeight || 1080}`,
        }));
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      };

      const onError = () => {
        setIsLoading(false);
        setError('Unable to load video stream. Please check network connectivity or stream URL.');
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('error', onError);

      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('error', onError);
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [media, isLive, audioBoost, nightModeAudio]);

  // Update buffer stats periodically
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const interval = setInterval(() => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedSeconds = Math.max(0, Math.round(bufferedEnd - video.currentTime));
        setStreamStats((prev) => ({
          ...prev,
          bufferedSeconds,
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Subtitle track selection handler
  const handleSelectSubtitle = (lang: string) => {
    setSelectedSubtitle(lang);
    setShowSubtitleMenu(false);
    resetControlsTimeout();

    const video = videoRef.current;
    if (!video || !video.textTracks) return;

    for (let i = 0; i < video.textTracks.length; i++) {
      const track = video.textTracks[i];
      if (lang === 'off') {
        track.mode = 'disabled';
      } else if (track.language === lang) {
        track.mode = 'showing';
      } else {
        track.mode = 'disabled';
      }
    }
  };

  // Quality switch handler
  const handleQualityChange = (levelId: number) => {
    setCurrentQuality(levelId);
    setShowSettingsMenu(false);
    resetControlsTimeout();

    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
    }
  };

  // Audio boost handler
  const handleAudioBoostChange = (multiplier: number) => {
    setAudioBoost(multiplier);
    audioEnhancer.setGain(multiplier);
    resetControlsTimeout();
  };

  // Night mode toggle
  const toggleNightModeAudio = () => {
    const next = !nightModeAudio;
    setNightModeAudio(next);
    audioEnhancer.setNightMode(next);
    resetControlsTimeout();
  };

  // Progress saver
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isLive) return;

    const interval = setInterval(() => {
      if (video.currentTime > 0 && video.duration > 0) {
        storageService.saveProgress(media, video.currentTime, video.duration);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [media, isLive]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    if (onPlayNext) {
      onPlayNext();
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      resetControlsTimeout();
    }
  };

  const seek = (seconds: number) => {
    if (!videoRef.current || isLive) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
    resetControlsTimeout();
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current || isLive) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    resetControlsTimeout();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    resetControlsTimeout();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
    resetControlsTimeout();
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.error('Picture-in-picture error:', e);
    }
  };

  const handlePlaybackRate = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettingsMenu(false);
    resetControlsTimeout();
  };

  // Keyboard and TV remote controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout();

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const nextVol = Math.min(1, volume + 0.1);
            videoRef.current.volume = nextVol;
            setVolume(nextVol);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const nextVol = Math.max(0, volume - 0.1);
            videoRef.current.volume = nextVol;
            setVolume(nextVol);
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'c':
        case 'C':
          if (isLive) {
            setShowChannelSurfer((prev) => !prev);
          }
          break;
        case 'Escape':
        case 'BrowserBack':
        case 'GoBack':
          e.preventDefault();
          if (showChannelSurfer) {
            setShowChannelSurfer(false);
          } else {
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, onClose, resetControlsTimeout, isLive, showChannelSurfer]);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === Infinity) return '00:00';
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = Math.floor(timeInSeconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none cursor-default"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        playsInline
        className={`w-full h-full ${
          aspectRatio === 'contain'
            ? 'object-contain'
            : aspectRatio === 'cover'
            ? 'object-cover'
            : 'object-fill'
        }`}
        onClick={togglePlay}
      >
        {media.subtitles?.map((sub) => (
          <track
            key={sub.lang}
            kind="subtitles"
            srcLang={sub.lang}
            label={sub.label}
            src={sub.src}
            default={sub.isDefault}
          />
        ))}
      </video>

      {/* Loading Spinner */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/40 backdrop-blur-xs">
          <Loader2 className="w-14 h-14 text-blue-500 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-200">Buffering stream...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/90 text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Stream Playback Notice</h2>
          <p className="text-sm text-gray-300 max-w-md mb-6">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                  videoRef.current.play().catch(() => {});
                }
              }}
              className="tv-focusable px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm"
            >
              Retry Stream
            </button>
            <button
              onClick={onClose}
              className="tv-focusable px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold text-sm"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}

      {/* Quick Channel Surfer Drawer */}
      {isLive && (
        <ChannelSurferDrawer
          isOpen={showChannelSurfer}
          onClose={() => setShowChannelSurfer(false)}
          channels={liveChannels}
          activeChannelUrl={media.streamUrl}
          onSwitchChannel={(item) => {
            setShowChannelSurfer(false);
            if (onSwitchChannel) onSwitchChannel(item);
          }}
        />
      )}

      {/* Stats for Nerds Overlay */}
      {showStats && (
        <div className="absolute top-20 left-6 z-40 p-4 rounded-2xl glass-panel border border-slate-700/80 text-xs font-mono text-gray-200 shadow-2xl space-y-1.5 pointer-events-auto">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-700">
            <span className="font-bold text-sky-400">Stream Diagnostics</span>
            <button onClick={() => setShowStats(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <div>Resolution: <span className="text-emerald-400">{streamStats.resolution}</span></div>
          <div>Buffer Length: <span className="text-amber-400">{streamStats.bufferedSeconds}s</span></div>
          <div>Bitrate: <span className="text-sky-300">{streamStats.bitrateKbps ? `${streamStats.bitrateKbps} kbps` : 'Adaptive'}</span></div>
          <div>Audio Boost: <span className="text-indigo-400">{audioBoost * 100}%</span></div>
          <div>Night Mode EQ: <span className={nightModeAudio ? 'text-emerald-400' : 'text-gray-400'}>{nightModeAudio ? 'Enabled' : 'Disabled'}</span></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="pointer-events-auto p-4 md:p-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="tv-focusable p-2.5 rounded-full bg-black/40 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-105"
              title="Close Player (Esc)"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base md:text-xl font-bold text-white line-clamp-1">
                  {media.title}
                </h1>
                {isLive && (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-black uppercase bg-red-600 text-white animate-pulse">
                    <Radio className="w-3 h-3" />
                    <span>LIVE</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {media.genres.join(' • ')} {media.year ? `(${media.year})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Live TV Channels Drawer Button */}
            {isLive && liveChannels.length > 0 && (
              <button
                onClick={() => setShowChannelSurfer(!showChannelSurfer)}
                className={`tv-focusable flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-colors ${
                  showChannelSurfer ? 'bg-red-600 text-white' : 'bg-black/40 hover:bg-white/20 text-white'
                }`}
                title="Quick Channel Surfer (C)"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Channels</span>
              </button>
            )}

            {/* Sleep Timer Button */}
            <button
              onClick={() => setShowSleepTimer(true)}
              className={`tv-focusable p-2 rounded-lg backdrop-blur-md transition-colors ${
                sleepTimerMinutes ? 'bg-indigo-600 text-white' : 'bg-black/40 hover:bg-white/20 text-white'
              }`}
              title="Bedtime Sleep Timer"
            >
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Minimize to Mini-Player */}
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="tv-focusable p-2 rounded-lg bg-black/40 hover:bg-white/20 text-white backdrop-blur-md"
                title="Minimize to Floating Player"
              >
                <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Aspect Ratio */}
            <button
              onClick={() => setAspectRatio((prev) => (prev === 'contain' ? 'cover' : prev === 'cover' ? 'fill' : 'contain'))}
              className="tv-focusable hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md"
              title="Aspect Ratio"
            >
              <Tv className="w-4 h-4" />
              <span className="capitalize">{aspectRatio}</span>
            </button>

            {/* Picture-in-Picture */}
            {document.pictureInPictureEnabled && (
              <button
                onClick={togglePiP}
                className="tv-focusable p-2 rounded-lg bg-black/40 hover:bg-white/20 text-white backdrop-blur-md"
                title="Picture-in-Picture"
              >
                <PictureInPicture2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Center Watermark */}
        <div className="pointer-events-none flex items-center justify-center opacity-10">
          <Tv className="w-20 h-20 text-white" />
        </div>

        {/* Bottom Bar Controls */}
        <div className="pointer-events-auto p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col space-y-3">
          
          {/* Time Scrub Bar */}
          {!isLive && (
            <div className="flex items-center space-x-3 w-full">
              <span className="text-xs text-gray-300 font-mono min-w-[45px]">
                {formatTime(currentTime)}
              </span>
              <div className="relative flex-1 group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleScrub}
                  className="w-full h-1.5 bg-gray-600/60 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
                />
              </div>
              <span className="text-xs text-gray-400 font-mono min-w-[45px]">
                {formatTime(duration)}
              </span>
            </div>
          )}

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between">
            {/* Play, Replay, Forward, Volume */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              <button
                onClick={togglePlay}
                className="tv-focusable p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-transform hover:scale-110 active:scale-95 shadow-md shadow-blue-600/40"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>

              {!isLive && (
                <>
                  <button
                    onClick={() => seek(-10)}
                    className="tv-focusable p-2 rounded-lg text-gray-300 hover:text-white transition-colors"
                    title="Rewind 10s (←)"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => seek(10)}
                    className="tv-focusable p-2 rounded-lg text-gray-300 hover:text-white transition-colors"
                    title="Forward 10s (→)"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Volume Slider & Night Mode Indicator */}
              <div className="flex items-center space-x-2 group">
                <button
                  onClick={toggleMute}
                  className="tv-focusable p-2 text-gray-300 hover:text-white"
                  title="Mute / Unmute (M)"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-24 h-1 bg-gray-600/60 rounded appearance-none accent-blue-500 cursor-pointer hidden sm:block"
                />
              </div>

              {/* Audio Boost Pill */}
              {audioBoost > 1 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                  +{Math.round((audioBoost - 1) * 100)}% Boost
                </span>
              )}
            </div>

            {/* Right Controls: Subtitles, Settings, Fullscreen */}
            <div className="relative flex items-center space-x-2 sm:space-x-3">
              
              {/* Subtitles Button */}
              {media.subtitles && media.subtitles.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSubtitleMenu(!showSubtitleMenu);
                      setShowSettingsMenu(false);
                    }}
                    className={`tv-focusable p-2 rounded-lg transition-colors ${
                      selectedSubtitle !== 'off'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                    }`}
                    title="Subtitles & Closed Captions"
                  >
                    <Captions className="w-4 h-4" />
                  </button>

                  {/* Subtitle Menu Popup */}
                  {showSubtitleMenu && (
                    <div className="absolute bottom-12 right-0 glass-panel rounded-xl p-2 w-44 shadow-2xl flex flex-col space-y-1 z-30">
                      <span className="text-[11px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                        Subtitles
                      </span>
                      <button
                        onClick={() => handleSelectSubtitle('off')}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                          selectedSubtitle === 'off'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        <span>Off</span>
                        {selectedSubtitle === 'off' && <Check className="w-3.5 h-3.5" />}
                      </button>
                      {media.subtitles.map((sub) => (
                        <button
                          key={sub.lang}
                          onClick={() => handleSelectSubtitle(sub.lang)}
                          className={`text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                            selectedSubtitle === sub.lang
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <span>{sub.label}</span>
                          {selectedSubtitle === sub.lang && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings / Speed / Audio Boost Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettingsMenu(!showSettingsMenu);
                    setShowSubtitleMenu(false);
                  }}
                  className="tv-focusable flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200"
                  title="Audio Boost, Speed & Quality"
                >
                  <Sliders className="w-3.5 h-3.5 mr-0.5" />
                  <span>{playbackRate}x</span>
                </button>

                {/* Settings Menu Popup */}
                {showSettingsMenu && (
                  <div className="absolute bottom-12 right-0 glass-panel rounded-xl p-3 w-56 shadow-2xl flex flex-col space-y-3 z-30">
                    
                    {/* Audio Boost (Up to 200%) */}
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1 mb-1">
                        <Zap className="w-3 h-3" />
                        <span>Volume Booster</span>
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        {[1, 1.5, 2].map((boost) => (
                          <button
                            key={boost}
                            onClick={() => handleAudioBoostChange(boost)}
                            className={`py-1 rounded text-xs text-center transition-colors ${
                              audioBoost === boost
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            {boost === 1 ? '100%' : `${boost * 100}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Night Mode Dialogue Clarity */}
                    <div className="pt-2 border-t border-slate-700/60">
                      <button
                        onClick={toggleNightModeAudio}
                        className={`w-full py-1.5 px-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          nightModeAudio ? 'bg-indigo-600/40 border border-indigo-500 text-indigo-200' : 'text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="flex items-center space-x-1.5">
                          <Ear className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Clear Speech EQ</span>
                        </span>
                        {nightModeAudio && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    </div>

                    {/* Playback Speed */}
                    {!isLive && (
                      <div className="pt-2 border-t border-slate-700/60">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Playback Speed
                        </span>
                        <div className="grid grid-cols-3 gap-1">
                          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => handlePlaybackRate(rate)}
                              className={`py-1 rounded text-xs text-center transition-colors ${
                                playbackRate === rate
                                  ? 'bg-blue-600 text-white font-bold'
                                  : 'text-gray-300 hover:bg-white/10'
                              }`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* HLS Video Quality */}
                    {availableQualities.length > 0 && (
                      <div className="pt-2 border-t border-slate-700/60">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Stream Quality
                        </span>
                        <div className="flex flex-col space-y-1">
                          {availableQualities.map((q) => (
                            <button
                              key={q.id}
                              onClick={() => handleQualityChange(q.id)}
                              className={`text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                                currentQuality === q.id
                                  ? 'bg-blue-600 text-white font-bold'
                                  : 'text-gray-300 hover:bg-white/10'
                              }`}
                            >
                              <span>{q.label}</span>
                              {currentQuality === q.id && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stream Stats Toggle */}
                    <div className="pt-2 border-t border-slate-700/60">
                      <button
                        onClick={() => {
                          setShowStats(!showStats);
                          setShowSettingsMenu(false);
                        }}
                        className="w-full py-1 text-left text-[11px] text-gray-400 hover:text-white flex items-center space-x-1.5"
                      >
                        <Activity className="w-3 h-3 text-sky-400" />
                        <span>Stats for Nerds</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="tv-focusable p-2 rounded-lg text-gray-300 hover:text-white transition-transform hover:scale-105"
                title="Fullscreen (F)"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Timer Preset Modal */}
      <SleepTimerModal
        isOpen={showSleepTimer}
        onClose={() => setShowSleepTimer(false)}
        activeMinutes={sleepTimerMinutes}
        remainingSeconds={sleepTimerRemaining}
        onSetTimer={(mins) => setSleepTimerMinutes(mins)}
      />
    </div>
  );
};
