import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Play, 
  Trash2, 
  Download, 
  Clock, 
  HardDrive, 
  Radio, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { SavedRecording, MediaItem } from '../types';
import { storageService } from '../services/storageService';

interface SavedRecordingsViewProps {
  onPlayRecording: (media: MediaItem) => void;
}

export const SavedRecordingsView: React.FC<SavedRecordingsViewProps> = ({ onPlayRecording }) => {
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  useEffect(() => {
    setRecordings(storageService.getSavedRecordings());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.removeSavedRecording(id);
    const updated = storageService.getSavedRecordings();
    setRecordings(updated);
    setDeleteSuccess('Recording removed.');
    setTimeout(() => setDeleteSuccess(null), 2500);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlay = (rec: SavedRecording) => {
    if (!rec.blobUrl) {
      alert('Recording file is stored in your device downloads folder.');
      return;
    }
    const mediaItem: MediaItem = {
      id: rec.id,
      title: rec.title,
      description: `Live TV Session recorded on ${new Date(rec.recordedAt).toLocaleString()}`,
      type: 'movie',
      source: 'custom',
      genres: ['Saved Recording', 'Live TV DVR'],
      posterUrl: rec.thumbnailUrl || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=500&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      streamUrl: rec.blobUrl,
      streamType: 'mp4',
      year: new Date(rec.recordedAt).getFullYear(),
      duration: formatDuration(rec.durationSeconds),
      rating: 'DVR',
    };
    onPlayRecording(mediaItem);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Tablet Responsive */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/30">
        <div>
          <div className="flex items-center space-x-2 text-red-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Live TV DVR & Saved Sessions</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">My Recorded Live TV Sessions</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
            Captured live TV sessions and downloaded broadcasts stored for offline viewing and replay.
          </p>
        </div>

        {deleteSuccess && (
          <span className="text-xs text-emerald-400 flex items-center space-x-1.5 animate-fade-in font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{deleteSuccess}</span>
          </span>
        )}
      </div>

      {recordings.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
          <HardDrive className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-300">No Live TV Sessions Recorded Yet</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-md mx-auto">
            While playing any Live TV channel or stream, tap the <span className="text-red-400 font-bold">🔴 Record Live</span> button in the video controls to capture and save the session for offline replay.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              onClick={() => handlePlay(rec)}
              className="tv-focusable group flex flex-col justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-red-500/60 transition-all duration-200 cursor-pointer hover:scale-[1.02] shadow-sm hover:shadow-xl hover:shadow-red-500/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-900/40 flex items-center justify-center flex-shrink-0 text-red-400 group-hover:scale-105 transition-transform">
                  <Film className="w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors truncate">
                    {rec.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      <span>{formatDuration(rec.durationSeconds)}</span>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400">{formatFileSize(rec.sizeBytes)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(rec.recordedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(rec);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Replay</span>
                  </button>
                  {rec.blobUrl && (
                    <a
                      href={rec.blobUrl}
                      download={`Tivicify_${rec.title.replace(/\s+/g, '_')}.webm`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <button
                  onClick={(e) => handleDelete(rec.id, e)}
                  className="p-1.5 rounded-lg hover:bg-red-950/60 text-gray-500 hover:text-red-400 transition-colors"
                  title="Delete Recording"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
