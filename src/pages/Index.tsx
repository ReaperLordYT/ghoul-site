import { motion } from 'framer-motion';
import { InlineEdit } from '@/components/InlineEdit';
import { useStore } from '@/store/useStore';
import { Skull, Swords, Trophy } from 'lucide-react';

const Index = () => {
  const { top3, texts } = useStore();

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <InlineEdit textKey="heroTitle" as="h1" className="font-display text-5xl md:text-8xl tracking-wider text-primary text-glow animate-flicker" />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
            <InlineEdit textKey="heroSubtitle" as="p" className="mt-4 text-sm md:text-base text-muted-foreground uppercase tracking-[0.3em]" />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}>
            <InlineEdit textKey="heroQuote" as="p" className="mt-8 text-lg md:text-xl text-foreground/70 italic font-heading" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }} className="mt-10 flex gap-4 justify-center">
            <a href={texts.registrationUrl || '#'} target="_blank" rel="noopener noreferrer" className="px-8 py-3 border border-primary bg-primary/10 text-primary font-display text-sm uppercase tracking-widest hover:bg-primary/20 transition-colors box-glow">
              Вступить
            </a>
            <a href={texts.rulesUrl || '#'} target="_blank" rel="noopener noreferrer" className="px-8 py-3 border border-border text-muted-foreground font-display text-sm uppercase tracking-widest hover:border-primary/50 hover:text-foreground transition-colors">
              Регламент
            </a>
          </motion.div>
        </div>
      </section>

      <div className="scratch-line w-full" />

      {/* Top 3 */}
      <section className="py-20 px-4">
        <InlineEdit textKey="top3Title" as="h2" className="font-display text-2xl md:text-3xl text-center text-primary text-glow tracking-widest mb-12" />
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
          {top3.map((p, i) => (
            <motion.div
              key={p.place}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className={`relative border border-border bg-card p-8 text-center w-64 ${
                i === 0 ? 'md:-mt-8 border-primary box-glow' : ''
              }`}
            >
              <div className="text-4xl font-display text-primary mb-2">
                {p.place === 1 ? <Trophy className="mx-auto text-primary" size={40} /> : <Skull className="mx-auto text-muted-foreground" size={32} />}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">#{p.place}</p>
              <p className="font-heading text-lg text-foreground">{p.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="scratch-line w-full" />

      {/* Quotes section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto space-y-8 text-center">
          {['quote1', 'quote2', 'quote3', 'quote4'].map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <InlineEdit textKey={key} as="p" className="text-lg md:text-xl text-muted-foreground/60 font-heading italic" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-t border-border">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: <Swords size={24} />, labelKey: 'statMatchesLabel', valueKey: 'statMatchesValue' },
            { icon: <Skull size={24} />, labelKey: 'statPlayersLabel', valueKey: 'statPlayersValue' },
            { icon: <Trophy size={24} />, labelKey: 'statPrizeLabel', valueKey: 'statPrizeValue' },
            { icon: <Swords size={24} />, labelKey: 'statRoundsLabel', valueKey: 'statRoundsValue' },
          ].map((s, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-center text-primary">{s.icon}</div>
              <InlineEdit textKey={s.valueKey} as="p" className="font-display text-2xl text-foreground" />
              <InlineEdit textKey={s.labelKey} as="p" className="text-xs text-muted-foreground uppercase tracking-widest" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
