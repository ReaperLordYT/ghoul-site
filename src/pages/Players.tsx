import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Skull, Crown, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statusIcon = {
  winner: <Crown size={16} className="text-primary" />,
  active: <Skull size={16} className="text-foreground" />,
  eliminated: <XCircle size={16} className="text-muted-foreground" />,
};

const Players = () => {
  const { players, schedule } = useStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) || null;
  const playerMatches = selectedPlayer
    ? schedule.filter((m) => m.player1 === selectedPlayer.name || m.player2 === selectedPlayer.name)
    : [];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-2">ИГРОКИ</h1>
        <p className="text-center text-muted-foreground text-sm mb-12">только достойные</p>

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
                {p.rank && <p>Ранг: <span className="text-foreground">{p.rank}</span></p>}
                {p.mmr && <p>MMR: <span className="text-foreground">{p.mmr}</span></p>}
                <p>Статус: <span className={p.status === 'winner' ? 'text-primary' : p.status === 'eliminated' ? 'text-destructive' : 'text-foreground'}>{
                  p.status === 'winner' ? 'Победитель' : p.status === 'eliminated' ? 'Выбыл' : 'Активен'
                }</span></p>
              </div>
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
                <p className="text-muted-foreground">Ранг: <span className="text-foreground">{selectedPlayer.rank || '—'}</span></p>
                <p className="text-muted-foreground">MMR: <span className="text-foreground">{selectedPlayer.mmr || '—'}</span></p>
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
