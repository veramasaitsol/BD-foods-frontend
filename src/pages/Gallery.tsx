import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Camera, Play, Eye, Image, Video, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGalleryItems, GalleryItem } from '@/services/galleryService';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MediaViewer from '@/components/home/MediaViewer';

type FilterType = 'all' | 'photo' | 'video';

const GalleryPage: React.FC = () => {
  const { data: galleryItems = [], isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: fetchGalleryItems,
  });

  const [filter, setFilter] = useState<FilterType>('all');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return galleryItems;
    return galleryItems.filter((item) => item.mediaType === filter);
  }, [galleryItems, filter]);

  const photoCount = galleryItems.filter((item) => item.mediaType === 'photo').length;
  const videoCount = galleryItems.filter((item) => item.mediaType === 'video').length;

  const handleOpenViewer = (index: number) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <>
      <Helmet>
        <title>Gallery - Brundhavanam Desi Foods</title>
        <meta
          name="description"
          content="Explore our gallery of authentic Indian pickles, spices, sweets, and snacks. View photos and videos of our handcrafted products."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          {/* Hero Header */}
          <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/30 py-16 md:py-20">
            <div className="container mx-auto px-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <Camera className="w-8 h-8 text-primary" />
                <span className="text-primary font-medium text-sm uppercase tracking-wider">
                  Our Moments
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
                Gallery
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl">
                Explore our collection of photos and videos showcasing the authentic flavors and traditions of Brundhavanam Desi Foods.
              </p>
            </div>
          </section>

          {/* Filter Tabs */}
          <section className="container mx-auto px-4 py-8">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                All ({galleryItems.length})
              </button>
              <button
                onClick={() => setFilter('photo')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === 'photo'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Image className="h-4 w-4" />
                Photos ({photoCount})
              </button>
              <button
                onClick={() => setFilter('video')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === 'video'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Video className="h-4 w-4" />
                Videos ({videoCount})
              </button>
            </div>
          </section>

          {/* Gallery Grid */}
          <section className="container mx-auto px-4 pb-20">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  {filter === 'all'
                    ? 'No gallery items available yet.'
                    : `No ${filter === 'photo' ? 'photos' : 'videos'} available yet.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredItems.map((item, index) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    index={index}
                    onClick={() => handleOpenViewer(index)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>

      {/* Media Viewer */}
      <MediaViewer
        items={filteredItems}
        currentIndex={currentIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </>
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
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square bg-muted shadow-sm hover:shadow-xl transition-shadow duration-300"
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
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Play className="h-6 w-6 text-primary ml-1" />
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
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 ${
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
            <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
