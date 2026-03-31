import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';

const Bracket = () => {
  const { bracket, isAdmin, editMode, addBracketMatch, removeBracketMatch, updateBracketMatch } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ player1: '', player2: '', winner: '', score: '' });

  const rounds = [...new Set(bracket.map((m) => m.round))].sort((a, b) => a - b);
  const roundNames: Record<number, string> = { 1: 'Четвертьфинал', 2: 'Полуфинал', 3: 'Финал' };

  const handleAddEmpty = (round: number) => {
    const matchesInRound = bracket.filter((m) => m.round === round);
    const nextPos = matchesInRound.length > 0 ? Math.max(...matchesInRound.map((m) => m.position)) + 1 : 0;
    addBracketMatch({ id: `b-${Date.now()}`, round, position: nextPos });
  };

  const handleAddRound = () => {
    const nextRound = rounds.length > 0 ? Math.max(...rounds) + 1 : 1;
    addBracketMatch({ id: `b-${Date.now()}`, round: nextRound, position: 0 });
  };

  const startEdit = (m: typeof bracket[0]) => {
    setEditingId(m.id);
    setForm({ player1: m.player1 || '', player2: m.player2 || '', winner: m.winner || '', score: m.score || '' });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateBracketMatch(editingId, {
      player1: form.player1 || undefined,
      player2: form.player2 || undefined,
      winner: form.winner || undefined,
      score: form.score || undefined,
    });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-12">СЕТКА</h1>

        <div className="flex gap-8 overflow-x-auto pb-4 items-start">
          {rounds.map((round, ri) => {
            const matches = bracket.filter((m) => m.round === round).sort((a, b) => a.position - b.position);
            return (
              <div key={round} className="flex-shrink-0 w-60">
                <p className="text-xs text-muted-foreground uppercase tracking-widest text-center mb-6 font-display">
                  {roundNames[round] || `Раунд ${round}`}
                </p>
                <div className="space-y-4" style={{ paddingTop: ri * 40 }}>
                  {matches.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="border border-border bg-card relative group"
                    >
                      {editingId === m.id ? (
                        <div className="p-3 space-y-2">
                          <input className="w-full bg-background border border-border px-2 py-1 text-xs text-foreground" placeholder="Игрок 1" value={form.player1} onChange={(e) => setForm({ ...form, player1: e.target.value })} />
                          <input className="w-full bg-background border border-border px-2 py-1 text-xs text-foreground" placeholder="Игрок 2" value={form.player2} onChange={(e) => setForm({ ...form, player2: e.target.value })} />
                          <input className="w-full bg-background border border-border px-2 py-1 text-xs text-foreground" placeholder="Победитель" value={form.winner} onChange={(e) => setForm({ ...form, winner: e.target.value })} />
                          <input className="w-full bg-background border border-border px-2 py-1 text-xs text-foreground" placeholder="Счёт (2-1)" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="px-2 py-1 border border-primary text-primary text-xs hover:bg-primary/10">Ок</button>
                            <button onClick={() => setEditingId(null)} className="px-2 py-1 border border-border text-muted-foreground text-xs hover:border-primary/50">Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={`px-4 py-2 text-sm flex justify-between border-b border-border/50 ${m.winner === m.player1 ? 'text-primary' : 'text-foreground'}`}>
                            <span>{m.player1 || '—'}</span>
                            {m.score && <span className="text-xs text-muted-foreground">{m.score?.split('-')[0]}</span>}
                          </div>
                          <div className={`px-4 py-2 text-sm flex justify-between ${m.winner === m.player2 ? 'text-primary' : 'text-foreground'}`}>
                            <span>{m.player2 || '—'}</span>
                            {m.score && <span className="text-xs text-muted-foreground">{m.score?.split('-')[1]}</span>}
                          </div>
                          {isAdmin && editMode && (
                            <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(m)} className="w-6 h-6 bg-card border border-primary text-primary flex items-center justify-center">
                                <Pencil size={10} />
                              </button>
                              <button onClick={() => removeBracketMatch(m.id)} className="w-6 h-6 bg-card border border-destructive text-destructive flex items-center justify-center">
                                <Trash2 size={10} />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  ))}
                  {isAdmin && editMode && (
                    <button
                      onClick={() => handleAddEmpty(round)}
                      className="w-full border border-dashed border-border text-muted-foreground text-xs py-3 hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus size={12} /> Добавить слот
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {isAdmin && editMode && (
            <div className="flex-shrink-0 w-60 flex items-start justify-center pt-8">
              <button
                onClick={handleAddRound}
                className="border border-dashed border-border text-muted-foreground text-xs px-6 py-4 hover:border-primary/50 hover:text-primary transition-colors flex items-center gap-2"
              >
                <Plus size={14} /> Новый раунд
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bracket;
