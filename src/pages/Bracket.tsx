import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { Plus, Trash2, Pencil, Link2, ZoomIn, ZoomOut } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { isValidScore, normalizeScoreInput } from "@/lib/score";

const Bracket = () => {
  const { bracket, players, isAdmin, editMode, addBracketMatch, removeBracketMatch, updateBracketMatch, bracketCanvas, bracketRoundTitles, setBracketRoundTitle, updateBracketCanvas, upsertCanvasNode, removeCanvasNode, upsertCanvasEdge, removeCanvasEdge } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ player1: "", player2: "", winner: "", score: "", status: "upcoming" as "upcoming" | "live" | "finished" | "cancelled" });
  const [edgeModeFrom, setEdgeModeFrom] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const nodeMap = useMemo(() => Object.fromEntries(bracketCanvas.nodes.map((n) => [n.id, n])), [bracketCanvas.nodes]);

  const rounds = [...new Set(bracket.map((m) => m.round))].sort((a, b) => a - b);

  const handleAddEmpty = (round: number) => {
    const matchesInRound = bracket.filter((m) => m.round === round);
    const nextPos = matchesInRound.length > 0 ? Math.max(...matchesInRound.map((m) => m.position)) + 1 : 0;
    addBracketMatch({ id: `b-${Date.now()}`, round, position: nextPos, player1: "TBD", player2: "TBD", status: "upcoming" });
  };

  const handleAddRound = () => {
    const nextRound = rounds.length > 0 ? Math.max(...rounds) + 1 : 1;
    addBracketMatch({ id: `b-${Date.now()}`, round: nextRound, position: 0, player1: "TBD", player2: "TBD", status: "upcoming" });
  };

  const startEdit = (m: typeof bracket[0]) => {
    setEditingId(m.id);
    setForm({ player1: m.player1 || "", player2: m.player2 || "", winner: m.winner || "", score: m.score || "", status: m.status || "upcoming" });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateBracketMatch(editingId, {
      player1: form.player1 || undefined,
      player2: form.player2 || undefined,
      winner: form.winner || undefined,
      score: isValidScore(form.score) ? form.score : undefined,
      status: form.status,
    });
    setEditingId(null);
  };

  const adjustScore = (m: (typeof bracket)[number], side: 1 | 2, delta: number) => {
    const [aRaw, bRaw] = (m.score && isValidScore(m.score) ? m.score : "0:0").split(":");
    const a = Math.max(0, Number(aRaw) + (side === 1 ? delta : 0));
    const b = Math.max(0, Number(bRaw) + (side === 2 ? delta : 0));
    updateBracketMatch(m.id, { score: `${a}:${b}` });
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
                {isAdmin && editMode ? (
                  <input className="w-full text-xs text-center bg-background border border-border px-2 py-1 mb-4" value={bracketRoundTitles[round] || `Раунд ${round}`} onChange={(e) => setBracketRoundTitle(round, e.target.value)} />
                ) : (
                  <p className="text-xs text-muted-foreground uppercase tracking-widest text-center mb-6 font-display">
                    {bracketRoundTitles[round] || `Раунд ${round}`}
                  </p>
                )}
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
                          <select className="w-full bg-background border border-border px-2 py-1 text-xs text-foreground" value={form.player1} onChange={(e) => setForm({ ...form, player1: e.target.value })}>
                            <option value="">Игрок 1</option>
                            {players.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                          <select className="w-full bg-background border border-border px-2 py-1 text-xs text-foreground" value={form.player2} onChange={(e) => setForm({ ...form, player2: e.target.value })}>
                            <option value="">Игрок 2</option>
                            {players.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                          <select className="w-full bg-background border border-border px-2 py-1 text-xs text-foreground" value={form.winner} onChange={(e) => setForm({ ...form, winner: e.target.value })}>
                            <option value="">Победитель</option>
                            {[form.player1, form.player2].filter(Boolean).map((name) => <option key={name} value={name}>{name}</option>)}
                          </select>
                          <input className={`w-full bg-background border px-2 py-1 text-xs text-foreground ${form.score && !isValidScore(form.score) ? "border-destructive" : "border-border"}`} placeholder="Счёт (2:1)" value={form.score} onChange={(e) => setForm({ ...form, score: normalizeScoreInput(e.target.value) })} />
                          <select className="w-full bg-background border border-border px-2 py-1 text-xs text-foreground" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}>
                            <option value="upcoming">Скоро</option>
                            <option value="live">LIVE</option>
                            <option value="finished">Завершён</option>
                            <option value="cancelled">Отменён</option>
                          </select>
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="px-2 py-1 border border-primary text-primary text-xs hover:bg-primary/10">Ок</button>
                            <button onClick={() => setEditingId(null)} className="px-2 py-1 border border-border text-muted-foreground text-xs hover:border-primary/50">Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={`px-4 py-2 text-sm flex justify-between border-b border-border/50 ${m.winner === m.player1 ? 'text-primary' : 'text-foreground'}`}>
                            <button disabled={!(isAdmin && editMode)} onClick={() => adjustScore(m, 1, 1)} className="text-left">{m.player1 || 'TBD'}</button>
                            {m.score && <span className="text-xs text-muted-foreground">{m.score?.split(':')[0]}</span>}
                          </div>
                          <div className={`px-4 py-2 text-sm flex justify-between ${m.winner === m.player2 ? 'text-primary' : 'text-foreground'}`}>
                            <button disabled={!(isAdmin && editMode)} onClick={() => adjustScore(m, 2, 1)} className="text-left">{m.player2 || 'TBD'}</button>
                            {m.score && <span className="text-xs text-muted-foreground">{m.score?.split(':')[1]}</span>}
                          </div>
                          <div className="px-4 pb-2 text-[11px] text-muted-foreground">{m.status === "live" ? "LIVE" : m.status === "cancelled" ? "Отменён" : m.status === "finished" ? "Завершён" : "Скоро"}</div>
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

        <div className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl tracking-widest text-foreground">Canvas-конструктор</h2>
            {isAdmin && editMode && (
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-border text-xs" onClick={() => updateBracketCanvas({ scale: Math.max(0.4, bracketCanvas.scale - 0.1) })}><ZoomOut size={13} /></button>
                <button className="px-3 py-1 border border-border text-xs" onClick={() => updateBracketCanvas({ scale: Math.min(1.6, bracketCanvas.scale + 0.1) })}><ZoomIn size={13} /></button>
                <button className="px-3 py-1 border border-border text-xs" onClick={() => upsertCanvasNode({ id: `n-${Date.now()}`, type: "match", label: "Матч", x: 80, y: 80, width: 250, height: 96, player1: "TBD", player2: "TBD", status: "upcoming" })}><Plus size={13} /> Блок</button>
                <button className="px-3 py-1 border border-border text-xs" onClick={() => upsertCanvasNode({ id: `t-${Date.now()}`, type: "text", label: "Текстовая заметка", x: 120, y: 260, width: 200, height: 70 })}><Plus size={13} /> Текст</button>
              </div>
            )}
          </div>

          <div
            className="relative border border-border bg-card h-[540px] overflow-hidden"
            onWheel={(e) => {
              const next = e.deltaY > 0 ? bracketCanvas.scale - 0.06 : bracketCanvas.scale + 0.06;
              updateBracketCanvas({ scale: Math.min(1.8, Math.max(0.4, next)) });
            }}
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).closest("[data-node='1']")) return;
              panRef.current = { startX: e.clientX, startY: e.clientY, ox: bracketCanvas.offsetX, oy: bracketCanvas.offsetY };
            }}
            onMouseMove={(e) => {
              if (!panRef.current) return;
              updateBracketCanvas({
                offsetX: panRef.current.ox + (e.clientX - panRef.current.startX),
                offsetY: panRef.current.oy + (e.clientY - panRef.current.startY),
              });
            }}
            onMouseUp={() => {
              panRef.current = null;
            }}
            onMouseLeave={() => {
              panRef.current = null;
            }}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {bracketCanvas.edges.map((edge) => {
                const from = nodeMap[edge.from];
                const to = nodeMap[edge.to];
                if (!from || !to) return null;
                const x1 = from.x + from.width;
                const y1 = from.y + from.height / 2;
                const x2 = to.x;
                const y2 = to.y + to.height / 2;
                const mid = (x1 + x2) / 2;
                const d = `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
                return (
                  <g key={edge.id}>
                    <path d={d} stroke="hsl(var(--accent))" fill="none" strokeWidth={2} />
                    {edge.label && <text x={mid} y={(y1 + y2) / 2 - 8} fill="hsl(var(--foreground))" fontSize="11">{edge.label}</text>}
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0" style={{ transform: `translate(${bracketCanvas.offsetX}px, ${bracketCanvas.offsetY}px) scale(${bracketCanvas.scale})`, transformOrigin: "0 0" }}>
              {bracketCanvas.nodes.map((node) => (
                <div
                  key={node.id}
                  data-node="1"
                  className={`absolute border ${node.type === "text" ? "border-accent/60 bg-accent/10" : "border-primary/60 bg-background"} p-2 shadow-sm`}
                  style={{ left: node.x, top: node.y, width: node.width, height: node.height }}
                  onMouseDown={(e) => {
                    if (!(isAdmin && editMode)) return;
                    dragRef.current = { id: node.id, dx: e.clientX - node.x, dy: e.clientY - node.y };
                  }}
                  onMouseMove={(e) => {
                    if (!dragRef.current || dragRef.current.id !== node.id || !(isAdmin && editMode)) return;
                    upsertCanvasNode({ ...node, x: e.clientX - dragRef.current.dx, y: e.clientY - dragRef.current.dy });
                  }}
                  onMouseUp={() => {
                    dragRef.current = null;
                  }}
                >
                  {node.type === "match" ? (
                    <div className="h-full flex flex-col text-xs">
                      {isAdmin && editMode ? (
                        <>
                          <input className="w-full bg-transparent border-b border-border px-1 py-1" value={node.player1 || "TBD"} onChange={(e) => upsertCanvasNode({ ...node, player1: e.target.value })} />
                          <input className="w-full bg-transparent border-b border-border px-1 py-1" value={node.player2 || "TBD"} onChange={(e) => upsertCanvasNode({ ...node, player2: e.target.value })} />
                          <select className="w-full bg-transparent px-1 py-1 mt-auto" value={node.status || "upcoming"} onChange={(e) => upsertCanvasNode({ ...node, status: e.target.value as typeof node.status })}>
                            <option value="upcoming">Скоро</option>
                            <option value="live">LIVE</option>
                            <option value="finished">Завершён</option>
                            <option value="cancelled">Отменён</option>
                          </select>
                        </>
                      ) : (
                        <>
                          <p className="border-b border-border px-1 py-1">{node.player1 || "TBD"}</p>
                          <p className="border-b border-border px-1 py-1">{node.player2 || "TBD"}</p>
                          <p className="px-1 py-1 text-muted-foreground mt-auto">{node.status === "live" ? "LIVE" : node.status === "cancelled" ? "Отменён" : node.status === "finished" ? "Завершён" : "Скоро"}</p>
                        </>
                      )}
                    </div>
                  ) : isAdmin && editMode ? (
                    <textarea className="w-full h-full bg-transparent text-xs resize-none outline-none" value={node.label} onChange={(e) => upsertCanvasNode({ ...node, label: e.target.value })} />
                  ) : (
                    <p className="text-xs whitespace-pre-wrap">{node.label}</p>
                  )}
                  {isAdmin && editMode && (
                    <div className="absolute -top-7 right-0 flex gap-1">
                      <button className="border border-border bg-card p-1" onClick={() => setEdgeModeFrom((prev) => (prev === node.id ? null : node.id))}><Link2 size={12} /></button>
                      {edgeModeFrom && edgeModeFrom !== node.id && (
                        <button className="border border-primary bg-card p-1 text-primary" onClick={() => { upsertCanvasEdge({ id: `e-${Date.now()}`, from: edgeModeFrom, to: node.id, label: "flow" }); setEdgeModeFrom(null); }}>
                          <Plus size={12} />
                        </button>
                      )}
                      <button className="border border-destructive bg-card p-1 text-destructive" onClick={() => removeCanvasNode(node.id)}><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {isAdmin && editMode && (
            <div className="mt-2 flex flex-wrap gap-2">
              {bracketCanvas.edges.map((edge) => (
                <div key={edge.id} className="border border-border bg-card px-2 py-1 text-xs flex items-center gap-2">
                  <input className="bg-transparent outline-none w-24" value={edge.label || ""} onChange={(e) => upsertCanvasEdge({ ...edge, label: e.target.value })} />
                  <button className="text-destructive" onClick={() => removeCanvasEdge(edge.id)}><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bracket;
