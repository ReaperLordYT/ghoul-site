import { Link, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Menu, X, LogOut, Pencil, Moon, Sun } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const { isAdmin, editMode, toggleEditMode, logout, texts, theme, toggleTheme } = useStore();
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Главная', external: false },
    { to: texts.registrationUrl || '#', label: 'Регистрация', external: true },
    { to: texts.rulesUrl || '#', label: 'Регламент', external: true },
    { to: '/news', label: 'Новости', external: false },
    { to: '/players', label: 'Игроки', external: false },
    { to: '/bracket', label: 'Сетка', external: false },
    { to: '/schedule', label: 'Расписание', external: false },
    { to: '/organizers', label: 'Организаторы', external: false },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="font-display text-lg tracking-widest text-primary animate-flicker">
          GHOULS CUP
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-wider transition-colors hover:text-primary text-muted-foreground"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={`text-xs uppercase tracking-wider transition-colors hover:text-primary ${
                  location.pathname === item.to ? 'text-primary text-glow' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            )
          )}
          <button onClick={toggleTheme} className="text-muted-foreground hover:text-primary" title={theme === "light" ? "Тёмная тема" : "Светлая тема"}>
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          {isAdmin && (
            <>
              <button onClick={toggleEditMode} className={`flex items-center gap-1 text-xs uppercase ${editMode ? 'text-primary text-glow' : 'text-muted-foreground hover:text-primary'}`}>
                <Pencil size={12} /> {editMode ? 'Выкл. ред.' : 'Ред.'}
              </button>
              <Link to="/admin" className="text-xs uppercase tracking-wider text-primary hover:text-glow">
                Админ
              </Link>
              <button onClick={logout} className="text-muted-foreground hover:text-primary">
                <LogOut size={14} />
              </button>
            </>
          )}
          {!isAdmin && (
            <Link to="/login" className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary">
              Вход
            </Link>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-xs uppercase tracking-wider border-b border-border/50 text-muted-foreground"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 text-xs uppercase tracking-wider border-b border-border/50 ${
                  location.pathname === item.to ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            )
          )}
          <button onClick={toggleTheme} className="block w-full text-left px-4 py-3 text-xs uppercase tracking-wider border-b border-border/50 text-muted-foreground">
            Тема: {theme === "light" ? "Светлая" : "Тёмная"}
          </button>
        </div>
      )}
    </nav>
  );
};
