import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  rank?: string;
  mmr?: number;
  status: 'active' | 'eliminated' | 'winner';
  matches: { opponent: string; result: 'win' | 'loss'; score: string }[];
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  avatar?: string;
}

export interface MatchItem {
  id: string;
  player1: string;
  player2: string;
  time: string;
  date: string;
  status: 'upcoming' | 'live' | 'finished' | 'cancelled';
  score?: string;
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

  players: Player[];
  news: NewsItem[];
  schedule: MatchItem[];
  bracket: BracketMatch[];
  texts: SiteTexts;
  top3: { place: number; name: string }[];

  login: (user: string, pass: string) => boolean;
  changeAdminPassword: (newPassword: string) => void;
  logout: () => void;
  toggleEditMode: () => void;
  setGlitch: (v: boolean) => void;
  setCursorTrail: (v: boolean) => void;
  setSounds: (v: boolean) => void;

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
  updateText: (key: string, value: string) => void;
}

const defaultPlayers: Player[] = [
  { id: '1', name: 'Demon King', rank: 'Immortal', mmr: 9200, status: 'winner', matches: [{ opponent: 'Soul Reaper', result: 'win', score: '2-1' }] },
  { id: '2', name: 'Soul Reaper', rank: 'Immortal', mmr: 8900, status: 'active', matches: [{ opponent: 'Demon King', result: 'loss', score: '1-2' }] },
  { id: '3', name: 'Shadow Spawn', rank: 'Divine', mmr: 8500, status: 'active', matches: [] },
  { id: '4', name: 'Requiem', rank: 'Immortal', mmr: 8800, status: 'active', matches: [] },
  { id: '5', name: 'Necrofiend', rank: 'Divine', mmr: 8300, status: 'eliminated', matches: [] },
  { id: '6', name: 'Voidwalker', rank: 'Immortal', mmr: 9000, status: 'active', matches: [] },
  { id: '7', name: 'Raze Lord', rank: 'Divine', mmr: 8400, status: 'active', matches: [] },
  { id: '8', name: 'Dark Presence', rank: 'Immortal', mmr: 8700, status: 'active', matches: [] },
];

const defaultNews: NewsItem[] = [
  { id: '1', title: 'Ghouls Cup анонсирован', content: 'Подпольный турнир для тех, кто не боится тьмы. 1v1 Shadow Fiend. Только скилл. Только мид.', date: '2026-03-28' },
  { id: '2', title: 'Регистрация открыта', content: 'Если считаешь себя достойным — докажи. Слоты ограничены. Слабых не ждём.', date: '2026-03-29' },
  { id: '3', title: 'Demon King доминирует', content: 'Первый раунд завершён. Demon King уничтожил оппонента за 8 минут. Без шансов.', date: '2026-03-30' },
];

const defaultSchedule: MatchItem[] = [
  { id: '1', player1: 'Demon King', player2: 'Necrofiend', time: '18:00', date: '2026-04-01', status: 'finished', score: '2-0', round: 'Четвертьфинал' },
  { id: '2', player1: 'Soul Reaper', player2: 'Raze Lord', time: '19:00', date: '2026-04-01', status: 'finished', score: '2-1', round: 'Четвертьфинал' },
  { id: '3', player1: 'Shadow Spawn', player2: 'Dark Presence', time: '20:00', date: '2026-04-02', status: 'upcoming', round: 'Полуфинал' },
  { id: '4', player1: 'Demon King', player2: 'Soul Reaper', time: '21:00', date: '2026-04-03', status: 'upcoming', round: 'Финал' },
];

const defaultBracket: BracketMatch[] = [
  { id: 'b1', round: 1, position: 0, player1: 'Demon King', player2: 'Necrofiend', winner: 'Demon King', score: '2-0' },
  { id: 'b2', round: 1, position: 1, player1: 'Soul Reaper', player2: 'Raze Lord', winner: 'Soul Reaper', score: '2-1' },
  { id: 'b3', round: 1, position: 2, player1: 'Shadow Spawn', player2: 'Dark Presence' },
  { id: 'b4', round: 1, position: 3, player1: 'Voidwalker', player2: 'Requiem' },
  { id: 'b5', round: 2, position: 0, player1: 'Demon King', player2: 'Soul Reaper' },
  { id: 'b6', round: 2, position: 1 },
  { id: 'b7', round: 3, position: 0 },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      adminPassword: 'ghoulscup666',
      editMode: false,
      glitchEnabled: true,
      cursorTrailEnabled: true,
      soundsEnabled: false,
      players: defaultPlayers,
      news: defaultNews,
      schedule: defaultSchedule,
      bracket: defaultBracket,
      top3: [
        { place: 1, name: 'Demon King' },
        { place: 2, name: 'Soul Reaper' },
        { place: 3, name: 'Shadow Spawn' },
      ],
      texts: {
        heroTitle: 'GHOULS CUP',
        heroSubtitle: '1v1 Shadow Fiend — только скилл, только мид',
        heroQuote: '«если слаб — не заходи»',
        registrationUrl: '#',
        rulesUrl: '#',
        top3Title: 'ТОП-3',
        quote1: '«ты точно готов?»',
        quote2: '«ошибок не будет»',
        quote3: '«mid решает всё»',
        quote4: '«докажи или уходи»',
        statMatchesValue: '24',
        statMatchesLabel: 'Матчей',
        statPlayersValue: '8',
        statPlayersLabel: 'Игроков',
        statPrizeValue: '$500',
        statPrizeLabel: 'Призовой',
        statRoundsValue: '3',
        statRoundsLabel: 'Раундов',
      },

      login: (user, pass) => {
        if (user === 'admin' && pass === get().adminPassword) {
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
      updateText: (key, value) => set((s) => ({ texts: { ...s.texts, [key]: value } })),
    }),
    { name: 'ghouls-cup-store' }
  )
);
