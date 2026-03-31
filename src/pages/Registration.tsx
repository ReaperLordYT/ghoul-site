import { useState } from 'react';
import { motion } from 'framer-motion';

const Registration = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', steam: '', mmr: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <p className="font-display text-2xl text-primary text-glow mb-4">ЗАЯВКА ПРИНЯТА</p>
          <p className="text-muted-foreground">жди вызова. если достоин — узнаешь.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-2">РЕГИСТРАЦИЯ</h1>
          <p className="text-center text-muted-foreground text-sm mb-10">если слаб — не заходи</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { key: 'name', label: 'Никнейм', placeholder: 'Твоё имя в бою' },
            { key: 'steam', label: 'Steam ID', placeholder: 'STEAM_0:...' },
            { key: 'mmr', label: 'MMR', placeholder: 'Только честно' },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">{field.label}</label>
              <input
                required
                className="w-full bg-card border border-border px-4 py-3 text-foreground font-body text-sm focus:border-primary focus:outline-none transition-colors"
                placeholder={field.placeholder}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">Сообщение</label>
            <textarea
              className="w-full bg-card border border-border px-4 py-3 text-foreground font-body text-sm h-24 resize-none focus:border-primary focus:outline-none transition-colors"
              placeholder="Почему ты достоин?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <button type="submit" className="w-full py-3 border border-primary bg-primary/10 text-primary font-display text-sm uppercase tracking-widest hover:bg-primary/20 transition-colors box-glow">
            Отправить заявку
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
