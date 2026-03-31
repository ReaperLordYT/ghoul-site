import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { Trash2, Plus, ImagePlus, Pencil, Check } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";

const News = () => {
  const { news, isAdmin, editMode, addNews, removeNews, updateNews } = useStore();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", details: "", avatar: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, avatar: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!form.title) return;
    addNews({
      id: Date.now().toString(),
      title: form.title,
      content: form.content,
      details: form.details || form.content,
      date: new Date().toISOString().slice(0, 10),
      avatar: form.avatar,
    });
    setForm({ title: "", content: "", details: "", avatar: "" });
    setAdding(false);
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-3">НОВОСТИ</h1>
        <p className="text-center text-muted-foreground mb-12">коротко в ленте, подробно в отдельной странице</p>

        {isAdmin && (
          <div className="mb-8 text-center">
            <button onClick={() => setAdding(!adding)} className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary text-xs uppercase tracking-widest hover:bg-primary/10">
              <Plus size={14} /> Добавить
            </button>
          </div>
        )}

        {adding && (
          <div className="border border-primary/30 bg-card p-6 mb-8 space-y-4">
            <div className="flex items-center gap-4">
              <button onClick={() => fileRef.current?.click()} className="w-16 h-16 border border-border bg-background flex items-center justify-center flex-shrink-0 hover:border-primary/50 transition-colors">
                {form.avatar ? (
                  <img src={form.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus size={20} className="text-muted-foreground" />
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              <input className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground" placeholder="Заголовок" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <textarea className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground h-24 resize-none" placeholder="Короткий текст карточки" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <textarea className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground h-40 resize-none" placeholder="Подробный текст для страницы новости" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
            <button onClick={handleAdd} className="px-4 py-2 bg-primary/20 border border-primary text-primary text-xs uppercase">Сохранить</button>
          </div>
        )}

        <div className="space-y-8">
          {news.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="border border-border bg-card p-5 relative group box-glow"
            >
              <div className="flex items-start gap-4">
                {item.avatar && (
                  <img src={item.avatar} alt="" className="w-12 h-12 object-cover border border-border flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground/50 font-display tracking-widest mb-1">{item.date}</p>
                  {editingId === item.id ? (
                    <>
                      <input className="w-full bg-background border border-border px-2 py-2 text-sm text-foreground mb-2" value={item.title} onChange={(e) => updateNews(item.id, { title: e.target.value })} />
                      <textarea className="w-full bg-background border border-border px-2 py-2 text-sm text-foreground h-24 resize-none mb-2" value={item.content} onChange={(e) => updateNews(item.id, { content: e.target.value })} />
                      <textarea className="w-full bg-background border border-border px-2 py-2 text-sm text-foreground h-36 resize-none mb-2" value={item.details || ""} onChange={(e) => updateNews(item.id, { details: e.target.value })} />
                    </>
                  ) : (
                    <>
                      <h3 className="font-heading text-xl text-foreground mb-2">{item.title}</h3>
                      <p className="text-base text-foreground/80 leading-7">{item.content}</p>
                    </>
                  )}
                  <Link to={`/news/${item.id}`} className="inline-flex mt-3 text-sm text-primary hover:underline">
                    Подробнее
                  </Link>
                </div>
              </div>
              {isAdmin && editMode && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={() => setEditingId((prev) => (prev === item.id ? null : item.id))} className="text-primary">
                    {editingId === item.id ? <Check size={14} /> : <Pencil size={14} />}
                  </button>
                  <button onClick={() => removeNews(item.id)} className="text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
