import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { Check, ExternalLink, Link as LinkIcon, Link2, Pencil, Plus, Radio, RefreshCw, Trash2, Tv, Type, X } from "lucide-react";
import { Link } from "react-router-dom";

const statusLabel = (s?: string) => {
  if (s === "live") return "LIVE";
  if (s === "finished") return "Завершён";
  if (s === "cancelled") return "Отменён";
  return "Запланировано";
};

const Bracket = () => {
  const store = useStore();
  const { bracket, schedule, players, isAdmin, editMode, addMatch, addBracketMatch, removeBracketMatch, updateBracketMatch, bracketCanvas, bracketRoundTitles, setBracketRoundTitle, updateBracketCanvas, upsertCanvasNode, removeCanvasNode, upsertCanvasEdge, removeCanvasEdge } = store;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [form, setForm] = useState({ player1: "", player2: "", status: "planned" as "planned" | "live" | "finished" | "cancelled", player1Score: 0, player2Score: 0 });
  const [edgeModeFrom, setEdgeModeFrom] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const nodeMap = useMemo(() => Object.fromEntries(bracketCanvas.nodes.map((n) => [n.id, n])), [bracketCanvas.nodes]);
  const rounds = [...new Set(bracket.map((m) => m.round))].sort((a, b) => a - b);

  // Donor-style canvas editor state
  const [connectMode, setConnectMode] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const panStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeEdit, setNodeEdit] = useState({
    player1: "TBD",
    player2: "TBD",
    status: "planned" as "planned" | "live" | "finished" | "cancelled",
    round: 1,
    date: "",
    time: "",
    streamUrl: "",
    score1: 0,
    score2: 0,
  });

  const startEdit = (m: (typeof bracket)[number]) => {
    setEditingId(m.id);
    setForm({
      player1: m.player1 || "",
      player2: m.player2 || "",
      status: m.status || "planned",
      player1Score: m.player1Score ?? 0,
      player2Score: m.player2Score ?? 0,
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    const patch = {
      player1: form.player1 || "TBD",
      player2: form.player2 || "TBD",
      status: form.status,
      player1Score: form.player1Score,
      player2Score: form.player2Score,
      score: `${form.player1Score}:${form.player2Score}`,
      winner: form.player1Score === form.player2Score ? undefined : form.player1Score > form.player2Score ? form.player1 || undefined : form.player2 || undefined,
    };
    updateBracketMatch(editingId, patch);
    store.updateMatch(`s-${editingId}`, {
      player1: patch.player1,
      player2: patch.player2,
      status: patch.status,
      player1Score: patch.player1Score,
      player2Score: patch.player2Score,
      score: patch.score,
    });
    setEditingId(null);
  };

  const findScheduleMatch = (p1?: string, p2?: string) =>
    schedule.find(
      (s) =>
        (s.player1 === p1 && s.player2 === p2) ||
        (s.player1 === p2 && s.player2 === p1),
    );

  const ensureScheduleForBracket = (id: string, round: number, player1 = "TBD", player2 = "TBD") => {
    const exists = schedule.some((m) => m.id === `s-${id}`);
    if (exists) return;
    addMatch({
      id: `s-${id}`,
      player1,
      player2,
      time: "18:00",
      date: "",
      round: bracketRoundTitles[round] || `Раунд ${round}`,
      status: "planned",
      player1Score: 0,
      player2Score: 0,
      score: "0:0",
      streamUrl: "",
    });
  };

  const scheduleByNodeId = (nodeId: string) => schedule.find((m) => m.id === `s-${nodeId}`);

  const saveNodeEdit = () => {
    if (!editingNodeId) return;
    const node = bracketCanvas.nodes.find((n) => n.id === editingNodeId);
    if (!node) return;
    upsertCanvasNode({ ...node, player1: nodeEdit.player1, player2: nodeEdit.player2, status: nodeEdit.status, round: nodeEdit.round });
    ensureScheduleForBracket(editingNodeId, nodeEdit.round, nodeEdit.player1, nodeEdit.player2);
    store.updateMatch(`s-${editingNodeId}`, {
      player1: nodeEdit.player1,
      player2: nodeEdit.player2,
      status: nodeEdit.status,
      date: nodeEdit.date,
      time: nodeEdit.time,
      round: bracketRoundTitles[nodeEdit.round] || `Раунд ${nodeEdit.round}`,
      streamUrl: nodeEdit.streamUrl,
      player1Score: nodeEdit.score1,
      player2Score: nodeEdit.score2,
      score: `${nodeEdit.score1}:${nodeEdit.score2}`,
    });
    setEditingNodeId(null);
  };

  // Donor-style connect behavior
  const startConnect = (fromId: string) => {
    if (!connectMode) return;
    if (connectingFrom === null) {
      setConnectingFrom(fromId);
      return;
    }
    if (connectingFrom === fromId) {
      setConnectingFrom(null);
      return;
    }
    const slot1Taken = bracketCanvas.edges.some((e) => e.to === fromId && (e.toSlot ?? 1) === 1);
    const toSlot: 1 | 2 = slot1Taken ? 2 : 1;
    upsertCanvasEdge({ id: `${connectingFrom}->${fromId}`, from: connectingFrom, to: fromId, toSlot });
    setConnectingFrom(null);
  };

  const deleteEdge = (id: string) => removeCanvasEdge(id);

  const bezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  const NODE_W = 272;
  const NODE_H = 96;

  const autoLayout = () => {
    const matches = bracketCanvas.nodes.filter((n) => n.type === "match");
    const byRound: Record<number, typeof matches> = {};
    matches.forEach((m) => {
      const r = m.round ?? 1;
      if (!byRound[r]) byRound[r] = [];
      byRound[r].push(m);
    });
    const roundsSorted = Object.keys(byRound).map(Number).sort((a, b) => a - b);
    const COL_W = NODE_W + 80;
    const ROW_H = NODE_H + 36;
    roundsSorted.forEach((r, colIdx) => {
      byRound[r].forEach((m, rowIdx) => {
        upsertCanvasNode({ ...m, x: 32 + colIdx * COL_W, y: 32 + rowIdx * ROW_H, width: NODE_W, height: NODE_H });
      });
    });
  };

  // Pan dragging with middle/right like donor
  useEffect(() => {
    if (!panning) return;
    const onMove = (e: MouseEvent) => {
      if (!panStart.current) return;
      updateBracketCanvas({ offsetX: panStart.current.ox + e.clientX - panStart.current.mx, offsetY: panStart.current.oy + e.clientY - panStart.current.my });
    };
    const onUp = () => {
      panStart.current = null;
      setPanning(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [panning, updateBracketCanvas]);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-12">СЕТКА</h1>

        <div className="flex gap-8 overflow-x-auto pb-4 items-start">
          {rounds.map((round, ri) => {
            const matches = bracket.filter((m) => m.round === round).sort((a, b) => a.position - b.position);
            return (
              <div key={round} className="flex-shrink-0 w-64">
                {isAdmin && editMode ? (
                  <input className="w-full text-xs text-center bg-background border border-border px-2 py-1 mb-4" value={bracketRoundTitles[round] || `Раунд ${round}`} onChange={(e) => setBracketRoundTitle(round, e.target.value)} />
                ) : (
                  <p className="text-xs text-muted-foreground uppercase tracking-widest text-center mb-6 font-display">{bracketRoundTitles[round] || `Раунд ${round}`}</p>
                )}
                <div className="space-y-4" style={{ paddingTop: ri * 36 }}>
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="border border-border/60 bg-card/85 rounded-xl relative group cursor-pointer shadow-lg hover:border-primary/50 transition-colors overflow-hidden"
                      onClick={() => {
                        if (isAdmin && editMode) return;
                        setSelectedMatchId(m.id);
                      }}
                    >
                      {editingId === m.id ? (
                        <div className="p-3 space-y-2">
                          <select className="w-full bg-background border border-border px-2 py-1 text-xs" value={form.player1} onChange={(e) => setForm((s) => ({ ...s, player1: e.target.value }))}>
                            <option value="">Игрок 1</option>
                            {players.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                          <select className="w-full bg-background border border-border px-2 py-1 text-xs" value={form.player2} onChange={(e) => setForm((s) => ({ ...s, player2: e.target.value }))}>
                            <option value="">Игрок 2</option>
                            {players.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" min={0} className="bg-background border border-border px-2 py-1 text-xs" value={form.player1Score} onChange={(e) => setForm((s) => ({ ...s, player1Score: Number(e.target.value) || 0 }))} />
                            <input type="number" min={0} className="bg-background border border-border px-2 py-1 text-xs" value={form.player2Score} onChange={(e) => setForm((s) => ({ ...s, player2Score: Number(e.target.value) || 0 }))} />
                          </div>
                          <select className="w-full bg-background border border-border px-2 py-1 text-xs" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as typeof s.status }))}>
                            <option value="planned">Запланировано</option>
                            <option value="live">LIVE</option>
                            <option value="finished">Завершён</option>
                            <option value="cancelled">Отменён</option>
                          </select>
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="px-2 py-1 border border-primary text-primary text-xs">Ок</button>
                            <button onClick={() => setEditingId(null)} className="px-2 py-1 border border-border text-xs">Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-muted/20">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Bo3</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                m.status === "live"
                                  ? "bg-lime-500/20 text-lime-400"
                                  : m.status === "finished"
                                    ? "bg-violet-500/20 text-violet-300"
                                    : m.status === "cancelled"
                                      ? "bg-rose-500/20 text-rose-400"
                                      : "bg-sky-500/20 text-sky-300"
                              }`}>
                                {statusLabel(m.status)}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Раунд {m.round}</span>
                          </div>
                          <div className={`px-4 py-2 text-sm flex justify-between border-b border-border/30 ${m.winner === m.player1 ? "text-primary bg-primary/5" : "text-foreground"}`}>
                            <button disabled={!(isAdmin && editMode)} onClick={(e) => { e.stopPropagation(); updateBracketMatch(m.id, { player1Score: (m.player1Score ?? 0) + 1, score: `${(m.player1Score ?? 0) + 1}:${m.player2Score ?? 0}` }); }}>{m.player1 || "TBD"}</button>
                            <span className="text-xs bg-background/70 border border-border/50 px-1.5 py-0.5 rounded-sm">{m.player1Score ?? 0}</span>
                          </div>
                          <div className={`px-4 py-2 text-sm flex justify-between ${m.winner === m.player2 ? "text-primary bg-primary/5" : "text-foreground"}`}>
                            <button disabled={!(isAdmin && editMode)} onClick={(e) => { e.stopPropagation(); updateBracketMatch(m.id, { player2Score: (m.player2Score ?? 0) + 1, score: `${m.player1Score ?? 0}:${(m.player2Score ?? 0) + 1}` }); }}>{m.player2 || "TBD"}</button>
                            <span className="text-xs bg-background/70 border border-border/50 px-1.5 py-0.5 rounded-sm">{m.player2Score ?? 0}</span>
                          </div>
                          <div className="px-4 pb-2 text-[10px] text-muted-foreground/80">Клик по матчу: подробности</div>
                          {isAdmin && editMode && (
                            <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); startEdit(m); }} className="w-6 h-6 bg-card border border-primary text-primary flex items-center justify-center"><Pencil size={10} /></button>
                              <button onClick={(e) => { e.stopPropagation(); removeBracketMatch(m.id); }} className="w-6 h-6 bg-card border border-destructive text-destructive flex items-center justify-center"><Trash2 size={10} /></button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {isAdmin && editMode && <button onClick={() => {
                    const id = `b-${Date.now()}`;
                    addBracketMatch({ id, round, position: matches.length, player1: "TBD", player2: "TBD", status: "planned", player1Score: 0, player2Score: 0, score: "0:0" });
                    ensureScheduleForBracket(id, round);
                  }} className="w-full border border-dashed border-border text-xs py-3 flex items-center justify-center gap-1"><Plus size={12} /> Добавить слот</button>}
                </div>
              </div>
            );
          })}
          {isAdmin && editMode && <div className="flex-shrink-0 w-60 pt-8"><button onClick={() => {
            const id = `b-${Date.now()}`;
            const newRound = (Math.max(...rounds) || 0) + 1;
            addBracketMatch({ id, round: newRound, position: 0, player1: "TBD", player2: "TBD", status: "planned", player1Score: 0, player2Score: 0, score: "0:0" });
            ensureScheduleForBracket(id, newRound);
          }} className="border border-dashed border-border text-xs px-6 py-4 flex items-center gap-2"><Plus size={14} /> Новый раунд</button></div>}
        </div>
        <datalist id="players-list">{players.map((p) => <option key={p.id} value={p.name} />)}</datalist>

        <div className="mt-14">
          <h2 className="font-display text-xl tracking-widest mb-3">Расписание</h2>
          <div className="space-y-2">
            {schedule.map((m) => <div key={m.id} className="border border-border bg-card p-3 text-sm">{m.player1} vs {m.player2} · {m.round} · {statusLabel(m.status)}</div>)}
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-display text-xl tracking-widest">Графическая сетка</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {isAdmin && editMode && (
                <>
                  <button
                    onClick={() => { setConnectMode((v) => !v); setConnectingFrom(null); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading transition-all border ${
                      connectMode ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LinkIcon size={13} /> {connectMode ? "Режим соединений ON" : "Соединить узлы"}
                  </button>
                  <button
                    onClick={autoLayout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw size={13} /> Авто-расстановка
                  </button>
                  <button
                    className="px-3 py-1.5 border border-border text-xs rounded-lg"
                    onClick={() => {
                      const id = `n-${Date.now()}`;
                      const r = Math.max(...rounds, 1);
                      upsertCanvasNode({ id, type: "match", label: "Матч", round: r, x: 32, y: 32, width: NODE_W, height: NODE_H, player1: "TBD", player2: "TBD", status: "planned" });
                      ensureScheduleForBracket(id, r);
                    }}
                  >
                    <Plus size={13} className="inline mr-1" /> Узел
                  </button>
                  <button
                    className="px-3 py-1.5 border border-border text-xs rounded-lg"
                    onClick={() => upsertCanvasNode({ id: `t-${Date.now()}`, type: "text", label: "Раунд / заметка", x: 120, y: 240, width: 220, height: 56 })}
                  >
                    <Type size={13} className="inline mr-1" /> Текст
                  </button>
                </>
              )}
              <div className="flex items-center gap-1 border border-border rounded-lg px-2 py-1">
                <button onClick={() => updateBracketCanvas({ scale: Math.max(0.45, +(bracketCanvas.scale - 0.1).toFixed(2)) })} className="text-xs text-muted-foreground hover:text-foreground px-1" title="Уменьшить">−</button>
                <span className="text-xs text-muted-foreground min-w-12 text-center">{Math.round(bracketCanvas.scale * 100)}%</span>
                <button onClick={() => updateBracketCanvas({ scale: Math.min(2.2, +(bracketCanvas.scale + 0.1).toFixed(2)) })} className="text-xs text-muted-foreground hover:text-foreground px-1" title="Увеличить">+</button>
                <button onClick={() => updateBracketCanvas({ scale: 1, offsetX: 0, offsetY: 0 })} className="text-xs text-primary hover:underline px-1" title="Сбросить масштаб">1:1</button>
              </div>
              <span className="text-[10px] text-muted-foreground/60 hidden md:block">
                Ctrl+колесо — масштаб · ПКМ/средняя — панорама
              </span>
            </div>
          </div>

          {isAdmin && editMode && connectMode && connectingFrom && (
            <div className="mb-2 text-xs text-primary animate-flicker font-heading">Выбери узел‑получатель…</div>
          )}

          <div className="glass-card rounded-2xl overflow-hidden border border-border/30" style={{ height: 600, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                cursor: panning ? "grabbing" : connectMode ? "crosshair" : "default",
                background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 70%)",
              }}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={(e) => {
                if (e.button === 1 || e.button === 2) {
                  e.preventDefault();
                  panStart.current = { mx: e.clientX, my: e.clientY, ox: bracketCanvas.offsetX, oy: bracketCanvas.offsetY };
                  setPanning(true);
                }
                if (connectMode && e.button === 0 && e.target === e.currentTarget) {
                  setConnectingFrom(null);
                }
              }}
              onWheel={(e) => {
                if (!e.ctrlKey && !e.metaKey) return;
                e.preventDefault();
                const delta = e.deltaY < 0 ? 0.1 : -0.1;
                updateBracketCanvas({ scale: Math.min(2.2, Math.max(0.45, +(bracketCanvas.scale + delta).toFixed(2))) });
              }}
            >
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                <defs>
                  <pattern id="dotgrid" x={bracketCanvas.offsetX % 28} y={bracketCanvas.offsetY % 28} width="28" height="28" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.06)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dotgrid)" />
              </svg>

              <div
                style={{
                  transform: `translate(${bracketCanvas.offsetX}px, ${bracketCanvas.offsetY}px) scale(${bracketCanvas.scale})`,
                  transformOrigin: "top left",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 2400,
                  height: 1200,
                }}
              >
                <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
                  {bracketCanvas.edges.map((edge) => {
                    const from = nodeMap[edge.from];
                    const to = nodeMap[edge.to];
                    if (!from || !to) return null;
                    const x1 = from.x + NODE_W;
                    const y1 = from.y + NODE_H / 2;
                    const x2 = to.x;
                    const slotOffset = (edge.toSlot ?? 1) === 1 ? NODE_H * 0.35 : NODE_H * 0.72;
                    const y2 = to.y + slotOffset;
                    const path = bezierPath(x1, y1, x2, y2);
                    const color = "rgba(255,255,255,0.25)";
                    const pts = path.match(/[\d.]+/g)?.map(Number) ?? [];
                    const mx = pts.length >= 8 ? (pts[0] + pts[6]) / 2 - 8 : x1;
                    const my = pts.length >= 8 ? (pts[1] + pts[7]) / 2 - 8 : y1;
                    return (
                      <g key={edge.id}>
                        <path d={path} fill="none" stroke={color} strokeWidth="6" strokeOpacity="0.15" strokeLinecap="round" />
                        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
                        {isAdmin && editMode && (
                          <foreignObject x={mx} y={my} width="16" height="16" style={{ pointerEvents: "all" }}>
                            <div
                              style={{ width: 16, height: 16, borderRadius: "50%", background: "hsl(var(--destructive))", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.85 }}
                              onClick={() => deleteEdge(edge.id)}
                              title="Удалить связь"
                            >
                              <X style={{ width: 9, height: 9, color: "white" }} />
                            </div>
                          </foreignObject>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {bracketCanvas.nodes.map((node) => {
                  if (node.type !== "match") {
                    return (
                      <div
                        key={node.id}
                        style={{ position: "absolute", left: node.x, top: node.y, width: node.width, height: node.height }}
                        className="glass-card rounded-xl p-2 border border-border/40"
                      >
                        <textarea
                          className="w-full h-full bg-transparent resize-none outline-none text-xs select-text"
                          value={node.label}
                          disabled={!(isAdmin && editMode)}
                          onChange={(e) => upsertCanvasNode({ ...node, label: e.target.value })}
                        />
                      </div>
                    );
                  }

                  const sched = scheduleByNodeId(node.id);
                  const score1 = sched?.player1Score ?? 0;
                  const score2 = sched?.player2Score ?? 0;
                  const status = (sched?.status ?? node.status ?? "planned") as "planned" | "live" | "finished" | "cancelled";
                  const round = node.round ?? 1;

                  return (
                    <div
                      key={node.id}
                      style={{
                        position: "absolute",
                        left: node.x,
                        top: node.y,
                        width: NODE_W,
                        height: NODE_H,
                        userSelect: "none",
                        cursor: connectMode ? "pointer" : isAdmin && editMode ? "grab" : "default",
                      }}
                      className={`rounded-xl overflow-hidden border shadow-lg bg-card transition-shadow ${
                        status === "live" ? "ring-1 ring-rose-500/60" : ""
                      } ${connectingFrom === node.id ? "ring-2 ring-primary" : ""}`}
                      onMouseDown={(e) => {
                        if (!(isAdmin && editMode)) return;
                        if (connectMode) {
                          if (e.button === 0) {
                            e.stopPropagation();
                            startConnect(node.id);
                          }
                          return;
                        }
                        if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
                        e.preventDefault();
                        dragRef.current = { id: node.id, dx: e.clientX - node.x, dy: e.clientY - node.y };
                      }}
                      onDoubleClick={() => {
                        if (!(isAdmin && editMode)) return;
                        const s = scheduleByNodeId(node.id);
                        setEditingNodeId(node.id);
                        setNodeEdit({
                          player1: node.player1 || "TBD",
                          player2: node.player2 || "TBD",
                          status: (s?.status ?? node.status ?? "planned") as any,
                          round,
                          date: s?.date ?? "",
                          time: s?.time ?? "",
                          streamUrl: s?.streamUrl ?? "",
                          score1: s?.player1Score ?? 0,
                          score2: s?.player2Score ?? 0,
                        });
                      }}
                      onMouseMove={(e) => {
                        if (!dragRef.current || dragRef.current.id !== node.id) return;
                        if (!(isAdmin && editMode) || connectMode) return;
                        const dx = (e.clientX - dragRef.current.dx);
                        const dy = (e.clientY - dragRef.current.dy);
                        upsertCanvasNode({ ...node, x: dx, y: dy, width: NODE_W, height: NODE_H });
                      }}
                      onMouseUp={() => { dragRef.current = null; }}
                    >
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/20 bg-muted/20">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-heading text-muted-foreground tracking-wider">Bo3</span>
                          {status === "live" && <span className="text-[9px] text-rose-400 animate-pulse font-bold">● LIVE</span>}
                          {sched?.streamUrl && (
                            <a data-no-drag="1" href={sched.streamUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                              <Tv size={11} className="text-primary" />
                            </a>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{bracketRoundTitles[round] || `Раунд ${round}`}</span>
                      </div>

                      <div
                        data-no-drag="1"
                        className={`flex items-center justify-between px-3 py-2 transition-colors ${isAdmin && editMode && !connectMode ? "hover:bg-muted/20 cursor-pointer" : ""}`}
                        onClick={() => {
                          if (!(isAdmin && editMode) || connectMode) return;
                          ensureScheduleForBracket(node.id, round, node.player1 || "TBD", node.player2 || "TBD");
                          store.updateMatch(`s-${node.id}`, {
                            status: "live",
                            player1Score: (score1 ?? 0) + 1,
                            score: `${(score1 ?? 0) + 1}:${score2 ?? 0}`,
                          });
                        }}
                      >
                        <span className="text-sm font-heading truncate">{node.player1 || "TBD"}</span>
                        <span className="text-sm font-heading font-bold tabular-nums">{score1 ?? 0}</span>
                      </div>
                      <div className="border-t border-border/20" />
                      <div
                        data-no-drag="1"
                        className={`flex items-center justify-between px-3 py-2 transition-colors ${isAdmin && editMode && !connectMode ? "hover:bg-muted/20 cursor-pointer" : ""}`}
                        onClick={() => {
                          if (!(isAdmin && editMode) || connectMode) return;
                          ensureScheduleForBracket(node.id, round, node.player1 || "TBD", node.player2 || "TBD");
                          store.updateMatch(`s-${node.id}`, {
                            status: "live",
                            player2Score: (score2 ?? 0) + 1,
                            score: `${score1 ?? 0}:${(score2 ?? 0) + 1}`,
                          });
                        }}
                      >
                        <span className="text-sm font-heading truncate">{node.player2 || "TBD"}</span>
                        <span className="text-sm font-heading font-bold tabular-nums">{score2 ?? 0}</span>
                      </div>

                      {isAdmin && editMode && connectMode && (
                        <div
                          data-no-drag="1"
                          title="Потяни соединение от этого матча"
                          onClick={(e) => { e.stopPropagation(); startConnect(node.id); }}
                          style={{
                            position: "absolute",
                            right: -8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: connectingFrom === node.id ? "hsl(var(--primary))" : "hsl(var(--card))",
                            border: "2px solid hsl(var(--primary))",
                            cursor: "pointer",
                            zIndex: 10,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Dialog open={Boolean(editingNodeId)} onOpenChange={(open) => !open && setEditingNodeId(null)}>
            <DialogContent className="max-w-2xl border-border bg-card">
              <DialogHeader>
                <DialogTitle className="font-display tracking-widest text-primary">Редактирование блока</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select className="bg-background border border-border px-3 py-2 text-sm" value={nodeEdit.player1} onChange={(e) => setNodeEdit((s) => ({ ...s, player1: e.target.value }))}>
                  <option value="TBD">TBD</option>
                  {players.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <select className="bg-background border border-border px-3 py-2 text-sm" value={nodeEdit.player2} onChange={(e) => setNodeEdit((s) => ({ ...s, player2: e.target.value }))}>
                  <option value="TBD">TBD</option>
                  {players.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <select className="bg-background border border-border px-3 py-2 text-sm" value={nodeEdit.status} onChange={(e) => setNodeEdit((s) => ({ ...s, status: e.target.value as any }))}>
                  <option value="planned">Запланировано</option>
                  <option value="live">LIVE</option>
                  <option value="finished">Завершён</option>
                  <option value="cancelled">Отменён</option>
                </select>
                <input type="number" min={1} className="bg-background border border-border px-3 py-2 text-sm" value={nodeEdit.round} onChange={(e) => setNodeEdit((s) => ({ ...s, round: Number(e.target.value) || 1 }))} />
                <input className="bg-background border border-border px-3 py-2 text-sm" placeholder="Дата (YYYY-MM-DD)" value={nodeEdit.date} onChange={(e) => setNodeEdit((s) => ({ ...s, date: e.target.value }))} />
                <input className="bg-background border border-border px-3 py-2 text-sm" placeholder="Время (HH:mm)" value={nodeEdit.time} onChange={(e) => setNodeEdit((s) => ({ ...s, time: e.target.value }))} />
                <input className="bg-background border border-border px-3 py-2 text-sm sm:col-span-2" placeholder="Трансляция (https://...)" value={nodeEdit.streamUrl} onChange={(e) => setNodeEdit((s) => ({ ...s, streamUrl: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                  <input type="number" min={0} className="bg-background border border-border px-3 py-2 text-sm" value={nodeEdit.score1} onChange={(e) => setNodeEdit((s) => ({ ...s, score1: Number(e.target.value) || 0 }))} />
                  <input type="number" min={0} className="bg-background border border-border px-3 py-2 text-sm" value={nodeEdit.score2} onChange={(e) => setNodeEdit((s) => ({ ...s, score2: Number(e.target.value) || 0 }))} />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <button className="flex items-center gap-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-heading" onClick={saveNodeEdit}><Check size={14} /> Сохранить</button>
                  <button className="flex items-center gap-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-heading" onClick={() => setEditingNodeId(null)}><X size={14} /> Отмена</button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={Boolean(selectedMatchId)} onOpenChange={(v) => !v && setSelectedMatchId(null)}>
        <DialogContent className="border-border bg-card max-w-2xl">
          {selectedMatchId && (() => {
            const m = bracket.find((item) => item.id === selectedMatchId);
            if (!m) return null;
            const p1 = players.find((p) => p.name === m.player1);
            const p2 = players.find((p) => p.name === m.player2);
            const linkedSchedule = findScheduleMatch(m.player1, m.player2);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display tracking-widest text-primary">
                    {m.player1 || "TBD"} vs {m.player2 || "TBD"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center border border-border/60 rounded-md p-3">
                    {p1?.avatar && <img src={p1.avatar} alt="" className="w-20 h-20 object-cover mx-auto border border-border mb-2 rounded-sm" />}
                    {p1 ? <Link to={`/players/${p1.id}`} className="text-primary hover:underline">{p1.name}</Link> : <p>{m.player1 || "TBD"}</p>}
                  </div>
                  <div className="text-center border border-border/60 rounded-md p-3">
                    {p2?.avatar && <img src={p2.avatar} alt="" className="w-20 h-20 object-cover mx-auto border border-border mb-2 rounded-sm" />}
                    {p2 ? <Link to={`/players/${p2.id}`} className="text-primary hover:underline">{p2.name}</Link> : <p>{m.player2 || "TBD"}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-muted-foreground">Счёт: <span className="text-foreground">{m.player1Score ?? 0}:{m.player2Score ?? 0}</span></p>
                  <p className="text-muted-foreground">Статус: <span className="text-foreground">{statusLabel(m.status)}</span></p>
                </div>
                {linkedSchedule?.streamUrl ? (
                  <a href={linkedSchedule.streamUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                    <ExternalLink size={14} /> Открыть трансляцию
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground">Трансляция не указана</p>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bracket;
