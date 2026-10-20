import React, { useState } from 'react';
import { X, FolderPlus, Upload, Globe, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ChannelItem } from '../types';
import { parseM3UPlaylist, fetchM3UFromUrl } from '../services/iptvParser';

interface M3UImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportChannels: (channels: ChannelItem[]) => void;
}

export const M3UImporterModal: React.FC<M3UImporterModalProps> = ({
  isOpen,
  onClose,
  onImportChannels,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'file'>('url');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const channels = await fetchM3UFromUrl(playlistUrl.trim());
      if (channels.length === 0) {
        throw new Error('No valid channels found in this playlist.');
      }
      onImportChannels(channels);
      setImportedCount(channels.length);
      setTimeout(() => {
        setImportedCount(null);
        setPlaylistUrl('');
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import playlist.';
      setError(`${msg} (Ensure CORS is permitted or upload the .m3u file directly)`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
    };
    reader.onerror = () => {
      setError('Failed to read selected file.');
    };
    reader.readAsText(file);
  };

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileContent.trim()) return;

    try {
      const channels = parseM3UPlaylist(fileContent);
      if (channels.length === 0) {
        throw new Error('No valid channel entries (#EXTINF) found in this file.');
      }
      onImportChannels(channels);
      setImportedCount(channels.length);
      setTimeout(() => {
        setImportedCount(null);
        setFileContent('');
        setFileName('');
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid M3U playlist format.';
      setError(msg);
    }
  };

  // Sample legal playlist helper
  const loadPreset = (presetUrl: string) => {
    setPlaylistUrl(presetUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="tv-focusable absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-gray-400 hover:text-white transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Import IPTV M3U Playlist</h2>
            <p className="text-xs text-gray-400">Load channels into your 24/7 Live TV Guide</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-800 p-1 mb-6 border border-slate-700">
          <button
            onClick={() => {
              setActiveTab('url');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${
              activeTab === 'url' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Playlist URL</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('file');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${
              activeTab === 'file' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>

        {importedCount !== null ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Imported {importedCount} Channels!</h3>
            <p className="text-xs text-gray-400 mt-1">Available now under Live TV Guide.</p>
          </div>
        ) : (
          <>
            {activeTab === 'url' ? (
              <form onSubmit={handleUrlImport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    M3U / M3U8 Playlist URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/playlist.m3u"
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Preset Suggestions */}
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Quick Legal Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        loadPreset(
                          'https://iptv-org.github.io/iptv/languages/eng.m3u'
                        )
                      }
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors"
                    >
                      Global English Free-to-Air
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        loadPreset(
                          'https://iptv-org.github.io/iptv/categories/news.m3u'
                        )
                      }
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors"
                    >
                      World News Free HLS
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start space-x-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="tv-focusable px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="tv-focusable flex items-center space-x-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Parsing...</span>
                      </>
                    ) : (
                      <span>Import Playlist</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleFileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Select .m3u or .m3u8 file
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-300">
                      {fileName || 'Click to select M3U file'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">.m3u or .m3u8 files</span>
                    <input
                      type="file"
                      accept=".m3u,.m3u8,text/plain"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {error && (
                  <div className="flex items-start space-x-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="tv-focusable px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!fileContent}
                    className="tv-focusable px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
                  >
                    Parse & Save Channels
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
