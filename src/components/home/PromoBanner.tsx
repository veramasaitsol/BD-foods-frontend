import React from 'react';
import { Truck, ShieldCheck, Leaf, HeartHandshake } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free shipping on orders above ₹500',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Assured',
    description: '100% authentic & fresh products',
  },
  {
    icon: Leaf,
    title: 'Natural Ingredients',
    description: 'No preservatives or chemicals',
  },
  {
    icon: HeartHandshake,
    title: 'Made with Love',
    description: 'Traditional family recipes',
  },
];

const PromoBanner: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-xl sm:rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-sm sm:text-base md:text-lg font-semibold text-primary-foreground mb-0.5 sm:mb-1">
                {feature.title}
              </h3>
              <p className="text-primary-foreground/70 text-[10px] sm:text-xs md:text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
