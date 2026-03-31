import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Ban, Check, CheckCircle, ChevronDown, ChevronUp, ChevronsUpDown, Clock, ExternalLink, Filter, FilterX, Info, Pencil, Plus, Radio, Trash2, Tv, X } from 'lucide-react';

const statusConfig = {
  planned: { icon: <Clock size={14} />, label: 'Запланировано', cls: 'text-sky-400' },
  live: { icon: <Radio size={14} />, label: 'LIVE', cls: 'text-lime-400 animate-flicker' },
  finished: { icon: <CheckCircle size={14} />, label: 'Завершён', cls: 'text-violet-400' },
  cancelled: { icon: <Ban size={14} />, label: 'Отменён', cls: 'text-rose-500' },
};

type SortCol = 'date' | 'time' | 'match' | 'round' | 'format' | 'result' | 'status';
type SortDir = 'asc' | 'desc';
type Filters = { format: '' | 'Bo3' | 'Bo5'; status: '' | 'planned' | 'live' | 'finished' | 'cancelled'; search: string };

const StatusBadge = ({ status }: { status: 'planned' | 'live' | 'finished' | 'cancelled' }) => {
  if (status === 'live')
    return <span className="px-2 py-0.5 rounded-md text-xs font-heading whitespace-nowrap bg-lime-500/20 text-lime-400 animate-pulse">● LIVE</span>;
  if (status === 'finished')
    return <span className="px-2 py-0.5 rounded-md text-xs font-heading whitespace-nowrap bg-violet-500/20 text-violet-300">✓ Завершён</span>;
  if (status === 'cancelled')
    return <span className="px-2 py-0.5 rounded-md text-xs font-heading whitespace-nowrap bg-rose-500/20 text-rose-400/80 line-through">✕ Отменён</span>;
  return <span className="px-2 py-0.5 rounded-md text-xs font-heading whitespace-nowrap bg-sky-500/20 text-sky-300">⏳ Запланировано</span>;
};

const SortIcon = ({ col, active, dir }: { col: SortCol; active: SortCol | null; dir: SortDir }) => {
  if (active !== col) return <ChevronsUpDown size={12} className="ml-1 text-muted-foreground/40 inline" />;
  return dir === 'asc' ? <ChevronUp size={12} className="ml-1 text-primary inline" /> : <ChevronDown size={12} className="ml-1 text-primary inline" />;
};

