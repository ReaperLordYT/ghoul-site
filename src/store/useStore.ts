import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  mmr?: number;
  dotabuffUrl?: string;
  steamUrl?: string;
  status: "active" | "winner" | "review" | "disqualified" | "rejected" | "left";
  statusReason?: string;
  matches: { opponent: string; result: "win" | "loss"; score: string }[];
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  details?: string;
  date: string;
  avatar?: string;
}

export interface MatchItem {
  id: string;
  player1: string;
  player2: string;
  time: string;
  date: string;
  status: "planned" | "live" | "finished" | "cancelled";
  score?: string;
  player1Score?: number;
  player2Score?: number;
  streamUrl?: string;
  round: string;
}

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
  player1?: string;
  player2?: string;
  winner?: string;
  score?: string;
  status?: "planned" | "live" | "finished" | "cancelled";
  player1Score?: number;
  player2Score?: number;
}

export interface OrganizerItem {
  id: string;
  name: string;
  role: string;
  desc: string;
  icon?: "skull" | "shield" | "sword" | "eye";
}

export interface Top3Item {
  id: string;
  place: number;
  name: string;
}

export interface AudioSettings {
  url: string;
  name: string;
  volume: number;
  autoplay: boolean;
}

export interface PreviewSettings {
  title: string;
  subtitle: string;
  player1Id: string;
  player2Id: string;
}

export interface CanvasNode {
  id: string;
  type: "match" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  round?: number;
  player1?: string;
  player2?: string;
  status?: "planned" | "live" | "finished" | "cancelled";
  player1Id?: string;
  player2Id?: string;
  player1Avatar?: string;
  player2Avatar?: string;
}

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  toSlot?: 1 | 2;
}

export interface BracketCanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface SiteTexts {
  heroTitle: string;
  heroSubtitle: string;
  heroQuote: string;
  registrationUrl: string;
  rulesUrl: string;
  [key: string]: string;
}

interface AppState {
  isAdmin: boolean;
  adminPassword: string;
  editMode: boolean;
  glitchEnabled: boolean;
  cursorTrailEnabled: boolean;
  soundsEnabled: boolean;
  theme: "light" | "dark";

  players: Player[];
  news: NewsItem[];
  schedule: MatchItem[];
  bracket: BracketMatch[];
  organizers: OrganizerItem[];
  top3: Top3Item[];
  texts: SiteTexts;
  audio: AudioSettings;
  preview: PreviewSettings;
  bracketCanvas: BracketCanvasState;
  bracketRoundTitles: Record<number, string>;

  login: (user: string, pass: string) => boolean;
  changeAdminPassword: (newPassword: string) => void;
  logout: () => void;
  toggleEditMode: () => void;
  setGlitch: (v: boolean) => void;
  setCursorTrail: (v: boolean) => void;
  setSounds: (v: boolean) => void;
  setTheme: (v: "light" | "dark") => void;
  toggleTheme: () => void;

  addPlayer: (p: Player) => void;
  updatePlayer: (id: string, p: Partial<Player>) => void;
  removePlayer: (id: string) => void;

  addNews: (n: NewsItem) => void;
  updateNews: (id: string, n: Partial<NewsItem>) => void;
  removeNews: (id: string) => void;

  addMatch: (m: MatchItem) => void;
  updateMatch: (id: string, m: Partial<MatchItem>) => void;
  removeMatch: (id: string) => void;

  updateBracket: (b: BracketMatch[]) => void;
  addBracketMatch: (m: BracketMatch) => void;
  removeBracketMatch: (id: string) => void;
  updateBracketMatch: (id: string, m: Partial<BracketMatch>) => void;

  addOrganizer: (o: OrganizerItem) => void;
  updateOrganizer: (id: string, o: Partial<OrganizerItem>) => void;
  removeOrganizer: (id: string) => void;

  addTop3: (t: Top3Item) => void;
  updateTop3: (id: string, t: Partial<Top3Item>) => void;
  removeTop3: (id: string) => void;

  updateAudio: (a: Partial<AudioSettings>) => void;
  updatePreview: (p: Partial<PreviewSettings>) => void;
  updateBracketCanvas: (c: Partial<BracketCanvasState>) => void;
  upsertCanvasNode: (node: CanvasNode) => void;
  removeCanvasNode: (id: string) => void;
  upsertCanvasEdge: (edge: CanvasEdge) => void;
  removeCanvasEdge: (id: string) => void;
  setBracketRoundTitle: (round: number, title: string) => void;

  updateText: (key: string, value: string) => void;
}

