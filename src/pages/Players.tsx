import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { Skull, Crown, XCircle, Plus, Trash2, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
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
  active: "text-emerald-500",
  winner: "text-primary",
  review: "text-amber-500",
  disqualified: "text-destructive",
  rejected: "text-red-500",
  left: "text-slate-500",
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPlayers.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className={`border bg-card p-5 relative overflow-hidden group transition-colors hover:border-primary/50 cursor-pointer ${
                p.status === 'winner' ? 'border-primary box-glow' : ['disqualified', 'rejected', 'left'].includes(p.status) ? 'border-border/30 opacity-60' : 'border-border'
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
                <p>Статус: <span className={statusClass[p.status] || 'text-foreground'}>{
                statusLabel[p.status] || p.status
                }</span></p>
                {p.statusReason && <p>Причина: <span className="text-foreground">{p.statusReason}</span></p>}
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
              {p.status === 'winner' && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/20 to-transparent" />
              )}
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
                <DialogDescription>
                  Подробная карточка игрока: предстоящие, LIVE, завершенные и отмененные матчи.
                </DialogDescription>
              </DialogHeader>

              {selectedPlayer.avatar && (
                <img
                  src={selectedPlayer.avatar}
                  alt={selectedPlayer.name}
                  className="w-20 h-20 object-cover border border-border rounded-sm mx-auto"
                />
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <p className="text-muted-foreground">MMR: <span className="text-foreground">{selectedPlayer.mmr || '—'}</span></p>
                <p className="text-muted-foreground">Побед: <span className="text-foreground">{matchStats.wins}</span></p>
                <p className="text-muted-foreground">Поражений: <span className="text-foreground">{matchStats.losses}</span></p>
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
