import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Clock, Radio, CheckCircle, Ban } from 'lucide-react';
import { parseScore } from '@/lib/score';

const statusConfig = {
  upcoming: { icon: <Clock size={14} />, label: 'Скоро', cls: 'text-muted-foreground' },
  live: { icon: <Radio size={14} />, label: 'LIVE', cls: 'text-primary animate-flicker' },
  finished: { icon: <CheckCircle size={14} />, label: 'Завершён', cls: 'text-muted-foreground/50' },
  cancelled: { icon: <Ban size={14} />, label: 'Отменён', cls: 'text-destructive' },
};

const Schedule = () => {
  const { schedule } = useStore();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl text-primary text-glow tracking-widest text-center mb-12">РАСПИСАНИЕ</h1>

        <div className="space-y-4">
          {schedule.map((m, i) => {
            const sc = statusConfig[m.status];
            const parsed = parseScore(m.score);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className={`border bg-card p-4 flex items-center justify-between ${m.status === 'live' ? 'border-primary box-glow' : 'border-border'}`}
              >
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground/50 font-display tracking-widest mb-1">{m.round}</p>
                  <p className="text-sm text-foreground">
                    <span className={parsed && parsed.a > parsed.b ? 'text-primary' : ''}>{m.player1}</span>
                    <span className="text-muted-foreground mx-2">vs</span>
                    <span className={parsed && parsed.b > parsed.a ? 'text-primary' : ''}>{m.player2}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{m.date} — {m.time}</p>
                  <div className={`flex items-center gap-1 text-xs mt-1 justify-end ${sc.cls}`}>
                    {sc.icon} {sc.label}
                    {m.score && <span className="ml-2 text-foreground font-display">{m.score}</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
