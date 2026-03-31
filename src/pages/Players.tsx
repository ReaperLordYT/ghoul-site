import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { Skull, Crown, XCircle, Plus, Trash2, Link2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const statusIcon = {
  winner: <Crown size={16} className="text-primary" />,
  active: <Skull size={16} className="text-foreground" />,
  eliminated: <XCircle size={16} className="text-muted-foreground" />,
};

const Players = () => {
  const { players, schedule, isAdmin, editMode, addPlayer, updatePlayer, removePlayer } = useStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState({ name: "", mmr: "", dotabuffUrl: "", steamUrl: "" });
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) || null;
  const playerMatches = selectedPlayer
    ? schedule.filter((m) => m.player1 === selectedPlayer.name || m.player2 === selectedPlayer.name)
    : [];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-2">ИГРОКИ</h1>
        <p className="text-center text-muted-foreground text-sm mb-12">только достойные</p>

        {isAdmin && editMode && (
          <div className="border border-border bg-card p-4 mb-6 box-glow">
            <p className="text-xs text-muted-foreground uppercase mb-3">Редактирование игроков</p>
            <div className="grid md:grid-cols-4 gap-2">
              <input className="border border-border bg-background px-2 py-2 text-sm" placeholder="Ник" value={newPlayer.name} onChange={(e) => setNewPlayer((s) => ({ ...s, name: e.target.value }))} />
              <input className="border border-border bg-background px-2 py-2 text-sm" placeholder="MMR" value={newPlayer.mmr} onChange={(e) => setNewPlayer((s) => ({ ...s, mmr: e.target.value }))} />
              <input className="border border-border bg-background px-2 py-2 text-sm" placeholder="Dotabuff URL" value={newPlayer.dotabuffUrl} onChange={(e) => setNewPlayer((s) => ({ ...s, dotabuffUrl: e.target.value }))} />
              <input className="border border-border bg-background px-2 py-2 text-sm" placeholder="Steam URL" value={newPlayer.steamUrl} onChange={(e) => setNewPlayer((s) => ({ ...s, steamUrl: e.target.value }))} />
            </div>
            <button
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 border border-primary text-primary text-xs"
              onClick={() => {
                if (!newPlayer.name.trim()) return;
                addPlayer({
                  id: Date.now().toString(),
                  name: newPlayer.name.trim(),
                  mmr: Number(newPlayer.mmr) || undefined,
                  dotabuffUrl: newPlayer.dotabuffUrl.trim(),
                  steamUrl: newPlayer.steamUrl.trim(),
                  status: "active",
                  matches: [],
                });
                setNewPlayer({ name: "", mmr: "", dotabuffUrl: "", steamUrl: "" });
              }}
            >
              <Plus size={14} /> Добавить игрока
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {players.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className={`border bg-card p-5 relative overflow-hidden group transition-colors hover:border-primary/50 cursor-pointer ${
                p.status === 'winner' ? 'border-primary box-glow' : p.status === 'eliminated' ? 'border-border/30 opacity-60' : 'border-border'
              }`}
              onClick={() => setSelectedPlayerId(p.id)}
            >
              {p.avatar && (
                <div className="w-full aspect-square mb-3 border border-border overflow-hidden">
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                {statusIcon[p.status]}
                <span className="font-heading text-foreground">{p.name}</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {p.mmr && <p>MMR: <span className="text-foreground">{p.mmr}</span></p>}
                <p>Статус: <span className={p.status === 'winner' ? 'text-primary' : p.status === 'eliminated' ? 'text-destructive' : 'text-foreground'}>{
                  p.status === 'winner' ? 'Победитель' : p.status === 'eliminated' ? 'Выбыл' : 'Активен'
                }</span></p>
              </div>
              <div className="mt-3 flex gap-2">
                {p.dotabuffUrl && (
                  <a href={p.dotabuffUrl} target="_blank" rel="noreferrer" className="text-xs border border-border px-2 py-1 hover:border-primary/50">
                    Dotabuff
                  </a>
                )}
                {p.steamUrl && (
                  <a href={p.steamUrl} target="_blank" rel="noreferrer" className="text-xs border border-border px-2 py-1 hover:border-primary/50">
                    Steam
                  </a>
                )}
              </div>
              {isAdmin && editMode && (
                <div className="mt-3 pt-3 border-t border-border/60 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <input className="w-full border border-border bg-background px-2 py-1 text-xs" value={p.name} onChange={(e) => updatePlayer(p.id, { name: e.target.value })} />
                  <input className="w-full border border-border bg-background px-2 py-1 text-xs" placeholder="MMR" value={p.mmr || ""} onChange={(e) => updatePlayer(p.id, { mmr: Number(e.target.value) || undefined })} />
                  <input className="w-full border border-border bg-background px-2 py-1 text-xs" placeholder="Dotabuff URL" value={p.dotabuffUrl || ""} onChange={(e) => updatePlayer(p.id, { dotabuffUrl: e.target.value })} />
                  <input className="w-full border border-border bg-background px-2 py-1 text-xs" placeholder="Steam URL" value={p.steamUrl || ""} onChange={(e) => updatePlayer(p.id, { steamUrl: e.target.value })} />
                  <div className="flex items-center justify-between">
                    <select className="border border-border bg-background px-2 py-1 text-xs" value={p.status} onChange={(e) => updatePlayer(p.id, { status: e.target.value as typeof p.status })}>
                      <option value="active">Активен</option>
                      <option value="eliminated">Выбыл</option>
                      <option value="winner">Победитель</option>
                    </select>
                    <button className="text-destructive" onClick={() => removePlayer(p.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
              {p.matches.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-1">Матчи</p>
                  {p.matches.map((m, j) => (
                    <p key={j} className={`text-xs ${m.result === 'win' ? 'text-primary' : 'text-muted-foreground'}`}>
                      vs {m.opponent} — {m.score} ({m.result === 'win' ? 'W' : 'L'})
                    </p>
                  ))}
                </div>
              )}
              {p.status === 'winner' && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/20 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={Boolean(selectedPlayer)} onOpenChange={(open) => !open && setSelectedPlayerId(null)}>
        <DialogContent className="max-w-2xl border-border bg-card">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display tracking-widest text-primary text-glow">
                  {selectedPlayer.name}
                </DialogTitle>
                <DialogDescription>
                  Подробная карточка игрока: предстоящие, LIVE, завершенные и отмененные матчи.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <p className="text-muted-foreground">MMR: <span className="text-foreground">{selectedPlayer.mmr || '—'}</span></p>
                <p className="text-muted-foreground">Dotabuff: <span className="text-foreground">{selectedPlayer.dotabuffUrl ? "добавлен" : "—"}</span></p>
                <p className="text-muted-foreground">Steam: <span className="text-foreground">{selectedPlayer.steamUrl ? "добавлен" : "—"}</span></p>
              </div>
              <div className="flex gap-2">
                {selectedPlayer.dotabuffUrl && (
                  <a href={selectedPlayer.dotabuffUrl} target="_blank" rel="noreferrer" className="inline-flex text-xs border border-border px-2 py-1">
                    <Link2 size={12} className="mr-1" /> Dotabuff
                  </a>
                )}
                {selectedPlayer.steamUrl && (
                  <a href={selectedPlayer.steamUrl} target="_blank" rel="noreferrer" className="inline-flex text-xs border border-border px-2 py-1">
                    <Link2 size={12} className="mr-1" /> Steam
                  </a>
                )}
              </div>

              <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-2">
                {playerMatches.length === 0 && (
                  <p className="text-sm text-muted-foreground">Матчи для этого игрока пока не добавлены.</p>
                )}
                {playerMatches.map((match) => (
                  <div key={match.id} className="border border-border p-3 text-sm">
                    <p className="text-foreground">
                      {match.player1} <span className="text-muted-foreground">vs</span> {match.player2}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{match.round} • {match.date} • {match.time}</p>
                    <div className="mt-1 text-xs">
                      <span className={
                        match.status === 'live'
                          ? 'text-primary animate-flicker'
                          : match.status === 'finished'
                            ? 'text-foreground'
                            : match.status === 'cancelled'
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                      }>
                        {match.status === 'upcoming' && 'Скоро'}
                        {match.status === 'live' && 'LIVE'}
                        {match.status === 'finished' && 'Завершен'}
                        {match.status === 'cancelled' && 'Отменен'}
                      </span>
                      {match.score && <span className="ml-2 text-foreground font-display">{match.score}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Players;
