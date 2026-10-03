import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { fetchStoreSettings } from '@/services/settingsService';
import logo from '@/assets/logo.png';
import { fetchCategories } from '@/services/categoryService';

const Footer: React.FC = () => {
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchStoreSettings,
  });

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Brundhavanam Desi Foods" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl">Brundhavanam</h3>
                <p className="text-xs sm:text-sm text-primary-foreground/70">Desi Foods</p>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-xs sm:text-sm leading-relaxed mb-4">
              Bringing authentic Indian flavors to your doorstep. Handcrafted with love, 
              just like grandma used to make.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links + Categories side by side on mobile */}
          <div className="col-span-2 grid grid-cols-2 gap-6 md:contents">
            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-xs sm:text-sm md:text-base lg:text-lg mb-2 sm:mb-3 md:mb-4">Quick Links</h4>
              <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                {[
                  { label: 'Home', to: '/' },
                  { label: 'Shop All', to: '/categories' },
                  { label: 'About Us', to: '/about' },
                  { label: 'Contact', to: '/contact' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-primary-foreground/70 hover:text-primary transition-colors text-xs sm:text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-display font-semibold text-xs sm:text-sm md:text-base lg:text-lg mb-2 sm:mb-3 md:mb-4">Categories</h4>
              <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      to={`/categories/${category.id.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                      className="text-primary-foreground/70 hover:text-primary transition-colors text-xs sm:text-sm"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h4 className="font-display font-semibold text-xs sm:text-sm md:text-base lg:text-lg mb-2 sm:mb-3 md:mb-4">Contact Us</h4>
            <ul className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {settings?.storeAddress && (
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-primary-foreground/70 text-xs sm:text-sm">
                    {settings.storeAddress}
                  </span>
                </li>
              )}
              {settings?.storePhone && (
                <li className="flex items-center gap-2.5 sm:gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <a href={`tel:${settings.storePhone}`} className="text-primary-foreground/70 hover:text-primary text-xs sm:text-sm transition-colors">{settings.storePhone}</a>
                </li>
              )}
              {settings?.storePhone2 && (
                <li className="flex items-center gap-2.5 sm:gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <a href={`tel:${settings.storePhone2}`} className="text-primary-foreground/70 hover:text-primary text-xs sm:text-sm transition-colors">{settings.storePhone2}</a>
                </li>
              )}
              {settings?.storeEmail && (
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${settings.storeEmail}`} className="text-primary-foreground/70 hover:text-primary text-xs sm:text-sm break-all transition-colors">{settings.storeEmail}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} {settings?.storeName || 'Brundhavanam Desi Foods'}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-primary-foreground/50 hover:text-primary-foreground text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-primary-foreground/50 hover:text-primary-foreground text-sm transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
