import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroCarousel from '@/components/home/HeroCarousel';
import CategoriesSection from '@/components/home/CategoriesSection';
import GallerySection from '@/components/home/GallerySection';
import BestSellers from '@/components/home/BestSellers';
import PromoBanner from '@/components/home/PromoBanner';
import Newsletter from '@/components/home/Newsletter';

const Index: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Brundhavanam Desi Foods - Authentic Indian Pickles, Spices & Sweets</title>
        <meta 
          name="description" 
          content="Shop authentic Indian pickles, spices, sweets, and snacks. Handcrafted with traditional recipes and natural ingredients. Free delivery above ₹499."
        />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroCarousel />
          <CategoriesSection />
          <BestSellers />
          <GallerySection />
          <PromoBanner />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
