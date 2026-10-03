import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Leaf } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageContent from '@/components/PageContent';
import { Card, CardContent } from '@/components/ui/card';
import { fetchStoreSettings } from '@/services/settingsService';

const AboutUs: React.FC = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchStoreSettings,
  });

  return (
    <>
      <Helmet>
        <title>About Us - Brundhavanam Desi Foods</title>
        <meta name="description" content="Learn about Brundhavanam Desi Foods and our story" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              About {settings?.storeName || 'Us'}
            </h1>
          </div>

          <Card>
            <CardContent className="pt-6">
              <PageContent content={settings?.aboutContent} loading={isLoading} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AboutUs;
