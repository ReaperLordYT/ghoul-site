import { useStore } from '@/store/useStore';
import { Navigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { Trash2, Plus, ImagePlus } from 'lucide-react';

const Admin = () => {
  const store = useStore();
  const [tab, setTab] = useState<'players' | 'news' | 'schedule' | 'links' | 'settings'>('players');
  const [playerForm, setPlayerForm] = useState({ name: '', rank: '', mmr: '', avatar: '' });
  const [matchForm, setMatchForm] = useState({ player1: '', player2: '', time: '', date: '', round: '' });
  const [newsForm, setNewsForm] = useState({ title: '', content: '', avatar: '' });
  const [newPassword, setNewPassword] = useState('');
  const playerFileRef = useRef<HTMLInputElement>(null);
  const newsFileRef = useRef<HTMLInputElement>(null);

  if (!store.isAdmin) return <Navigate to="/login" />;

  const handlePlayerAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPlayerForm({ ...playerForm, avatar: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleExistingPlayerAvatar = (playerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => store.updatePlayer(playerId, { avatar: reader.result as string });
    reader.readAsDataURL(file);
  };

  const tabs = [
    { key: 'players', label: 'Игроки' },
    { key: 'news', label: 'Новости' },
    { key: 'schedule', label: 'Расписание' },
    { key: 'links', label: 'Ссылки' },
    { key: 'settings', label: 'Настройки' },
  ] as const;

  const handleNewsAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewsForm({ ...newsForm, avatar: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-2xl text-primary text-glow tracking-widest text-center mb-8">АДМИН ПАНЕЛЬ</h1>

        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                tab === t.key ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'players' && (
          <div className="space-y-4">
            <div className="border border-border bg-card p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Добавить игрока</p>
              <div className="flex items-center gap-3">
                <button onClick={() => playerFileRef.current?.click()} className="w-14 h-14 border border-border bg-background flex items-center justify-center flex-shrink-0 hover:border-primary/50 transition-colors">
                  {playerForm.avatar ? (
                    <img src={playerForm.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus size={18} className="text-muted-foreground" />
                  )}
                </button>
                <input ref={playerFileRef} type="file" accept="image/*" className="hidden" onChange={handlePlayerAvatar} />
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <input className="bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Имя" value={playerForm.name} onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })} />
                  <input className="bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Ранг" value={playerForm.rank} onChange={(e) => setPlayerForm({ ...playerForm, rank: e.target.value })} />
                  <input className="bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="MMR" value={playerForm.mmr} onChange={(e) => setPlayerForm({ ...playerForm, mmr: e.target.value })} />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!playerForm.name) return;
                  store.addPlayer({ id: Date.now().toString(), name: playerForm.name, rank: playerForm.rank, mmr: Number(playerForm.mmr) || 0, status: 'active', matches: [], avatar: playerForm.avatar });
                  setPlayerForm({ name: '', rank: '', mmr: '', avatar: '' });
                }}
                className="flex items-center gap-2 px-3 py-1.5 border border-primary text-primary text-xs uppercase hover:bg-primary/10"
              >
                <Plus size={12} /> Добавить
              </button>
            </div>
            {store.players.map((p) => (
              <div key={p.id} className="border border-border bg-card p-4 flex items-center gap-4">
                <label className="w-12 h-12 border border-border bg-background flex items-center justify-center flex-shrink-0 hover:border-primary/50 transition-colors overflow-hidden">
                  {p.avatar ? (
                    <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus size={16} className="text-muted-foreground" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleExistingPlayerAvatar(p.id, e)} />
                </label>
                <div className="flex-1">
                  <p className="text-foreground font-heading">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.rank} — {p.mmr} MMR</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="bg-background border border-border text-xs text-foreground px-2 py-1"
                    value={p.status}
                    onChange={(e) => store.updatePlayer(p.id, { status: e.target.value as any })}
                  >
                    <option value="active">Активен</option>
                    <option value="eliminated">Выбыл</option>
                    <option value="winner">Победитель</option>
                  </select>
                  <button onClick={() => store.removePlayer(p.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'news' && (
          <div className="space-y-4">
            <div className="border border-border bg-card p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Добавить новость</p>
              <div className="flex items-center gap-3">
                <button onClick={() => newsFileRef.current?.click()} className="w-14 h-14 border border-border bg-background flex items-center justify-center flex-shrink-0 hover:border-primary/50 transition-colors overflow-hidden">
                  {newsForm.avatar ? <img src={newsForm.avatar} alt="" className="w-full h-full object-cover" /> : <ImagePlus size={18} className="text-muted-foreground" />}
                </button>
                <input ref={newsFileRef} type="file" accept="image/*" className="hidden" onChange={handleNewsAvatar} />
                <input className="flex-1 bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Заголовок" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} />
              </div>
              <textarea className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground h-24 resize-none" placeholder="Текст новости" value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} />
              <button
                onClick={() => {
                  if (!newsForm.title) return;
                  store.addNews({ id: Date.now().toString(), title: newsForm.title, content: newsForm.content, date: new Date().toISOString().slice(0, 10), avatar: newsForm.avatar });
                  setNewsForm({ title: '', content: '', avatar: '' });
                }}
                className="flex items-center gap-2 px-3 py-1.5 border border-primary text-primary text-xs uppercase hover:bg-primary/10"
              >
                <Plus size={12} /> Добавить
              </button>
            </div>

            {store.news.map((n) => (
              <div key={n.id} className="border border-border bg-card p-4 flex items-start gap-4">
                {n.avatar && <img src={n.avatar} alt="" className="w-12 h-12 object-cover border border-border flex-shrink-0" />}
                <div className="flex-1">
                  <input
                    className="w-full bg-background border border-border px-2 py-1 text-sm text-foreground font-heading"
                    value={n.title}
                    onChange={(e) => store.updateNews(n.id, { title: e.target.value })}
                  />
                  <textarea
                    className="w-full bg-background border border-border px-2 py-1 text-xs text-muted-foreground mt-1 h-16 resize-none"
                    value={n.content}
                    onChange={(e) => store.updateNews(n.id, { content: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground/50 mt-1">{n.date}</p>
                </div>
                <button onClick={() => store.removeNews(n.id)} className="text-destructive"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}

        {tab === 'schedule' && (
          <div className="space-y-4">
            <div className="border border-border bg-card p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Добавить матч</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <input className="bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Игрок 1" value={matchForm.player1} onChange={(e) => setMatchForm({ ...matchForm, player1: e.target.value })} />
                <input className="bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Игрок 2" value={matchForm.player2} onChange={(e) => setMatchForm({ ...matchForm, player2: e.target.value })} />
                <input className="bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Время" value={matchForm.time} onChange={(e) => setMatchForm({ ...matchForm, time: e.target.value })} />
                <input className="bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Дата" value={matchForm.date} onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })} />
                <input className="bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Раунд" value={matchForm.round} onChange={(e) => setMatchForm({ ...matchForm, round: e.target.value })} />
              </div>
              <button
                onClick={() => {
                  if (!matchForm.player1) return;
                  store.addMatch({ id: Date.now().toString(), ...matchForm, status: 'upcoming' });
                  setMatchForm({ player1: '', player2: '', time: '', date: '', round: '' });
                }}
                className="flex items-center gap-2 px-3 py-1.5 border border-primary text-primary text-xs uppercase hover:bg-primary/10"
              >
                <Plus size={12} /> Добавить
              </button>
            </div>
            {store.schedule.map((m) => (
              <div key={m.id} className="border border-border bg-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm">{m.player1} vs {m.player2}</p>
                  <p className="text-xs text-muted-foreground">{m.round} — {m.date} {m.time}</p>
                  <input
                    className="mt-2 bg-background border border-border text-xs text-foreground px-2 py-1 w-24"
                    placeholder="Счёт"
                    value={m.score || ''}
                    onChange={(e) => store.updateMatch(m.id, { score: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="bg-background border border-border text-xs text-foreground px-2 py-1"
                    value={m.status}
                    onChange={(e) => store.updateMatch(m.id, { status: e.target.value as any })}
                  >
                    <option value="upcoming">Скоро</option>
                    <option value="live">LIVE</option>
                    <option value="finished">Завершён</option>
                    <option value="cancelled">Отменён</option>
                  </select>
                  <button onClick={() => store.removeMatch(m.id)} className="text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'links' && (
          <div className="border border-border bg-card p-6 space-y-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-display">Внешние ссылки</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-foreground block mb-1">Ссылка на регистрацию</label>
                <input
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground"
                  placeholder="https://..."
                  value={store.texts.registrationUrl || ''}
                  onChange={(e) => store.updateText('registrationUrl', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-foreground block mb-1">Ссылка на регламент</label>
                <input
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground"
                  placeholder="https://..."
                  value={store.texts.rulesUrl || ''}
                  onChange={(e) => store.updateText('rulesUrl', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="border border-border bg-card p-6 space-y-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-display">Настройки сайта</p>
            {[
              { label: 'Glitch эффект', value: store.glitchEnabled, set: store.setGlitch },
              { label: 'Курсор trail', value: store.cursorTrailEnabled, set: store.setCursorTrail },
              { label: 'Звуки', value: store.soundsEnabled, set: store.setSounds },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{s.label}</span>
                <button
                  onClick={() => s.set(!s.value)}
                  className={`px-4 py-1 border text-xs uppercase tracking-widest transition-colors ${
                    s.value ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground'
                  }`}
                >
                  {s.value ? 'ВКЛ' : 'ВЫКЛ'}
                </button>
              </div>
            ))}

            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Смена пароля админа</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  className="flex-1 bg-background border border-border px-3 py-2 text-sm text-foreground"
                  placeholder="Новый пароль"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  onClick={() => {
                    if (!newPassword.trim()) return;
                    store.changeAdminPassword(newPassword);
                    setNewPassword('');
                  }}
                  className="px-4 py-2 border border-primary text-primary text-xs uppercase tracking-widest hover:bg-primary/10"
                >
                  Обновить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
