import { Link, useParams } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { ArrowLeft } from "lucide-react";

const NewsDetail = () => {
  const { id } = useParams();
  const item = useStore((s) => s.news.find((n) => n.id === id));

  if (!item) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-3xl mx-auto">
        <p className="text-sm text-muted-foreground">Новость не найдена.</p>
        <Link to="/news" className="inline-flex mt-4 text-primary text-sm">
          <ArrowLeft size={14} className="mr-2" />
          К новостям
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto border border-border bg-card p-6 md:p-10 box-glow">
        <Link to="/news" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft size={14} className="mr-2" />
          Назад к новостям
        </Link>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">{item.date}</p>
        <h1 className="font-display text-2xl md:text-4xl text-foreground mb-4">{item.title}</h1>
        {item.avatar && <img src={item.avatar} alt={item.title} className="w-full max-h-72 object-cover border border-border mb-6" />}
        <p className="text-base text-foreground/90 leading-8 whitespace-pre-wrap">{item.details || item.content}</p>
      </div>
    </article>
  );
};

export default NewsDetail;
