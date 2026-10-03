import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchLiveBanners, Banner } from '@/services/bannerService';

function resolveBannerHref(banner: Banner): string | null {
  if (banner.linkType === 'product' && banner.productId) return `/product/${banner.productId}`;
  if (banner.linkType === 'category' && banner.categoryId) return `/categories/${banner.categoryId}`;
  if (banner.linkType === 'url' && banner.externalUrl) return banner.externalUrl;
  return null;
}

const HeroCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: banners = [] } = useQuery({
    queryKey: ['banners', 'hero'],
    queryFn: fetchLiveBanners,
  });

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);

  const handleActivate = (banner: Banner) => {
    const href = resolveBannerHref(banner);
    if (!href) return;
    if (banner.linkType === 'url') {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      navigate(href);
    }
  };

  return (
    <section className="relative w-full h-[50vw] min-h-[200px] max-h-[80vh] sm:h-[45vw] md:h-[40vw] lg:h-[35vw] xl:h-[70vh] overflow-hidden bg-muted">
      {/* Slides */}
      {banners.map((banner, index) => {
        const href = resolveBannerHref(banner);
        const isClickable = href !== null;

        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-700 ${
              index === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            {/* Background Image */}
            <img
              src={banner.image}
              alt={banner.title}
              className={`absolute inset-0 w-full h-full object-cover object-center ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={isClickable ? () => handleActivate(banner) : undefined}
              role={isClickable ? 'link' : undefined}
              loading={index === 0 ? 'eager' : 'lazy'}
            />

            {/* Overlay — stronger on mobile for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent sm:from-foreground/80 sm:via-foreground/50 sm:to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center pointer-events-none">
              <div className="max-w-[85%] sm:max-w-lg md:max-w-xl">
                {banner.subtitle && (
                  <span
                    className={`inline-block px-2.5 py-0.5 sm:px-4 sm:py-1.5 bg-primary/20 backdrop-blur-sm text-primary-foreground text-[10px] sm:text-xs md:text-sm font-medium rounded-full mb-1 sm:mb-2 md:mb-4 transform transition-all duration-700 delay-100 ${
                      index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                  >
                    {banner.subtitle}
                  </span>
                )}

                <h1
                  className={`font-display text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-foreground leading-tight mb-1 sm:mb-2 md:mb-4 transform transition-all duration-700 delay-200 ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                >
                  {banner.title}
                </h1>

                {banner.description && (
                  <p
                    className={`text-[11px] sm:text-sm md:text-base lg:text-lg text-primary-foreground/80 mb-2 sm:mb-4 md:mb-8 max-w-xs sm:max-w-md line-clamp-2 transform transition-all duration-700 delay-300 ${
                      index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                  >
                    {banner.description}
                  </p>
                )}

                {banner.buttonText && isClickable && (
                  <div
                    className={`transform transition-all duration-700 delay-400 ${
                      index === currentSlide ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-4 opacity-0'
                    }`}
                  >
                    <Button variant="hero" size="sm" className="sm:size-lg md:size-xl" onClick={() => handleActivate(banner)}>
                      {banner.buttonText}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-1.5 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-black/30 sm:bg-card/20 backdrop-blur-sm hover:bg-black/50 sm:hover:bg-card/40 flex items-center justify-center transition-all group z-10"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white sm:text-primary-foreground group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-1.5 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-black/30 sm:bg-card/20 backdrop-blur-sm hover:bg-black/50 sm:hover:bg-card/40 flex items-center justify-center transition-all group z-10"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white sm:text-primary-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 md:gap-2 z-10">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => goToSlide(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-5 sm:w-6 md:w-8 bg-primary'
                    : 'w-1.5 sm:w-2 bg-white/50 sm:bg-primary-foreground/50 hover:bg-white/70 sm:hover:bg-primary-foreground/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroCarousel;
