import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { Skull, Crown, XCircle, Plus, Trash2, Link2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";

const statusIcon = {
  winner: <Crown size={16} className="text-primary" />,
  active: <Skull size={16} className="text-foreground" />,
  review: <Skull size={16} className="text-foreground" />,
  disqualified: <XCircle size={16} className="text-destructive" />,
  rejected: <XCircle size={16} className="text-destructive" />,
  left: <XCircle size={16} className="text-muted-foreground" />,
};

const statusLabel: Record<string, string> = {
  active: "Активен",
  winner: "Победитель",
  review: "На рассмотрении",
  disqualified: "Дисквалифицирован",
  rejected: "Отклонён",
  left: "Покинул",
};

const statusClass: Record<string, string> = {
  active: "text-green-400",
  winner: "text-yellow-300",
  review: "text-sky-400",
  disqualified: "text-red-500",
  rejected: "text-fuchsia-400",
  left: "text-orange-400",
};

const Players = () => {
  const { players, schedule, isAdmin, editMode, addPlayer, updatePlayer, removePlayer } = useStore();
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState({ name: "", mmr: "", dotabuffUrl: "", steamUrl: "" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minMmr, setMinMmr] = useState("");
  const [maxMmr, setMaxMmr] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!playerId) return;
    setSelectedPlayerId(playerId);
  }, [playerId]);
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) || null;
  const playerMatches = selectedPlayer
    ? schedule.filter((m) => m.player1 === selectedPlayer.name || m.player2 === selectedPlayer.name)
    : [];
  const matchStats = selectedPlayer
    ? schedule.reduce(
        (acc, m) => {
          if (!(m.player1 === selectedPlayer.name || m.player2 === selectedPlayer.name)) return acc;
          const a = m.player1Score ?? Number((m.score || "0:0").split(":")[0] || 0);
          const b = m.player2Score ?? Number((m.score || "0:0").split(":")[1] || 0);
          const isP1 = m.player1 === selectedPlayer.name;
          const win = isP1 ? a > b : b > a;
          const loss = isP1 ? a < b : b < a;
          if (win) acc.wins += 1;
          if (loss) acc.losses += 1;
          return acc;
        },
        { wins: 0, losses: 0 },
      )
    : { wins: 0, losses: 0 };

  const statsByPlayer = useMemo(() => {
    const map = new Map<string, { wins: number; losses: number }>();
    players.forEach((p) => map.set(p.name, { wins: 0, losses: 0 }));
    schedule.forEach((m) => {
      const a = m.player1Score ?? Number((m.score || "0:0").split(":")[0] || 0);
      const b = m.player2Score ?? Number((m.score || "0:0").split(":")[1] || 0);
      if (!m.player1 || !m.player2) return;
      const p1 = map.get(m.player1);
      const p2 = map.get(m.player2);
      if (!p1 || !p2) return;
      if (a > b) { p1.wins += 1; p2.losses += 1; }
      if (b > a) { p2.wins += 1; p1.losses += 1; }
    });
    return map;
  }, [players, schedule]);
  const filteredPlayers = players.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (minMmr && (p.mmr || 0) < Number(minMmr)) return false;
    if (maxMmr && (p.mmr || 0) > Number(maxMmr)) return false;
    return true;
  });

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-2">ИГРОКИ</h1>
        <p className="text-center text-muted-foreground text-sm mb-12">только достойные</p>
        <div className="grid md:grid-cols-4 gap-2 mb-6">
          <input className="border border-border bg-background px-2 py-2 text-sm" placeholder="Поиск по нику" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input type="number" className="border border-border bg-background px-2 py-2 text-sm" placeholder="MMR от" value={minMmr} onChange={(e) => setMinMmr(e.target.value)} />
          <input type="number" className="border border-border bg-background px-2 py-2 text-sm" placeholder="MMR до" value={maxMmr} onChange={(e) => setMaxMmr(e.target.value)} />
          <select className="border border-border bg-background px-2 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Все статусы</option>
            {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="mb-6 flex items-center justify-end gap-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-md border border-border bg-card hover:border-primary/50 hover:text-primary transition-colors"
            onClick={() => setHelpOpen(true)}
            aria-label="Справка по статусам"
          >
            <span className="font-display">?</span>
          </button>
        </div>

        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <DialogContent className="max-w-xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-display tracking-widest text-primary text-glow">Справка по статусам</DialogTitle>
              <DialogDescription>Ниже — что означает каждый статус игрока.</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              {Object.entries(statusLabel).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className={`font-display text-xs ${statusClass[key] || "text-foreground"}`}>{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {key === "active" && "участвует сейчас"}
                    {key === "winner" && "завершил турнир в топе"}
                    {key === "review" && "заявка на рассмотрении"}
                    {key === "disqualified" && "дисквалифицирован решением администрации"}
                    {key === "rejected" && "заявка отклонена"}
                    {key === "left" && "покинул турнир"}
                  </span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="relative"
              onClick={() => setSelectedPlayerId(p.id)}
            >
              <div className={`glass-card rounded-xl p-6 card-glow group cursor-pointer ${['disqualified', 'rejected', 'left'].includes(p.status) ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4 mb-4">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-border/60" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center font-display text-2xl text-muted-foreground border border-border/40">
                      {p.name?.[0] || "?"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                      {p.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">MMR: <span className="text-foreground font-heading font-semibold">{p.mmr || "—"}</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-heading ${p.status === 'active' ? 'bg-green-500/20 text-green-400' : p.status === 'review' ? 'bg-sky-500/20 text-sky-300' : p.status === 'winner' ? 'bg-yellow-500/20 text-yellow-300' : p.status === 'rejected' ? 'bg-fuchsia-500/20 text-fuchsia-300' : p.status === 'disqualified' ? 'bg-rose-500/20 text-rose-400' : 'bg-orange-500/20 text-orange-300'}`}>
                    {statusLabel[p.status] || p.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    W <span className="text-green-400 font-heading font-semibold">{statsByPlayer.get(p.name)?.wins ?? 0}</span> /
                    L <span className="text-rose-400 font-heading font-semibold">{statsByPlayer.get(p.name)?.losses ?? 0}</span>
                  </span>
                </div>

                {p.statusReason && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Причина: <span className="text-foreground">{p.statusReason}</span>
                  </p>
                )}

                <div className="mt-4 flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  {p.dotabuffUrl && (
                    <a href={p.dotabuffUrl} target="_blank" rel="noreferrer" className="text-xs border border-border/60 px-2 py-1 rounded-lg hover:border-primary/50">
                      Dotabuff
                    </a>
                  )}
                  {p.steamUrl && (
                    <a href={p.steamUrl} target="_blank" rel="noreferrer" className="text-xs border border-border/60 px-2 py-1 rounded-lg hover:border-primary/50">
                      Steam
                    </a>
                  )}
                </div>
              </div>
              {isAdmin && editMode && (
                <div className="mt-3 pt-3 border-t border-border/60 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.name} className="w-10 h-10 object-cover border border-border" />
                    ) : (
                      <div className="w-10 h-10 border border-border flex items-center justify-center text-[10px] text-muted-foreground">no ava</div>
                    )}
                    <label className="text-xs border border-border px-2 py-1">
                      Ава
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => updatePlayer(p.id, { avatar: reader.result as string });
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <button className="text-xs border border-destructive text-destructive px-2 py-1" onClick={() => updatePlayer(p.id, { avatar: undefined })}>
                      Удалить
                    </button>
                  </div>
                  <input className="w-full border border-border bg-background px-2 py-1 text-xs" value={p.name} onChange={(e) => updatePlayer(p.id, { name: e.target.value })} />
                  <input className="w-full border border-border bg-background px-2 py-1 text-xs" placeholder="MMR" value={p.mmr || ""} onChange={(e) => updatePlayer(p.id, { mmr: Number(e.target.value) || undefined })} />
                  <input className="w-full border border-border bg-background px-2 py-1 text-xs" placeholder="Dotabuff URL" value={p.dotabuffUrl || ""} onChange={(e) => updatePlayer(p.id, { dotabuffUrl: e.target.value })} />
                  <input className="w-full border border-border bg-background px-2 py-1 text-xs" placeholder="Steam URL" value={p.steamUrl || ""} onChange={(e) => updatePlayer(p.id, { steamUrl: e.target.value })} />
                  <div className="flex items-center justify-between">
                    <select className="border border-border bg-background px-2 py-1 text-xs" value={p.status} onChange={(e) => updatePlayer(p.id, { status: e.target.value as typeof p.status })}>
                      <option value="active">Активен</option>
                      <option value="review">На рассмотрении</option>
                      <option value="disqualified">Дисквалифицирован</option>
                      <option value="rejected">Отклонён</option>
                      <option value="left">Покинул</option>
                      <option value="winner">Победитель</option>
                    </select>
                    <button className="text-destructive" onClick={() => removePlayer(p.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <input className="w-full border border-border bg-background px-2 py-1 text-xs" placeholder="Причина статуса (если нужно)" value={p.statusReason || ""} onChange={(e) => updatePlayer(p.id, { statusReason: e.target.value })} />
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
              {p.status === 'winner' && <div className="absolute top-2 right-2">{statusIcon.winner}</div>}
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog
        open={Boolean(selectedPlayer)}
        onOpenChange={(open) => {
          if (open) return;
          setSelectedPlayerId(null);
          navigate("/players", { replace: true });
        }}
      >
        <DialogContent className="max-w-2xl border-border bg-card">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display tracking-widest text-primary text-glow">
                  {selectedPlayer.name}
                </DialogTitle>
                <DialogDescription>Профиль игрока.</DialogDescription>
              </DialogHeader>

              {selectedPlayer.avatar && (
                <img
                  src={selectedPlayer.avatar}
                  alt={selectedPlayer.name}
                  className="w-20 h-20 object-cover border border-border rounded-sm mx-auto"
                />
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="border border-border/60 rounded-xl p-3 text-center bg-background/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">MMR</p>
                  <p className="font-display text-xl text-foreground">{selectedPlayer.mmr || "—"}</p>
                </div>
                <div className="border border-border/60 rounded-xl p-3 text-center bg-green-500/10">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Победы</p>
                  <p className="font-display text-xl text-green-400">{matchStats.wins}</p>
                </div>
                <div className="border border-border/60 rounded-xl p-3 text-center bg-rose-500/10">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Поражения</p>
                  <p className="font-display text-xl text-rose-400">{matchStats.losses}</p>
                </div>
                <div className="border border-border/60 rounded-xl p-3 text-center bg-background/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Статус</p>
                  <p className={`font-heading text-sm ${statusClass[selectedPlayer.status] || "text-foreground"}`}>{statusLabel[selectedPlayer.status] || selectedPlayer.status}</p>
                </div>
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
                        {match.status === 'planned' && 'Запланировано'}
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
