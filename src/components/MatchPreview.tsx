import type { Player } from "@/store/useStore";

export type MatchPreviewProps = {
  title: string;
  subtitle: string;
  player1: Player | undefined;
  player2: Player | undefined;
};

export const MatchPreview = ({ title, subtitle, player1, player2 }: MatchPreviewProps) => {
  const p1Avatar = player1?.avatar;
  const p2Avatar = player2?.avatar;

  return (
    <div
      className="relative overflow-hidden rounded-md border border-border bg-background"
      style={{
        backgroundImage: "url('/ghoul-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/30 to-accent/15" />
      <div className="relative p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="text-left">
            <p className="font-display text-xs uppercase tracking-widest text-primary text-glow">{title}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="font-display text-6xl md:text-7xl text-primary text-glow leading-none">BO3</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 items-center">
          <div className="flex flex-col items-center gap-2">
            {p1Avatar ? (
              <img src={p1Avatar} alt={player1?.name || "Player 1"} className="w-14 h-14 rounded-full object-cover border border-border box-glow" />
            ) : (
              <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center font-display text-xs text-primary">
                TBD
              </div>
            )}
            <p className="text-sm text-foreground font-heading text-center">{player1?.name || "TBD"}</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-muted-foreground font-display text-xs uppercase tracking-widest">VS</div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {p2Avatar ? (
              <img src={p2Avatar} alt={player2?.name || "Player 2"} className="w-14 h-14 rounded-full object-cover border border-border box-glow" />
            ) : (
              <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center font-display text-xs text-primary">
                TBD
              </div>
            )}
            <p className="text-sm text-foreground font-heading text-center">{player2?.name || "TBD"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