const FilterDropdown = ({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] text-muted-foreground uppercase tracking-wider px-1">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Schedule = () => {
  const { schedule, players, isAdmin, editMode, addMatch, removeMatch, updateMatch } = useStore();
  const [filters, setFilters] = useState<Filters>({ format: '', status: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortCol, setSortCol] = useState<SortCol | null>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    player1: '',
    player2: '',
    format: 'Bo3' as 'Bo3' | 'Bo5',
    time: '18:00',
    date: '',
    round: '',
    streamUrl: '',
    status: 'planned' as 'planned' | 'live' | 'finished' | 'cancelled',
    player1Score: 0,
    player2Score: 0,
  });

  const canAdd = isAdmin && editMode && form.player1.trim() && form.player2.trim();
  const [editForm, setEditForm] = useState({
    player1: '',
    player2: '',
    format: 'Bo3' as 'Bo3' | 'Bo5',
    time: '18:00',
    date: '',
    round: '',
    streamUrl: '',
    status: 'planned' as 'planned' | 'live' | 'finished' | 'cancelled',
    player1Score: 0,
    player2Score: 0,
  });

  const beginEdit = (id: string) => {
    const target = schedule.find((m) => m.id === id);
    if (!target) return;
    setEditingId(id);
    setEditForm({
      player1: target.player1,
      player2: target.player2,
      format: (target.format || 'Bo3') as any,
      time: target.time,
      date: target.date,
      round: target.round,
      streamUrl: target.streamUrl || '',
      status: target.status,
      player1Score: target.player1Score ?? 0,
      player2Score: target.player2Score ?? 0,
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMatch(editingId, {
      player1: editForm.player1.trim(),
      player2: editForm.player2.trim(),
      format: editForm.format,
      time: editForm.time.trim(),
      date: editForm.date.trim(),
      round: editForm.round.trim(),
      streamUrl: editForm.streamUrl.trim(),
      status: editForm.status,
      player1Score: editForm.player1Score,
      player2Score: editForm.player2Score,
      score: `${editForm.player1Score}:${editForm.player2Score}`,
    });
    setEditingId(null);
  };

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const hasActiveFilters = !!(filters.format || filters.status || filters.search.trim());
  const resetFilters = () => setFilters({ format: '', status: '', search: '' });

  const getPlayer = (name: string) => players.find((p) => p.name === name);

  const processed = useMemo(() => {
    let list = [...schedule];
    if (filters.format) list = list.filter((m) => (m.format || 'Bo3') === filters.format);
    if (filters.status) list = list.filter((m) => m.status === filters.status);
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter((m) => (m.player1 || '').toLowerCase().includes(q) || (m.player2 || '').toLowerCase().includes(q) || (m.round || '').toLowerCase().includes(q));
    }
    if (sortCol) {
      list.sort((a, b) => {
        const va = (() => {
          if (sortCol === 'date') return a.date || '';
          if (sortCol === 'time') return a.time || '';
          if (sortCol === 'round') return a.round || '';
          if (sortCol === 'format') return a.format || 'Bo3';
          if (sortCol === 'status') return String(a.status);
          if (sortCol === 'match') return `${a.player1} vs ${a.player2}`;
          if (sortCol === 'result') return `${a.player1Score ?? 0}:${a.player2Score ?? 0}`;
          return '';
        })();
        const vb = (() => {
          if (sortCol === 'date') return b.date || '';
          if (sortCol === 'time') return b.time || '';
          if (sortCol === 'round') return b.round || '';
          if (sortCol === 'format') return b.format || 'Bo3';
          if (sortCol === 'status') return String(b.status);
          if (sortCol === 'match') return `${b.player1} vs ${b.player2}`;
          if (sortCol === 'result') return `${b.player1Score ?? 0}:${b.player2Score ?? 0}`;
          return '';
        })();
        // Special: status priority
        if (sortCol === 'status') {
          const order: Record<string, number> = { live: 0, planned: 1, finished: 2, cancelled: 3 };
          const cmp2 = (order[a.status] ?? 99) - (order[b.status] ?? 99);
          return sortDir === 'asc' ? cmp2 : -cmp2;
        }
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  }, [schedule, filters, sortCol, sortDir]);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl text-primary text-glow tracking-widest text-center mb-10">РАСПИСАНИЕ</h1>

        {isAdmin && editMode && (
          <div className="border border-border bg-card p-4 mb-8 box-glow">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Добавить матч</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select className="bg-background border border-border px-3 py-2 text-sm text-foreground" value={form.player1} onChange={(e) => setForm((s) => ({ ...s, player1: e.target.value }))}>
                <option value="">Игрок 1</option>
                {players.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select className="bg-background border border-border px-3 py-2 text-sm text-foreground" value={form.player2} onChange={(e) => setForm((s) => ({ ...s, player2: e.target.value }))}>
                <option value="">Игрок 2</option>
                {players.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select className="bg-background border border-border px-3 py-2 text-sm text-foreground" value={form.format} onChange={(e) => setForm((s) => ({ ...s, format: e.target.value as any }))}>
                <option value="Bo3">Bo3</option>
                <option value="Bo5">Bo5</option>
              </select>
              <input className="bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Время" value={form.time} onChange={(e) => setForm((s) => ({ ...s, time: e.target.value }))} />
              <input className="bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Дата" value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} />
              <input className="bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Раунд" value={form.round} onChange={(e) => setForm((s) => ({ ...s, round: e.target.value }))} />
              <input className="bg-background border border-border px-3 py-2 text-sm text-foreground sm:col-span-2" placeholder="Трансляция (https://...)" value={form.streamUrl} onChange={(e) => setForm((s) => ({ ...s, streamUrl: e.target.value }))} />
              <select className="bg-background border border-border px-3 py-2 text-sm text-foreground" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as any }))}>
                <option value="planned">Запланировано</option>
                <option value="live">LIVE</option>
                <option value="finished">Завершён</option>
                <option value="cancelled">Отменён</option>
              </select>
              <div className="grid grid-cols-2 gap-2 col-span-1 sm:col-span-2">
                <input
                  type="number"
                  min={0}
                  className="bg-background border border-border px-3 py-2 text-sm text-foreground"
                  placeholder="Счёт игрок 1"
                  value={form.player1Score}
                  onChange={(e) => setForm((s) => ({ ...s, player1Score: Number(e.target.value) || 0 }))}
                />
                <input
                  type="number"
                  min={0}
                  className="bg-background border border-border px-3 py-2 text-sm text-foreground"
                  placeholder="Счёт игрок 2"
                  value={form.player2Score}
                  onChange={(e) => setForm((s) => ({ ...s, player2Score: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                disabled={!canAdd}
                onClick={() => {
                  if (!canAdd) return;
                  addMatch({
                    id: Date.now().toString(),
                    player1: form.player1.trim(),
                    player2: form.player2.trim(),
                    format: form.format,
                    time: form.time.trim(),
                    date: form.date.trim(),
                    round: form.round.trim(),
                    status: form.status,
                    player1Score: form.player1Score,
                    player2Score: form.player2Score,
                    score: `${form.player1Score}:${form.player2Score}`,
                    streamUrl: form.streamUrl.trim(),
                  } as any);
                  setForm({ player1: '', player2: '', format: 'Bo3', time: '18:00', date: '', round: '', streamUrl: '', status: 'planned', player1Score: 0, player2Score: 0 });
                }}
                className="flex items-center gap-2 px-3 py-2 border border-primary text-primary text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} /> Добавить
              </button>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <input
              type="text"
              placeholder="Поиск игрока/раунда..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              className="flex-1 min-w-[180px] max-w-xs bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button onClick={resetFilters} className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
                  <FilterX size={13} /> Сбросить
                </button>
              )}
              <button
                onClick={() => setShowFilters((p) => !p)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-heading rounded-lg border transition-all ${showFilters || hasActiveFilters ? 'bg-primary/10 border-primary/50 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
              >
                <Filter size={14} /> Фильтры
                {hasActiveFilters && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                    {[filters.format, filters.status, filters.search].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="glass-card rounded-xl p-4 flex flex-wrap gap-4 items-end">
                  <FilterDropdown
                    label="Формат"
                    value={filters.format}
                    options={[
                      { value: '', label: 'Все форматы' },
                      { value: 'Bo3', label: 'Bo3' },
                      { value: 'Bo5', label: 'Bo5' },
                    ]}
                    onChange={(v) => setFilters((p) => ({ ...p, format: v as any }))}
                  />
                  <FilterDropdown
                    label="Статус"
                    value={filters.status}
                    options={[
                      { value: '', label: 'Все статусы' },
                      { value: 'planned', label: 'Запланировано' },
                      { value: 'live', label: 'LIVE' },
                      { value: 'finished', label: 'Завершён' },
                      { value: 'cancelled', label: 'Отменён' },
                    ]}
                    onChange={(v) => setFilters((p) => ({ ...p, status: v as any }))}
                  />
                  <span className="text-xs text-muted-foreground pb-2">Найдено: <span className="text-foreground font-semibold">{processed.length}</span> матчей</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Match detail modal (donor-style card) */}
        <AnimatePresence>
          {selectedMatchId && (() => {
            const m = schedule.find((x) => x.id === selectedMatchId);
            if (!m) return null;
            const p1 = getPlayer(m.player1);
            const p2 = getPlayer(m.player2);
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-6 mb-8 max-w-3xl mx-auto"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-heading text-xl font-bold text-foreground">Подробности матча</h3>
                  <button onClick={() => setSelectedMatchId(null)} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>
                <div className="flex items-center justify-center gap-3 mb-4 text-sm text-muted-foreground flex-wrap">
                  <span>📅 {m.date || '—'}</span>
                  <span>⏰ {m.time || '—'}</span>
                  <span className="text-primary font-heading">{m.format || 'Bo3'}</span>
                  <StatusBadge status={m.status} />
                </div>
                <div className="text-center mb-4">
                  <span className="font-display text-3xl font-bold text-foreground">{m.player1Score ?? 0} - {m.player2Score ?? 0}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {[p1, p2].map((pl, idx) => (
                    <div key={idx} className="bg-background/50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        {pl?.avatar && <img src={pl.avatar} alt="" className="w-12 h-12 rounded-lg object-cover border border-border/60" />}
                        <div>
                          {pl ? (
                            <Link to={`/players/${pl.id}`} className="font-heading font-bold text-foreground text-lg hover:text-primary transition-colors">{pl.name}</Link>
                          ) : (
                            <h4 className="font-heading font-bold text-foreground text-lg">TBD</h4>
                          )}
                          <p className="text-xs text-muted-foreground">{idx === 0 ? 'Игрок 1' : 'Игрок 2'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {m.streamUrl && (
                  <a href={m.streamUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/50 text-primary hover:bg-primary/10 font-heading text-sm">
                    <Tv size={16} /> Смотреть трансляцию <ExternalLink size={14} />
                  </a>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-3 px-4 text-muted-foreground font-heading text-xs uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors text-left" onClick={() => handleSort('date')}>
                  Дата <SortIcon col="date" active={sortCol} dir={sortDir} />
                </th>
                <th className="py-3 px-4 text-muted-foreground font-heading text-xs uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors text-left" onClick={() => handleSort('time')}>
                  Время <SortIcon col="time" active={sortCol} dir={sortDir} />
                </th>
                <th className="py-3 px-4 text-muted-foreground font-heading text-xs uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors text-left" onClick={() => handleSort('match')}>
                  Матч <SortIcon col="match" active={sortCol} dir={sortDir} />
                </th>
                <th className="py-3 px-4 text-muted-foreground font-heading text-xs uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors text-center" onClick={() => handleSort('round')}>
                  Раунд <SortIcon col="round" active={sortCol} dir={sortDir} />
                </th>
                <th className="py-3 px-4 text-muted-foreground font-heading text-xs uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors text-center" onClick={() => handleSort('format')}>
                  Формат <SortIcon col="format" active={sortCol} dir={sortDir} />
                </th>
                <th className="py-3 px-4 text-muted-foreground font-heading text-xs uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors text-center" onClick={() => handleSort('result')}>
                  Результат <SortIcon col="result" active={sortCol} dir={sortDir} />
                </th>
                <th className="py-3 px-4 text-muted-foreground font-heading text-xs uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors text-center" onClick={() => handleSort('status')}>
                  Статус <SortIcon col="status" active={sortCol} dir={sortDir} />
                </th>
                <th className="py-3 px-4 text-muted-foreground font-heading text-xs uppercase tracking-wider text-center">Трансляция</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {processed.map((m, i) => {
                const p1 = getPlayer(m.player1);
                const p2 = getPlayer(m.player2);
                const isCancelled = m.status === 'cancelled';
                const isEditingThis = editingId === m.id;

                if (isEditingThis) {
                  return (
                    <tr key={m.id} className="border-b border-primary/30 bg-primary/5">
                      <td className="py-2 px-4">
                        <input className="bg-background border border-border rounded-lg p-1.5 text-foreground text-xs w-full focus:outline-none focus:border-primary" value={editForm.date} onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))} />
                      </td>
                      <td className="py-2 px-4">
                        <input className="bg-background border border-border rounded-lg p-1.5 text-foreground text-xs w-full focus:outline-none focus:border-primary" value={editForm.time} onChange={(e) => setEditForm((p) => ({ ...p, time: e.target.value }))} />
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          {p1?.avatar && <img src={p1.avatar} alt="" className="w-7 h-7 rounded object-cover border border-border/60" />}
                          <span className="font-heading text-foreground font-semibold">{editForm.player1 || 'TBD'}</span>
                          <span className="text-muted-foreground text-xs">vs</span>
                          {p2?.avatar && <img src={p2.avatar} alt="" className="w-7 h-7 rounded object-cover border border-border/60" />}
                          <span className="font-heading text-foreground font-semibold">{editForm.player2 || 'TBD'}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <input className="bg-background border border-border rounded-lg p-1.5 text-foreground text-xs w-full focus:outline-none focus:border-primary" value={editForm.round} onChange={(e) => setEditForm((p) => ({ ...p, round: e.target.value }))} />
                      </td>
                      <td className="py-2 px-4">
                        <select className="bg-background border border-border rounded-lg p-1.5 text-foreground text-xs w-full focus:outline-none focus:border-primary" value={editForm.format} onChange={(e) => setEditForm((p) => ({ ...p, format: e.target.value as any }))}>
                          <option value="Bo3">Bo3</option>
                          <option value="Bo5">Bo5</option>
                        </select>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <input type="number" min={0} className="w-12 bg-background border rounded p-1 text-center text-foreground text-xs font-bold" value={editForm.player1Score} onChange={(e) => setEditForm((p) => ({ ...p, player1Score: parseInt(e.target.value) || 0 }))} />
                          <span className="text-muted-foreground">:</span>
                          <input type="number" min={0} className="w-12 bg-background border rounded p-1 text-center text-foreground text-xs font-bold" value={editForm.player2Score} onChange={(e) => setEditForm((p) => ({ ...p, player2Score: parseInt(e.target.value) || 0 }))} />
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <select className="bg-background border border-border rounded-lg p-1.5 text-foreground text-xs w-full focus:outline-none focus:border-primary" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as any }))}>
                          <option value="planned">Запланировано</option>
                          <option value="live">LIVE</option>
                          <option value="finished">Завершён</option>
                          <option value="cancelled">Отменён</option>
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <input placeholder="Twitch/YouTube" className="bg-background border border-border rounded-lg p-1.5 text-foreground text-xs w-full focus:outline-none focus:border-primary" value={editForm.streamUrl} onChange={(e) => setEditForm((p) => ({ ...p, streamUrl: e.target.value }))} />
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-1 justify-center">
                          <button onClick={saveEdit} className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="Сохранить"><Check size={14} /></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors" title="Отмена"><X size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b border-border/40 transition-colors ${isCancelled ? 'bg-muted/5 opacity-50 hover:opacity-70' : 'hover:bg-muted/20'}`}
                  >
                    <td className={`py-3 px-4 text-foreground whitespace-nowrap ${isCancelled ? 'line-through text-muted-foreground' : ''}`}>{m.date || '—'}</td>
                    <td className={`py-3 px-4 text-foreground whitespace-nowrap ${isCancelled ? 'line-through text-muted-foreground' : ''}`}>{m.time || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {p1?.avatar && <img src={p1.avatar} alt="" className="w-7 h-7 rounded object-cover border border-border/60" />}
                        <span className={`font-heading font-semibold text-foreground ${isCancelled ? 'line-through text-muted-foreground' : ''}`}>{m.player1 || 'TBD'}</span>
                        <span className="text-muted-foreground text-xs">vs</span>
                        {p2?.avatar && <img src={p2.avatar} alt="" className="w-7 h-7 rounded object-cover border border-border/60" />}
                        <span className={`font-heading font-semibold text-foreground ${isCancelled ? 'line-through text-muted-foreground' : ''}`}>{m.player2 || 'TBD'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-heading text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md whitespace-nowrap">{m.round || '—'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs font-heading font-bold px-2 py-0.5 rounded-md ${isCancelled ? 'text-muted-foreground bg-muted/30' : 'text-primary bg-primary/10'}`}>{m.format || 'Bo3'}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-heading font-bold text-foreground">{(m.player1Score ?? 0)} - {(m.player2Score ?? 0)}</td>
                    <td className="py-3 px-4 text-center"><StatusBadge status={m.status} /></td>
                    <td className="py-3 px-4 text-center">
                      {m.streamUrl && !isCancelled ? (
                        <a href={m.streamUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-heading"><Tv size={13} /> Смотреть</a>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setSelectedMatchId(m.id)} className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Подробности"><Info size={14} /></button>
                        {isAdmin && editMode && (
                          <button onClick={() => beginEdit(m.id)} className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Редактировать"><Pencil size={14} /></button>
                        )}
                        {isAdmin && editMode && (
                          <button onClick={() => removeMatch(m.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors" title="Удалить"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {processed.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              {hasActiveFilters ? 'Матчей не найдено — попробуй изменить фильтры' : 'Матчей пока нет'}
            </div>
          )}
        </div>
        {processed.length > 0 && (
          <p className="text-xs text-muted-foreground text-right mt-3">Показано {processed.length} матчей</p>
        )}
      </div>
    </div>
  );
};

export default Schedule;
