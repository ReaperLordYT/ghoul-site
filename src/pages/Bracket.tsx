import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMemo, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { ExternalLink, Link2, Pencil, Plus, Radio, Trash2, ZoomIn, ZoomOut, Type } from "lucide-react";
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl tracking-widest">Графическая сетка</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-border text-xs" onClick={() => updateBracketCanvas({ scale: Math.max(0.4, bracketCanvas.scale - 0.1) })}><ZoomOut size={13} /></button>
              <button className="px-3 py-1 border border-border text-xs" onClick={() => updateBracketCanvas({ scale: Math.min(1.8, bracketCanvas.scale + 0.1) })}><ZoomIn size={13} /></button>
              <button className="px-3 py-1 border border-border text-xs" onClick={() => updateBracketCanvas({ scale: 1, offsetX: 0, offsetY: 0 })}>100%</button>
              {isAdmin && editMode && (
                <>
                <button className="px-3 py-1 border border-border text-xs" onClick={() => {
                  const id = `n-${Date.now()}`;
                  upsertCanvasNode({ id, type: "match", label: "Матч", x: 80, y: 80, width: 250, height: 96, player1: "TBD", player2: "TBD", status: "planned" });
                  const syntheticRound = Math.max(...rounds, 1);
                  ensureScheduleForBracket(id, syntheticRound);
                }}><Plus size={13} /> Блок</button>
                <button className="px-3 py-1 border border-border text-xs" onClick={() => upsertCanvasNode({ id: `t-${Date.now()}`, type: "text", label: "Раунд / заметка", x: 120, y: 240, width: 220, height: 56 })}><Type size={13} /> Текст</button>
                </>
              )}
            </div>
          </div>
          <div
            className="relative border border-primary/40 rounded-md bg-card h-[560px] overflow-hidden overscroll-contain select-none"
            style={{ touchAction: "none" }}
            onWheelCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const step = e.ctrlKey || e.metaKey ? 0.08 : 0.04;
              updateBracketCanvas({ scale: Math.min(2.2, Math.max(0.45, bracketCanvas.scale + (e.deltaY > 0 ? -step : step))) });
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              if ((e.target as HTMLElement).closest("[data-node='1']")) return;
              panRef.current = { startX: e.clientX, startY: e.clientY, ox: bracketCanvas.offsetX, oy: bracketCanvas.offsetY };
            }}
            onMouseMove={(e) => {
              if (resizeRef.current && isAdmin && editMode) {
                const node = bracketCanvas.nodes.find((n) => n.id === resizeRef.current!.id);
                if (!node) return;
                const nextW = Math.max(160, resizeRef.current.startW + (e.clientX - resizeRef.current.startX));
                const nextH = Math.max(node.type === "text" ? 44 : 82, resizeRef.current.startH + (e.clientY - resizeRef.current.startY));
                upsertCanvasNode({ ...node, width: nextW, height: nextH });
                return;
              }
              if (panRef.current) {
                updateBracketCanvas({ offsetX: panRef.current.ox + (e.clientX - panRef.current.startX), offsetY: panRef.current.oy + (e.clientY - panRef.current.startY) });
                return;
              }
            }}
            onMouseUp={() => { panRef.current = null; resizeRef.current = null; dragRef.current = null; }}
            onMouseLeave={() => { panRef.current = null; resizeRef.current = null; dragRef.current = null; }}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <g transform={`translate(${bracketCanvas.offsetX},${bracketCanvas.offsetY}) scale(${bracketCanvas.scale})`}>
                {bracketCanvas.edges.map((edge) => {
                  const from = nodeMap[edge.from];
                  const to = nodeMap[edge.to];
                  if (!from || !to) return null;
                  const x1 = from.x + from.width;
                  const y1 = from.y + from.height / 2;
                  const x2 = to.x;
                  const y2 = to.y + to.height / 2;
                  return <line key={edge.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--accent))" strokeWidth={2} />;
                })}
              </g>
            </svg>
            <div className="absolute inset-0" style={{ transform: `translate(${bracketCanvas.offsetX}px, ${bracketCanvas.offsetY}px) scale(${bracketCanvas.scale})`, transformOrigin: "0 0" }}>
              {bracketCanvas.nodes.map((node) => (
                <div
                  key={node.id}
                  data-node="1"
                  className={`absolute shadow-lg text-xs ${node.type === "text" ? "p-1 rounded-lg border border-cyan-400/60 bg-card/90 ring-1 ring-cyan-400/20" : "rounded-xl border border-border/60 bg-card/95 overflow-hidden ring-1 ring-primary/10"}`}
                  style={{ left: node.x, top: node.y, width: node.width, height: node.height }}
                  onMouseDown={(e) => {
                    if (!(isAdmin && editMode)) return;
                    const t = e.target as HTMLElement;
                    const handle = t.closest('[data-drag-handle="1"]');
                    if (!handle) return;
                    e.stopPropagation();
                    dragRef.current = { id: node.id, dx: e.clientX - node.x, dy: e.clientY - node.y };
                  }}
                  onMouseMove={(e) => {
                    if (!dragRef.current || dragRef.current.id !== node.id || !(isAdmin && editMode)) return;
                    e.preventDefault();
                    upsertCanvasNode({ ...node, x: e.clientX - dragRef.current.dx, y: e.clientY - dragRef.current.dy });
                  }}
                  onMouseUp={() => { dragRef.current = null; }}
                >
                  {isAdmin && editMode && (
                    <div
                      data-drag-handle="1"
                      className="absolute top-0 left-0 right-0 h-7 cursor-grab bg-muted/30 border-b border-border/40 rounded-t-xl flex items-center justify-center"
                      title="Перетаскивание"
                      onMouseDown={(e) => {
                        if (!(isAdmin && editMode)) return;
                        e.stopPropagation();
                        dragRef.current = { id: node.id, dx: e.clientX - node.x, dy: e.clientY - node.y };
                      }}
                    />
                  )}
                  {node.type === "text" ? (
                    <textarea
                      className="w-full h-full bg-transparent resize-none outline-none text-[11px] leading-[1.1] pt-6 px-1 select-text"
                      value={node.label}
                      onChange={(e) => upsertCanvasNode({ ...node, label: e.target.value })}
                      disabled={!(isAdmin && editMode)}
                    />
                  ) : (
                    <>
                      <div className="pt-7 h-full flex flex-col select-none">
                        <select className="w-full bg-transparent border-b border-border/40 px-2 py-2 text-[12px] font-medium" value={node.player1 || "TBD"} onChange={(e) => upsertCanvasNode({ ...node, player1: e.target.value })} disabled={!(isAdmin && editMode)}>
                          <option value="TBD">TBD</option>
                          {players.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                        <select className="w-full bg-transparent border-b border-border/40 px-2 py-2 text-[12px] font-medium" value={node.player2 || "TBD"} onChange={(e) => upsertCanvasNode({ ...node, player2: e.target.value })} disabled={!(isAdmin && editMode)}>
                          <option value="TBD">TBD</option>
                          {players.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                        <select
                          className="w-full bg-transparent border-b border-border/40 px-2 py-1 text-[11px]"
                          value={node.status || "planned"}
                          onChange={(e) => upsertCanvasNode({ ...node, status: e.target.value as typeof node.status })}
                          disabled={!(isAdmin && editMode)}
                        >
                          <option value="planned">Запланировано</option>
                          <option value="live">LIVE</option>
                          <option value="finished">Завершён</option>
                          <option value="cancelled">Отменён</option>
                        </select>
                        <div className={`px-2 py-1 mt-auto inline-flex items-center gap-1 text-[11px] ${node.status === "live" ? "text-lime-400" : node.status === "cancelled" ? "text-rose-500" : node.status === "finished" ? "text-violet-400" : "text-sky-400"}`}>
                          {node.status === "live" && <Radio size={11} className="animate-flicker" />}
                          {statusLabel(node.status)}
                        </div>
                      </div>
                    </>
                  )}
                  {isAdmin && editMode && (
                    <div className="absolute -top-7 right-0 flex gap-1">
                      <button className="border border-border bg-card p-1" onClick={() => setEdgeModeFrom((prev) => (prev === node.id ? null : node.id))}><Link2 size={12} /></button>
                      {edgeModeFrom && edgeModeFrom !== node.id && <button className="border border-primary bg-card p-1 text-primary" onClick={() => { upsertCanvasEdge({ id: `e-${Date.now()}`, from: edgeModeFrom, to: node.id }); setEdgeModeFrom(null); }}><Plus size={12} /></button>}
                      <button className="border border-destructive bg-card p-1 text-destructive" onClick={() => removeCanvasNode(node.id)}><Trash2 size={12} /></button>
                    </div>
                  )}
                  {isAdmin && editMode && (
                    <button
                      className="absolute bottom-0 right-0 w-3 h-3 bg-primary/80 border border-background cursor-se-resize"
                      title="Изменить размер"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        resizeRef.current = { id: node.id, startX: e.clientX, startY: e.clientY, startW: node.width, startH: node.height };
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            {isAdmin && editMode && <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">Колесо: масштаб · перетаскивание фона: панорама</div>}
          </div>
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
