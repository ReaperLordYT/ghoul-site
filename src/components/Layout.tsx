import { Navbar } from './Navbar';
import { CustomCursor } from './CustomCursor';
import { useStore } from '@/store/useStore';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const glitchEnabled = useStore((s) => s.glitchEnabled);

  return (
    <div className={`min-h-screen noise-bg ${glitchEnabled ? 'scanline-overlay' : ''}`}>
      <CustomCursor />
      <Navbar />
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
