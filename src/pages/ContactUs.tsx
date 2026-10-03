import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Phone, Mail, MapPin } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageContent from '@/components/PageContent';
import { Card, CardContent } from '@/components/ui/card';
import { fetchStoreSettings } from '@/services/settingsService';

const ContactUs: React.FC = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchStoreSettings,
  });

  const contactCards = [
    {
      icon: Phone,
      label: 'Call Us',
      value: settings?.storePhone,
      href: settings?.storePhone ? `tel:${settings.storePhone}` : undefined,
    },
    {
      icon: Mail,
      label: 'Email Us',
      value: settings?.storeEmail,
      href: settings?.storeEmail ? `mailto:${settings.storeEmail}` : undefined,
    },
    {
      icon: MapPin,
      label: 'Visit Us',
      value: settings?.storeAddress,
      href: undefined,
    },
  ].filter((card) => card.value);

  return (
    <>
      <Helmet>
        <title>Contact Us - Brundhavanam Desi Foods</title>
        <meta name="description" content="Get in touch with Brundhavanam Desi Foods" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <PageContent content={settings?.contactMessage} loading={isLoading} />
          </div>

          {!isLoading && contactCards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contactCards.map((card) => (
                <Card key={card.label} className="text-center hover:shadow-elevated transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <card.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{card.label}</h3>
                    {card.href ? (
                      <a href={card.href} className="text-sm text-primary hover:underline break-words">
                        {card.value}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground break-words">{card.value}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ContactUs;
