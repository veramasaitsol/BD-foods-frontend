import { useEffect, useRef, useState } from 'react';
import bgTrack from '@/assets/au_file1.mp3';

let globalAudio: HTMLAudioElement | null = null;

function getOrCreateAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio(bgTrack);
    globalAudio.loop = true;
    globalAudio.volume = 0.35;
    globalAudio.preload = 'auto';
  }

  return globalAudio;
}

export function startAudio() {
  const audio = getOrCreateAudio();

  audio.muted = false;

  if (!audio.paused) return;

  audio.play().catch((error) => {
    console.log('Audio play blocked:', error);
  });
}

export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = getOrCreateAudio();

    audioRef.current = audio;

    const sync = () => {
      setIsPlaying(!audio.paused);
    };

    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('playing', sync);
    audio.addEventListener('ended', sync);

    sync();

    // Try autoplay when page loads
    audio.muted = false;

    audio.play().catch((error) => {
      console.log('Autoplay blocked:', error);
    });

    /*
     * If autoplay is blocked,
     * start audio on the first user interaction.
     */
    const handleFirstInteraction = () => {
      if (audio.paused) {
        audio.muted = false;

        audio.play().catch((error) => {
          console.log('Audio still blocked:', error);
        });
      }

      removeInteractionListeners();
    };

    const removeInteractionListeners = () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, {
      once: true,
    });

    window.addEventListener('touchstart', handleFirstInteraction, {
      once: true,
    });

    window.addEventListener('keydown', handleFirstInteraction, {
      once: true,
    });

    return () => {
      removeInteractionListeners();

      audio.removeEventListener('play', sync);
      audio.removeEventListener('pause', sync);
      audio.removeEventListener('playing', sync);
      audio.removeEventListener('ended', sync);
    };
  }, []);

  const togglePlayback = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      audio.muted = false;

      audio.play().catch((error) => {
        console.log('Audio play failed:', error);
      });
    } else {
      audio.pause();
    }
  };

  return {
    isPlaying,
    togglePlayback,
  };
}
// import { useEffect, useRef, useState } from 'react';
// import bgTrack from '@/assets/au_file1.mp3';

// let globalAudio: HTMLAudioElement | null = null;

// function getOrCreateAudio(): HTMLAudioElement {
//   if (!globalAudio) {
//     globalAudio = new Audio(bgTrack);
//     globalAudio.loop = true;
//     globalAudio.volume = 0.35;
//     globalAudio.preload = 'auto';
//   }

//   return globalAudio;
// }

// /**
//  * Start audio from a user gesture.
//  */
// export function startAudio() {
//   const audio = getOrCreateAudio();

//   audio.muted = false;

//   if (!audio.paused) return;

//   audio.play().catch(() => {
//     // Browser blocked autoplay.
//   });
// }

// export function useBackgroundMusic() {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);

//   useEffect(() => {
//     const audio = getOrCreateAudio();

//     audioRef.current = audio;

//     const sync = () => {
//       setIsPlaying(!audio.paused);
//     };

//     audio.addEventListener('play', sync);
//     audio.addEventListener('pause', sync);
//     audio.addEventListener('playing', sync);
//     audio.addEventListener('ended', sync);

//     sync();

//     /*
//      * IMPORTANT:
//      * Always try to play when website loads.
//      *
//      * Even if user paused the music before
//      * reloading, it will try to start again.
//      */
//     if (audio.paused) {
//       audio.muted = false;

//       audio.play().catch(() => {
//         /*
//          * Autoplay may be blocked by browser.
//          * In that case startAudio() should be called
//          * from a user interaction such as splash screen.
//          */
//       });
//     }

//     return () => {
//       audio.removeEventListener('play', sync);
//       audio.removeEventListener('pause', sync);
//       audio.removeEventListener('playing', sync);
//       audio.removeEventListener('ended', sync);
//     };
//   }, []);

//   const togglePlayback = () => {
//     const audio = audioRef.current;

//     if (!audio) return;

//     if (audio.paused) {
//       audio.muted = false;

//       audio.play().catch(() => {});
//     } else {
//       audio.pause();
//     }
//   };

//   return {
//     isPlaying,
//     togglePlayback,
//   };
// }
// // import { useEffect, useRef, useState } from 'react';
// // import bgTrack from '@/assets/au_file1.mp3';

// // let globalAudio: HTMLAudioElement | null = null;

// // const AUDIO_STORAGE_KEY = 'background_music_enabled';

// // function getOrCreateAudio(): HTMLAudioElement {
// //   if (!globalAudio) {
// //     globalAudio = new Audio(bgTrack);
// //     globalAudio.loop = true;
// //     globalAudio.volume = 0.35;
// //     globalAudio.preload = 'auto';
// //   }

