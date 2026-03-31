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
          <div className="w-28 h-28 mx-auto rounded-full border-2 border-primary/40 flex items-center justify-center animate-red-pulse bg-card box-glow">
            <div className="w-12 h-12 rounded-full border-2 border-accent/60 bg-gradient-to-br from-primary/70 to-accent/70" />
          </div>
        </div>
        <p className="font-display text-primary text-glow tracking-[0.25em] text-sm uppercase">
          Ghoul Dominion
        </p>
        <p className="mt-2 text-xs text-muted-foreground tracking-widest uppercase">
          Tokyo Tournament Sync...
        </p>
      </div>
    </motion.div>
  );
};

