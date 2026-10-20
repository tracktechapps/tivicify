import React, { useState } from 'react';
import { X, PlusCircle, Link, Image, Film, FileText, CheckCircle2 } from 'lucide-react';
import { MediaItem } from '../types';

interface CustomStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStream: (item: MediaItem) => void;
}

export const CustomStreamModal: React.FC<CustomStreamModalProps> = ({
  isOpen,
  onClose,
  onAddStream,
}) => {
  const [title, setTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [category, setCategory] = useState('Movie');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !streamUrl.trim()) return;

    const isHls = streamUrl.toLowerCase().includes('.m3u8');
    const isLive = category === 'Live TV' || streamUrl.toLowerCase().includes('live');

    const newItem: MediaItem = {
      id: 'custom-' + Date.now(),
      title: title.trim(),
      description: description.trim() || 'Custom user added media stream.',
      type: isLive ? 'live' : 'movie',
      source: 'custom',
      genres: [category],
      posterUrl:
        posterUrl.trim() ||
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80',
      backdropUrl:
        posterUrl.trim() ||
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      streamUrl: streamUrl.trim(),
      streamType: isHls ? 'hls' : 'mp4',
      year: new Date().getFullYear(),
      duration: isLive ? 'Live' : 'Custom',
      rating: 'Custom',
      isPublicDomain: false,
    };

    onAddStream(newItem);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setTitle('');
      setStreamUrl('');
      setPosterUrl('');
      setDescription('');
      onClose();
    }, 1200);
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
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Add Custom Media Stream</h2>
            <p className="text-xs text-gray-400">Stream any MP4, WebM, or HLS (.m3u8) video URL</p>
          </div>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Stream Added to Hub!</h3>
            <p className="text-xs text-gray-400 mt-1">Available across all your devices.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Media Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. My Favorite Concert or Indie Film"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Stream URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                <span>Stream URL (MP4, WebM, or .m3u8) *</span>
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  required
                  placeholder="https://example.com/video.mp4 or stream.m3u8"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category & Poster URL Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Movie">Movie</option>
                  <option value="Live TV">Live TV</option>
                  <option value="Animation">Animation</option>
                  <option value="Documentary">Documentary</option>
                  <option value="Music">Music / Concert</option>
                  <option value="Sports">Sports</option>
                  <option value="Personal">Personal / Home Video</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Poster Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://.../poster.jpg"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Short Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Enter details about this video..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="tv-focusable px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tv-focusable px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
              >
                Save & Add Stream
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
