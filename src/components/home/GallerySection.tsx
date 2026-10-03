import React, { useState } from 'react';
import { Camera, Play, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGalleryItems, GalleryItem } from '@/services/galleryService';
import MediaViewer from './MediaViewer';

const GallerySection: React.FC = () => {
  const { data: galleryItems = [] } = useQuery({
    queryKey: ['gallery'],
    queryFn: fetchGalleryItems,
  });

  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleOpenViewer = (index: number) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  if (galleryItems.length === 0) return null;

  // Show only 4 items on homepage
  const displayItems = galleryItems.slice(0, 4);

  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium text-sm uppercase tracking-wider">
                Our Moments
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Gallery
            </h2>
          </div>
          <Link 
            to="/gallery" 
            className="hidden sm:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayItems.map((item, index) => (
            <GalleryCard
              key={item.id}
              item={item}
              index={index}
              onClick={() => handleOpenViewer(index)}
            />
          ))}
        </div>

        {/* Mobile View More */}
        <div className="mt-8 text-center sm:hidden">
          <Link 
            to="/gallery" 
            className="inline-flex items-center gap-2 text-primary font-medium"
          >
            View More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Media Viewer */}
      <MediaViewer
        items={displayItems}
        currentIndex={currentIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </section>
  );
};

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
  onClick: () => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ item, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isVideo = item.mediaType === 'video';

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square bg-muted"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {isVideo ? (
          <>
            <video
              src={item.mediaUrl}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              muted
              preload="metadata"
            />
            {/* Play icon for video */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Play className="h-5 w-5 text-primary ml-1" />
              </div>
            </div>
          </>
        ) : (
          <img
            src={item.mediaUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        )}

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-medium text-sm truncate">{item.title}</p>
            {item.description && (
              <p className="text-white/70 text-xs truncate mt-1">{item.description}</p>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GallerySection;
