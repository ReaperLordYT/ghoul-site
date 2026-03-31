import { motion } from 'framer-motion';

export const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
    >
      <div className="text-center px-6">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-full border border-primary/40 flex items-center justify-center animate-red-pulse">
            <div className="w-8 h-8 rounded-full bg-primary/70 shadow-[0_0_15px_rgba(255,0,0,0.6)]" />
          </div>
        </div>
        <p className="font-display text-primary text-glow tracking-[0.25em] text-sm uppercase">
          Ghoul Dominion
        </p>
        <p className="mt-2 text-xs text-muted-foreground tracking-widest uppercase">
          1000-7 loading...
        </p>
      </div>
    </motion.div>
  );
};

