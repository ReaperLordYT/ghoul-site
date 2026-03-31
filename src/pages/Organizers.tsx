import { motion } from "framer-motion";
import { Eye, Plus, Shield, Skull, Sword, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useState } from "react";

const iconMap = {
  skull: Skull,
  shield: Shield,
  sword: Sword,
  eye: Eye,
} as const;

const Organizers = () => {
  const { organizers, isAdmin, editMode, addOrganizer, removeOrganizer, updateOrganizer } = useStore();
  const [form, setForm] = useState({ name: "", role: "", desc: "", icon: "skull" as "skull" | "shield" | "sword" | "eye" });

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-2">ОРГАНИЗАТОРЫ</h1>
        <p className="text-center text-muted-foreground text-sm mb-12">те, кто стоят за тьмой</p>
        {isAdmin && editMode && (
          <div className="border border-border bg-card p-4 mb-6 space-y-2">
            <input className="w-full border border-border bg-background px-2 py-2 text-sm" placeholder="Имя" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
            <input className="w-full border border-border bg-background px-2 py-2 text-sm" placeholder="Роль" value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))} />
            <select className="w-full border border-border bg-background px-2 py-2 text-sm" value={form.icon} onChange={(e) => setForm((s) => ({ ...s, icon: e.target.value as any }))}>
              <option value="skull">Череп</option>
              <option value="shield">Щит</option>
              <option value="sword">Меч</option>
              <option value="eye">Глаз</option>
            </select>
            <textarea className="w-full border border-border bg-background px-2 py-2 text-sm h-20" placeholder="Описание" value={form.desc} onChange={(e) => setForm((s) => ({ ...s, desc: e.target.value }))} />
            <button
              className="inline-flex items-center gap-2 px-3 py-2 border border-primary text-primary text-xs"
              onClick={() => {
                if (!form.name.trim()) return;
                addOrganizer({ id: Date.now().toString(), ...form });
                setForm({ name: "", role: "", desc: "", icon: "skull" });
              }}
            >
              <Plus size={14} /> Добавить организатора
            </button>
          </div>
        )}
        <div className="space-y-6">
          {organizers.map((o, i) => {
            const Icon = iconMap[o.icon || "skull"];
            return (
            <motion.div key={o.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="border border-border bg-card p-6 flex items-start gap-4">
              <div className="w-12 h-12 border border-primary/30 bg-primary/5 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                {isAdmin && editMode ? (
                  <div className="space-y-2">
                    <input className="w-full border border-border bg-background px-2 py-1 text-sm" value={o.name} onChange={(e) => updateOrganizer(o.id, { name: e.target.value })} />
                    <input className="w-full border border-border bg-background px-2 py-1 text-xs" value={o.role} onChange={(e) => updateOrganizer(o.id, { role: e.target.value })} />
                    <select className="w-full border border-border bg-background px-2 py-1 text-xs" value={o.icon || "skull"} onChange={(e) => updateOrganizer(o.id, { icon: e.target.value as any })}>
                      <option value="skull">Череп</option>
                      <option value="shield">Щит</option>
                      <option value="sword">Меч</option>
                      <option value="eye">Глаз</option>
                    </select>
                    <textarea className="w-full border border-border bg-background px-2 py-1 text-sm h-20" value={o.desc} onChange={(e) => updateOrganizer(o.id, { desc: e.target.value })} />
                  </div>
                ) : (
                  <>
                    <p className="font-heading text-foreground">{o.name}</p>
                    <p className="text-xs text-primary uppercase tracking-widest mb-2">{o.role}</p>
                    <p className="text-sm text-muted-foreground">{o.desc}</p>
                  </>
                )}
              </div>
              {isAdmin && editMode && (
                <button className="text-destructive" onClick={() => removeOrganizer(o.id)}>
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          )})}
        </div>
      </div>
    </div>
  );
};

export default Organizers;
