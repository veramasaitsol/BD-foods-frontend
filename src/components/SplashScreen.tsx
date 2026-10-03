import React, { useEffect, useState } from 'react';
import logo from '@/assets/logo.png';
import splashBg from '@/assets/splash-bg.avif';
import { startAudio } from '@/hooks/useBackgroundMusic';

interface SplashScreenProps {
  onFinish: () => void;
  holdMs?: number;
  fadeMs?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, holdMs = 2500, fadeMs = 500 }) => {
  const [phase, setPhase] = useState<'fade-in' | 'hold' | 'move-up' | 'exit'>('fade-in');

  // Phase 1→2: fade-in completes → hold
  useEffect(() => {
    const t = setTimeout(() => setPhase('hold'), 900);
    return () => clearTimeout(t);
  }, []);

  // Phase 2→3: hold completes → ready to dismiss (waiting for tap)
  // No auto-advance — user MUST tap to continue

  // Phase 3→4: logo moved up → exit & hand off to login
  useEffect(() => {
    if (phase !== 'move-up') return;
    const t = setTimeout(() => setPhase('exit'), 600);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'exit') return;
    const t = setTimeout(onFinish, fadeMs);
    return () => clearTimeout(t);
  }, [phase, fadeMs, onFinish]);

  // Auto-advance after holdMs as fallback (for users who don't tap)
  useEffect(() => {
    if (phase !== 'hold') return;
    const t = setTimeout(() => setPhase('move-up'), holdMs);
    return () => clearTimeout(t);
  }, [phase, holdMs]);

  const handleTap = () => {
    // This is a real user gesture — start audio here
    startAudio();
    // Move to next phase if still in fade-in or hold
    if (phase === 'fade-in' || phase === 'hold') {
      setPhase('move-up');
    }
  };

  const logoPosition = phase === 'move-up' || phase === 'exit'
    ? 'translate-y-[-45vh] scale-[0.35]'
    : 'translate-y-0 scale-100';

  const bgOpacity = phase === 'exit' ? 'opacity-0' : 'opacity-100';

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity ease-out ${bgOpacity}`}
      style={{ transitionDuration: `${fadeMs}ms` }}
      role="status"
      aria-label="Loading Brundhavanam Desi Foods"
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${splashBg})` }}
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/50" />
      <img
        src={logo}
        alt="Brundhavanam Desi Foods"
        className={`relative w-64 h-64 md:w-96 md:h-96 object-contain drop-shadow-2xl transition-all ease-in-out ${
          phase === 'fade-in' ? 'animate-logo-fade-in' : ''
        } ${logoPosition}`}
        style={{ transitionDuration: phase === 'move-up' ? '600ms' : undefined }}
      />
      {/* Tap prompt */}
      {(phase === 'fade-in' || phase === 'hold') && (
        <div className="absolute bottom-16 text-white/80 text-sm animate-pulse">
          Tap anywhere to continue
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
