import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Clock, Radio, CheckCircle, Ban } from 'lucide-react';
import { parseScore } from '@/lib/score';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

const statusConfig = {
  planned: { icon: <Clock size={14} />, label: 'Запланировано', cls: 'text-muted-foreground' },
  live: { icon: <Radio size={14} />, label: 'LIVE', cls: 'text-primary animate-flicker' },
  finished: { icon: <CheckCircle size={14} />, label: 'Завершён', cls: 'text-muted-foreground/50' },
  cancelled: { icon: <Ban size={14} />, label: 'Отменён', cls: 'text-destructive' },
};

const Schedule = () => {
  const { schedule, players, isAdmin, editMode, addMatch, removeMatch } = useStore();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dateAsc' | 'dateDesc' | 'status'>('dateAsc');
  const [form, setForm] = useState({
    player1: '',
    player2: '',
    time: '18:00',
    date: '',
    round: '',
    streamUrl: '',
    status: 'planned' as 'planned' | 'live' | 'finished' | 'cancelled',
    player1Score: 0,
    player2Score: 0,
  });

  const canAdd = isAdmin && editMode && form.player1.trim() && form.player2.trim();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-12">РАСПИСАНИЕ</h1>

        {isAdmin && editMode && (
          <div className="border border-border bg-card p-4 mb-8 box-glow">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Добавить матч</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                list="players-list-schedule"
                className="bg-background border border-border px-3 py-2 text-sm text-foreground"
                placeholder="Игрок 1 (или впиши)"
                value={form.player1}
                onChange={(e) => setForm((s) => ({ ...s, player1: e.target.value }))}
              />
              <input
                list="players-list-schedule"
                className="bg-background border border-border px-3 py-2 text-sm text-foreground"
                placeholder="Игрок 2 (или впиши)"
                value={form.player2}
                onChange={(e) => setForm((s) => ({ ...s, player2: e.target.value }))}
              />
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
                    time: form.time.trim(),
                    date: form.date.trim(),
                    round: form.round.trim(),
                    status: form.status,
                    player1Score: form.player1Score,
                    player2Score: form.player2Score,
                    score: `${form.player1Score}:${form.player2Score}`,
                    streamUrl: form.streamUrl.trim(),
                  } as any);
                  setForm({ player1: '', player2: '', time: '18:00', date: '', round: '', streamUrl: '', status: 'planned', player1Score: 0, player2Score: 0 });
                }}
                className="flex items-center gap-2 px-3 py-2 border border-primary text-primary text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} /> Добавить
              </button>
            </div>
            <datalist id="players-list-schedule">
              {players.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>
        )}

        <div className="mb-4 flex justify-end">
          <select className="border border-border bg-background px-3 py-2 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="dateAsc">Сортировка: дата по возрастанию</option>
            <option value="dateDesc">Сортировка: дата по убыванию</option>
            <option value="status">Сортировка: статус</option>
          </select>
        </div>

        <div className="space-y-4">
          {[...schedule]
            .sort((a, b) => {
              if (sortBy === 'dateAsc') return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
              if (sortBy === 'dateDesc') return `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`);
              return a.status.localeCompare(b.status);
            })
            .map((m, i) => {
            const sc = statusConfig[m.status];
            const parsed = parseScore(m.score);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className={`border bg-card p-4 flex items-center justify-between cursor-pointer ${m.status === 'live' ? 'border-primary box-glow' : 'border-border'}`}
                onClick={() => setSelectedMatchId(m.id)}
              >
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground/50 font-display tracking-widest mb-1">{m.round}</p>
                  <p className="text-sm text-foreground">
                    <span className={parsed && parsed.a > parsed.b ? 'text-primary' : ''}>{m.player1}</span>
                    <span className="text-muted-foreground mx-2">vs</span>
                    <span className={parsed && parsed.b > parsed.a ? 'text-primary' : ''}>{m.player2}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{m.date} — {m.time}</p>
                  {m.streamUrl && (
                    <a href={m.streamUrl} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline">
                      Трансляция
                    </a>
                  )}
                  <div className={`flex items-center gap-1 text-xs mt-1 justify-end ${sc.cls}`}>
                    {sc.icon} {sc.label}
                    {m.score && <span className="ml-2 text-foreground font-display">{m.score}</span>}
                  </div>
                  {isAdmin && editMode && (
                    <button className="mt-2 text-destructive" onClick={() => removeMatch(m.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        <Dialog open={Boolean(selectedMatchId)} onOpenChange={(open) => !open && setSelectedMatchId(null)}>
          <DialogContent>
            {selectedMatchId && (() => {
              const m = schedule.find((s) => s.id === selectedMatchId);
              if (!m) return null;
              const p1 = players.find((p) => p.name === m.player1);
              const p2 = players.find((p) => p.name === m.player2);
              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{m.player1} vs {m.player2}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      {p1?.avatar && <img src={p1.avatar} alt={p1.name} className="w-20 h-20 object-cover border border-border mx-auto mb-2" />}
                      {p1 ? <Link to={`/players/${p1.id}`} className="text-primary hover:underline">{p1.name}</Link> : <p>{m.player1}</p>}
                    </div>
                    <div className="text-center">
                      {p2?.avatar && <img src={p2.avatar} alt={p2.name} className="w-20 h-20 object-cover border border-border mx-auto mb-2" />}
                      {p2 ? <Link to={`/players/${p2.id}`} className="text-primary hover:underline">{p2.name}</Link> : <p>{m.player2}</p>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{m.round} · {m.date} · {m.time}</p>
                  <p className="text-sm">Счёт: {m.player1Score ?? 0}:{m.player2Score ?? 0}</p>
                  <p className="text-sm">Статус: {statusConfig[m.status]?.label || m.status}</p>
                  {m.streamUrl ? (
                    <a href={m.streamUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Открыть трансляцию</a>
                  ) : (
                    <p className="text-sm text-muted-foreground">Трансляция: не указана</p>
                  )}
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Schedule;
