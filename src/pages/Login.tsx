import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const login = useStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(user, pass)) {
      navigate('/admin');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <h1 className="font-display text-2xl text-primary text-glow tracking-widest text-center mb-8">ВХОД</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full bg-card border border-border px-4 py-3 text-foreground text-sm focus:border-primary focus:outline-none"
            placeholder="Логин"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            type="password"
            className="w-full bg-card border border-border px-4 py-3 text-foreground text-sm focus:border-primary focus:outline-none"
            placeholder="Пароль"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          {error && <p className="text-destructive text-xs animate-glitch">доступ запрещён</p>}
          <button type="submit" className="w-full py-3 border border-primary bg-primary/10 text-primary font-display text-sm uppercase tracking-widest hover:bg-primary/20 transition-colors">
            Войти
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