const defaultPlayers: Player[] = [
  { id: "1", name: "Demon King", mmr: 9200, dotabuffUrl: "https://www.dotabuff.com", steamUrl: "https://steamcommunity.com", status: "winner", matches: [{ opponent: "Soul Reaper", result: "win", score: "2:1" }] },
  { id: "2", name: "Soul Reaper", mmr: 8900, status: "active", matches: [{ opponent: "Demon King", result: "loss", score: "1:2" }] },
  { id: "3", name: "Shadow Spawn", mmr: 8500, status: "active", matches: [] },
  { id: "4", name: "Requiem", mmr: 8800, status: "review", statusReason: "Профиль на проверке", matches: [] },
];

const defaultNews: NewsItem[] = [
  { id: "1", title: "Ghouls Cup анонсирован", content: "Турнир стартует уже на этой неделе.", details: "Подробно: формат bo3, single elimination, главная цель — выявить сильнейшего SF-мидера.", date: "2026-03-28" },
  { id: "2", title: "Регистрация открыта", content: "Слоты ограничены, подтверждение в Discord.", details: "Каждому участнику нужно указать steam и проверить доступность к матчам по расписанию.", date: "2026-03-29" },
];

const defaultSchedule: MatchItem[] = [
  { id: "1", player1: "Demon King", player2: "Soul Reaper", time: "18:00", date: "2026-04-01", status: "planned", round: "Полуфинал", player1Score: 0, player2Score: 0, score: "0:0", streamUrl: "" },
  { id: "2", player1: "Shadow Spawn", player2: "Requiem", time: "20:00", date: "2026-04-01", status: "planned", round: "Полуфинал", player1Score: 0, player2Score: 0, score: "0:0", streamUrl: "" },
];

