import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Trash2, Plus, ImagePlus } from 'lucide-react';
import { useState, useRef } from 'react';

const News = () => {
  const { news, isAdmin, editMode, addNews, removeNews } = useStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', avatar: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, avatar: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!form.title) return;
    addNews({ id: Date.now().toString(), title: form.title, content: form.content, date: new Date().toISOString().slice(0, 10), avatar: form.avatar });
    setForm({ title: '', content: '', avatar: '' });
    setAdding(false);
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-12">НОВОСТИ</h1>

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
            <textarea className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground h-24 resize-none" placeholder="Текст" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
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
              className="border-l-2 border-primary/30 pl-6 relative group"
            >
              <div className="flex items-start gap-4">
                {item.avatar && (
                  <img src={item.avatar} alt="" className="w-12 h-12 object-cover border border-border flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground/50 font-display tracking-widest mb-1">{item.date}</p>
                  <h3 className="font-heading text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                </div>
              </div>
              {isAdmin && editMode && (
                <button onClick={() => removeNews(item.id)} className="absolute top-0 right-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} />
                </button>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
