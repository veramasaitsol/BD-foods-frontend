import React from 'react';
import { Play, Pause } from 'lucide-react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';

const BackgroundMusicToggle: React.FC = () => {
  const { isPlaying, togglePlayback } = useBackgroundMusic();

  return (
    <button
      onClick={togglePlayback}
      aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
      title={isPlaying ? 'Pause background music' : 'Play background music'}
      className="fixed bottom-5 right-5 z-[90] w-11 h-11 rounded-full bg-card shadow-elevated border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
    >
      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
    </button>
  );
};

export default BackgroundMusicToggle;
