import { Navbar } from './Navbar';
import { CustomCursor } from './CustomCursor';
import { useStore } from '@/store/useStore';
import { useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { glitchEnabled, audio, soundsEnabled, setSounds, theme } = useStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = audio.volume;
    if (!soundsEnabled) {
      audioRef.current.pause();
      return;
    }
    if (audio.autoplay) {
      void audioRef.current.play().catch(() => {
        // Ignore autoplay restrictions in browser.
      });
    }
  }, [audio, soundsEnabled]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className={`min-h-screen noise-bg ${glitchEnabled ? 'scanline-overlay' : ''}`}>
      <CustomCursor />
      <audio ref={audioRef} src={audio.url} loop preload="auto" />
      <Navbar />
      <button
        className="fixed right-4 bottom-4 z-50 border border-border bg-card px-3 py-2 text-xs text-foreground hover:border-primary/60"
        onClick={() => setSounds(!soundsEnabled)}
      >
        {soundsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </button>
      <main className="pt-14">
        {children}
      </main>
      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-muted-foreground font-display tracking-widest">
          GHOULS CUP © 2026 — mid решает всё
        </p>
      </footer>
    </div>
  );
};
