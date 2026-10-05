export type MoodType = 
  | 'ecstatic' 
  | 'joyful' 
  | 'calm' 
  | 'thoughtful' 
  | 'focused' 
  | 'neutral' 
  | 'anxious' 
  | 'exhausted' 
  | 'melancholy';

export interface MoodMeta {
  type: MoodType;
  label: string;
  emoji: string;
  score: number; // 1 to 10 scale
  color: string;
}

export const MOODS: Record<MoodType, MoodMeta> = {
  ecstatic: { type: 'ecstatic', label: 'Radiant', emoji: '✨', score: 10, color: '#f59e0b' },
  joyful: { type: 'joyful', label: 'Joyful', emoji: '☀️', score: 9, color: '#eab308' },
  calm: { type: 'calm', label: 'Serene', emoji: '🍃', score: 8, color: '#10b981' },
  focused: { type: 'focused', label: 'Deep Focus', emoji: '⚡', score: 8, color: '#3b82f6' },
  thoughtful: { type: 'thoughtful', label: 'Reflective', emoji: '🌙', score: 7, color: '#8b5cf6' },
  neutral: { type: 'neutral', label: 'Balanced', emoji: '⚖️', score: 5, color: '#64748b' },
  anxious: { type: 'anxious', label: 'Restless', emoji: '🌀', score: 4, color: '#f97316' },
  exhausted: { type: 'exhausted', label: 'Drained', emoji: '🔋', score: 3, color: '#a855f7' },
  melancholy: { type: 'melancholy', label: 'Heavy', emoji: '🌧️', score: 2, color: '#64748b' },
};

export type WeatherType = 'sunny' | 'partly-cloudy' | 'rainy' | 'stormy' | 'snowy' | 'misty' | 'clear-night';

export interface WeatherMeta {
  type: WeatherType;
  label: string;
  iconName: string;
}

export interface StudyMetadata {
  subject: string;
  topic: string;
  durationMinutes: number;
  keyTakeaways: string[];
  comprehensionRating: number; // 1 to 5
  nextAction?: string;
}

export interface MemorableMomentMeta {
  isMilestone: boolean;
  category: 'life_journey' | 'study_victory' | 'travel_adventure' | 'connection' | 'insight';
  photoUrl?: string;
  photoCaption?: string;
  locationName?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string; // HTML markup containing headings, lists, quotes, images, checklists
  plainText: string;
  date: string; // ISO date YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
  mood: MoodType;
  moodScore: number;
  energyLevel: number; // 1-5
  weather?: WeatherType;
  location?: string;
  tags: string[];
  isPinned?: boolean;
  isStudyLog?: boolean;
  studyData?: StudyMetadata;
  memorableMoment?: MemorableMomentMeta;
  promptQuestion?: string;
  wordCount: number;
  characterCount: number;
  readTimeMinutes: number;
  isEncrypted?: boolean;
}

export interface DailyPrompt {
  id: string;
  category: 'Gratitude' | 'Study & Craft' | 'Self-Discovery' | 'Deep Thinking' | 'Memory & Past' | 'Evening Peace';
  question: string;
  spark: string;
}

export type AppTheme = 'obsidian' | 'paper' | 'midnight' | 'forest' | 'minimal';
export type AppFont = 'serif' | 'sans' | 'mono';

export interface VaultState {
  isConfigured: boolean;
  isUnlocked: boolean;
  saltBase64?: string;
  verifierHash?: string;
  lastActiveTimestamp?: number;
  autoLockMinutes: number;
  keyHint?: string;
}

export interface EncryptedExportPayload {
  version: number;
  appName: string;
  exportedAt: string;
  salt: string;
  iv: string;
  ciphertext: string;
  checksum: string;
}
