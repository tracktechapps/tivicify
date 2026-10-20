import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface MediaCarouselProps {
  title: string;
  icon?: LucideIcon;
  items: MediaItem[];
  onSelectMedia: (media: MediaItem) => void;
  aspectRatio?: 'poster' | 'backdrop';
  progressMap?: Record<string, number>;
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  title,
  icon: Icon,
  items,
  onSelectMedia,
  aspectRatio = 'poster',
  progressMap = {},
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -480 : 480;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="mb-8 relative group/carousel">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-5 h-5 text-blue-400" />}
          <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
            {title}
          </h2>
          <span className="text-xs text-gray-500 font-medium">({items.length})</span>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="hidden sm:flex items-center space-x-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
            title="Scroll Left"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
            title="Scroll Right"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex items-center space-x-3.5 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
      >
        {items.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            onSelect={onSelectMedia}
            aspectRatio={aspectRatio}
            progressPercentage={progressMap[item.id]}
          />
        ))}
      </div>
    </section>
  );
};
