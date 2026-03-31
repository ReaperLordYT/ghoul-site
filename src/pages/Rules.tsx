import { motion } from 'framer-motion';

const rules = [
  { title: 'Формат', text: '1v1 Shadow Fiend (SF vs SF). Мид. Best of 3.' },
  { title: 'Карта', text: 'Стандартная карта Dota 2. Режим — Solo Mid 1v1.' },
  { title: 'Победа', text: 'Первый, кто наберёт 2 убийства ИЛИ уничтожит первую вышку.' },
  { title: 'Запреты', text: 'Бутылка разрешена. Руны разрешены. Нейтральные предметы — нет.' },
  { title: 'Лобби', text: 'Организатор создаёт лобби. Пароль выдаётся за 5 минут до матча.' },
  { title: 'Опоздание', text: 'Опоздание более 10 минут = техническое поражение.' },
  { title: 'Читы', text: 'Любые сторонние программы = перманентный бан + дисквалификация.' },
  { title: 'Споры', text: 'Все спорные моменты решает организатор. Решение окончательное.' },
];

const Rules = () => (
  <div className="min-h-screen py-20 px-4">
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-2">РЕГЛАМЕНТ</h1>
        <p className="text-center text-muted-foreground text-sm mb-12">правила просты. нарушишь — уйдёшь.</p>
      </motion.div>

      <div className="space-y-6">
        {rules.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="border-l-2 border-primary/40 pl-6 py-2"
          >
            <h3 className="font-display text-sm text-primary uppercase tracking-widest mb-1">{r.title}</h3>
            <p className="text-sm text-muted-foreground">{r.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default Rules;
