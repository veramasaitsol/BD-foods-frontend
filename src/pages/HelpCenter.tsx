import React from 'react';
import { Helmet } from 'react-helmet-async';
import { HelpCircle, Phone, Mail, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { fetchFaqs } from '@/services/faqService';
import { fetchStoreSettings } from '@/services/settingsService';

const HelpCenter: React.FC = () => {
  const { data: faqs = [], isLoading: faqsLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: fetchFaqs,
  });
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchStoreSettings,
  });

  return (
    <>
      <Helmet>
        <title>Help Center - Brundhavanam Desi Foods</title>
        <meta name="description" content="Get help and support for your orders and queries" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              How can we help you?
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions or get in touch with our support team
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {settings?.storePhone && (
              <Card className="text-center hover:shadow-elevated transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
                  <p className="text-muted-foreground text-sm mb-4">Mon-Sat, 9AM-6PM</p>
                  <a href={`tel:${settings.storePhone}`}>
                    <Button variant="outline" className="w-full mb-2">
                      {settings.storePhone}
                    </Button>
                  </a>
                  {settings.storePhone2 && (
                    <a href={`tel:${settings.storePhone2}`}>
                      <Button variant="outline" className="w-full">
                        {settings.storePhone2}
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {settings?.storeEmail && (
              <Card className="text-center hover:shadow-elevated transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
                  <p className="text-muted-foreground text-sm mb-4">We reply within 24 hours</p>
                  <a href={`mailto:${settings.storeEmail}`}>
                    <Button variant="outline" className="w-full text-xs sm:text-sm break-all h-auto py-3">
                      {settings.storeEmail}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            <Card className="text-center hover:shadow-elevated transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
                <p className="text-muted-foreground text-sm mb-4">Chat with us anytime</p>
                <a href={`https://wa.me/${settings?.storePhone?.replace(/[^0-9]/g, '') || ''}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    Start Chat
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {faqsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading FAQs...</div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No FAQs available yet.</div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left text-sm sm:text-base">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default HelpCenter;
