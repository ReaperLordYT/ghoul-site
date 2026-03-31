import { motion } from 'framer-motion';
import { Skull } from 'lucide-react';

const orgs = [
  { name: 'DarkMaster', role: 'Главный организатор', desc: 'Создатель Ghouls Cup. Видит скилл. Не прощает слабость.' },
  { name: 'VoidOracle', role: 'Судья', desc: 'Следит за каждым движением. Решения окончательны.' },
  { name: 'GrimCaster', role: 'Комментатор', desc: 'Голос турнира. Каждый килл звучит как приговор.' },
];

const Organizers = () => (
  <div className="min-h-screen py-20 px-4">
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-2">ОРГАНИЗАТОРЫ</h1>
      <p className="text-center text-muted-foreground text-sm mb-12">те, кто стоят за тьмой</p>

      <div className="space-y-6">
        {orgs.map((o, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            viewport={{ once: true }}
            className="border border-border bg-card p-6 flex items-start gap-4"
          >
            <div className="w-12 h-12 border border-primary/30 bg-primary/5 flex items-center justify-center flex-shrink-0">
              <Skull size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-heading text-foreground">{o.name}</p>
              <p className="text-xs text-primary uppercase tracking-widest mb-2">{o.role}</p>
              <p className="text-sm text-muted-foreground">{o.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default Organizers;