// //   return globalAudio;
// // }

// // /**
// //  * Start audio after a user gesture.
// //  */
// // export function startAudio() {
// //   const audio = getOrCreateAudio();

// //   audio.muted = false;

// //   if (!audio.paused) return;

// //   audio
// //     .play()
// //     .then(() => {
// //       localStorage.setItem(AUDIO_STORAGE_KEY, 'true');
// //     })
// //     .catch(() => {
// //       // Browser blocked autoplay.
// //       // User interaction will be required.
// //     });
// // }

// // export function useBackgroundMusic() {
// //   const audioRef = useRef<HTMLAudioElement | null>(null);
// //   const [isPlaying, setIsPlaying] = useState(false);

// //   useEffect(() => {
// //     const audio = getOrCreateAudio();

// //     audioRef.current = audio;

// //     const sync = () => {
// //       setIsPlaying(!audio.paused);
// //     };

// //     audio.addEventListener('play', sync);
// //     audio.addEventListener('pause', sync);
// //     audio.addEventListener('playing', sync);
// //     audio.addEventListener('ended', sync);

// //     sync();

// //     /**
// //      * Try to restore previous music state.
// //      *
// //      * If the user had music enabled before,
// //      * try playing it again after reload.
// //      */
// //     const musicEnabled =
// //       localStorage.getItem(AUDIO_STORAGE_KEY) !== 'false';

// //     if (musicEnabled && audio.paused) {
// //       audio.muted = false;

// //       audio.play().catch(() => {
// //         // Autoplay blocked by browser.
// //         // We will start it after the next user interaction.
// //       });
// //     }

// //     return () => {
// //       audio.removeEventListener('play', sync);
// //       audio.removeEventListener('pause', sync);
// //       audio.removeEventListener('playing', sync);
// //       audio.removeEventListener('ended', sync);
// //     };
// //   }, []);

// //   const togglePlayback = () => {
// //     const audio = audioRef.current;

// //     if (!audio) return;

// //     if (audio.paused) {
// //       audio.muted = false;

// //       audio
// //         .play()
// //         .then(() => {
// //           // User explicitly enabled music
// //           localStorage.setItem(AUDIO_STORAGE_KEY, 'true');
// //         })
// //         .catch(() => {});
// //     } else {
// //       audio.pause();

// //       // User explicitly paused music
// //       localStorage.setItem(AUDIO_STORAGE_KEY, 'false');
// //     }
// //   };

// //   return {
// //     isPlaying,
// //     togglePlayback,
// //   };
// // }
// // // import { useEffect, useRef, useState } from 'react';
// // // import bgTrack from '@/assets/au_file1.mp3';

// // // let globalAudio: HTMLAudioElement | null = null;

// // // function getOrCreateAudio(): HTMLAudioElement {
// // //   if (!globalAudio) {
// // //     globalAudio = new Audio(bgTrack);
// // //     globalAudio.loop = true;
// // //     globalAudio.volume = 0.35;
// // //     globalAudio.preload = 'auto';
// // //   }
// // //   return globalAudio;
// // // }

// // // /**
// // //  * Start audio from a user gesture (splash tap or play button).
// // //  * On desktop this also works from muted autoplay, but on mobile
// // //  * a real user gesture is required.
// // //  */
// // // export function startAudio() {
// // //   const audio = getOrCreateAudio();
// // //   audio.muted = false;
// // //   if (!audio.paused) return;
// // //   audio.play().catch(() => {});
// // // }

// // // export function useBackgroundMusic() {
// // //   const audioRef = useRef<HTMLAudioElement | null>(null);
// // //   const [isPlaying, setIsPlaying] = useState(false);

// // //   useEffect(() => {
// // //     const audio = getOrCreateAudio();
// // //     audioRef.current = audio;

// // //     // Sync React state from audio events — single source of truth
// // //     const sync = () => setIsPlaying(!audio.paused);
// // //     audio.addEventListener('play', sync);
// // //     audio.addEventListener('pause', sync);
// // //     audio.addEventListener('playing', sync);
// // //     audio.addEventListener('ended', sync);
// // //     sync(); // initial sync

// // //     return () => {
// // //       audio.removeEventListener('play', sync);
// // //       audio.removeEventListener('pause', sync);
// // //       audio.removeEventListener('playing', sync);
// // //       audio.removeEventListener('ended', sync);
// // //     };
// // //   }, []);

// // //   const togglePlayback = () => {
// // //     const audio = audioRef.current;
// // //     if (!audio) return;
// // //     if (audio.paused) {
// // //       audio.muted = false;
// // //       audio.play().catch(() => {});
// // //     } else {
// // //       audio.pause();
// // //     }
// // //   };

// // //   return { isPlaying, togglePlayback };
// // // }