const defaultBracket: BracketMatch[] = [
  { id: "b1", round: 1, position: 0, player1: "Demon King", player2: "Soul Reaper", winner: "Demon King", score: "2:1", status: "finished" },
  { id: "b2", round: 1, position: 1, player1: "Shadow Spawn", player2: "Requiem", winner: "Requiem", score: "1:2", status: "finished" },
  { id: "b3", round: 2, position: 0, player1: "Demon King", player2: "Requiem", status: "planned" },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      adminPassword: "ghoulscup666",
      editMode: false,
      glitchEnabled: false,
      cursorTrailEnabled: true,
      soundsEnabled: true,
      theme: "light",
      players: defaultPlayers,
      news: defaultNews,
      schedule: defaultSchedule,
      bracket: defaultBracket,
      bracketRoundTitles: { 1: "Раунд 1", 2: "Полуфиналы", 3: "Финал" },
      organizers: [
        { id: "o1", name: "DarkMaster", role: "Главный организатор", desc: "Координирует весь турнир и проверяет формат матчей.", icon: "skull" },
        { id: "o2", name: "VoidOracle", role: "Судья", desc: "Следит за соблюдением регламента и решает спорные моменты.", icon: "shield" },
      ],
      top3: [
        { id: "t1", place: 1, name: "Demon King" },
        { id: "t2", place: 2, name: "Soul Reaper" },
        { id: "t3", place: 3, name: "Shadow Spawn" },
      ],
      audio: {
        url: "https://cdn.pixabay.com/download/audio/2023/03/23/audio_6b76fd26ab.mp3?filename=dark-logo-142209.mp3",
        name: "Default Tournament Theme",
        volume: 0.25,
        autoplay: false,
      },
      preview: {
        title: "GRAND FINAL",
        subtitle: "BEST OF 3",
        player1Id: "1",
        player2Id: "2",
      },
      bracketCanvas: {
        nodes: [
          { id: "n1", type: "match", x: 120, y: 120, width: 272, height: 96, label: "Матч 1", round: 1, player1: "Demon King", player2: "Soul Reaper", status: "live" },
          { id: "n2", type: "match", x: 500, y: 220, width: 272, height: 96, label: "Матч 2", round: 2, player1: "TBD", player2: "TBD", status: "planned" },
        ],
        edges: [{ id: "e1", from: "n1", to: "n2", label: "winner", toSlot: 1 }],
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      },
      texts: {
        heroTitle: "GHOULS CUP",
        heroSubtitle: "1v1 Shadow Fiend — только скилл, только мид",
        heroQuote: "«если слаб — не заходи»",
        registrationUrl: "#",
        rulesUrl: "#",
        top3Title: "ТОП-3",
        quote1: "«ты точно готов?»",
        quote2: "«ошибок не будет»",
        quote3: "«mid решает всё»",
        quote4: "«докажи или уходи»",
        statMatchesValue: "24",
        statMatchesLabel: "Матчей",
        statPlayersValue: "8",
        statPlayersLabel: "Игроков",
        statPrizeValue: "$500",
        statPrizeLabel: "Призовой",
        statRoundsValue: "3",
        statRoundsLabel: "Раундов",
        top3PendingBanner: "Турнир ещё не завершён. Победители будут объявлены позже.",
        top3CompletedBanner: "Турнир завершён.",
      },

      login: (user, pass) => {
        if (user === "admin" && pass === get().adminPassword) {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },
      changeAdminPassword: (newPassword) => {
        if (!newPassword.trim()) return;
        set({ adminPassword: newPassword.trim() });
      },
      logout: () => set({ isAdmin: false, editMode: false }),
      toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
      setGlitch: (v) => set({ glitchEnabled: v }),
      setCursorTrail: (v) => set({ cursorTrailEnabled: v }),
      setSounds: (v) => set({ soundsEnabled: v }),
      setTheme: (v) => set({ theme: v }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),

      addPlayer: (p) => set((s) => ({ players: [...s.players, p] })),
      updatePlayer: (id, p) => set((s) => ({ players: s.players.map((pl) => (pl.id === id ? { ...pl, ...p } : pl)) })),
      removePlayer: (id) => set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

      addNews: (n) => set((s) => ({ news: [n, ...s.news] })),
      updateNews: (id, n) => set((s) => ({ news: s.news.map((item) => (item.id === id ? { ...item, ...n } : item)) })),
      removeNews: (id) => set((s) => ({ news: s.news.filter((n) => n.id !== id) })),

      addMatch: (m) => set((s) => ({ schedule: [...s.schedule, m] })),
      updateMatch: (id, m) => set((s) => ({ schedule: s.schedule.map((item) => (item.id === id ? { ...item, ...m } : item)) })),
      removeMatch: (id) => set((s) => ({ schedule: s.schedule.filter((m) => m.id !== id) })),

      updateBracket: (b) => set({ bracket: b }),
      addBracketMatch: (m) => set((s) => ({ bracket: [...s.bracket, m] })),
      removeBracketMatch: (id) => set((s) => ({ bracket: s.bracket.filter((m) => m.id !== id) })),
      updateBracketMatch: (id, m) => set((s) => ({ bracket: s.bracket.map((item) => (item.id === id ? { ...item, ...m } : item)) })),

      addOrganizer: (o) => set((s) => ({ organizers: [...s.organizers, o] })),
      updateOrganizer: (id, o) => set((s) => ({ organizers: s.organizers.map((item) => (item.id === id ? { ...item, ...o } : item)) })),
      removeOrganizer: (id) => set((s) => ({ organizers: s.organizers.filter((item) => item.id !== id) })),

      addTop3: (t) => set((s) => ({ top3: [...s.top3, t].sort((a, b) => a.place - b.place) })),
      updateTop3: (id, t) => set((s) => ({ top3: s.top3.map((item) => (item.id === id ? { ...item, ...t } : item)).sort((a, b) => a.place - b.place) })),
      removeTop3: (id) => set((s) => ({ top3: s.top3.filter((item) => item.id !== id) })),

      updateAudio: (a) => set((s) => ({ audio: { ...s.audio, ...a } })),
      updatePreview: (p) => set((s) => ({ preview: { ...s.preview, ...p } })),
      updateBracketCanvas: (c) => set((s) => ({ bracketCanvas: { ...s.bracketCanvas, ...c } })),
      upsertCanvasNode: (node) =>
        set((s) => ({
          bracketCanvas: {
            ...s.bracketCanvas,
            nodes: s.bracketCanvas.nodes.some((n) => n.id === node.id) ? s.bracketCanvas.nodes.map((n) => (n.id === node.id ? node : n)) : [...s.bracketCanvas.nodes, node],
          },
        })),
      removeCanvasNode: (id) =>
        set((s) => ({
          bracketCanvas: {
            ...s.bracketCanvas,
            nodes: s.bracketCanvas.nodes.filter((n) => n.id !== id),
            edges: s.bracketCanvas.edges.filter((e) => e.from !== id && e.to !== id),
          },
        })),
      upsertCanvasEdge: (edge) =>
        set((s) => ({
          bracketCanvas: {
            ...s.bracketCanvas,
            edges: s.bracketCanvas.edges.some((e) => e.id === edge.id) ? s.bracketCanvas.edges.map((e) => (e.id === edge.id ? edge : e)) : [...s.bracketCanvas.edges, edge],
          },
        })),
      removeCanvasEdge: (id) => set((s) => ({ bracketCanvas: { ...s.bracketCanvas, edges: s.bracketCanvas.edges.filter((e) => e.id !== id) } })),
      setBracketRoundTitle: (round, title) => set((s) => ({ bracketRoundTitles: { ...s.bracketRoundTitles, [round]: title } })),

      updateText: (key, value) => set((s) => ({ texts: { ...s.texts, [key]: value } })),
    }),
    { name: "ghouls-cup-store" },
  ),
);
