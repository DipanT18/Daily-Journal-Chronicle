import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Trash2,
  Share2,
  Calendar,
  Smile,
  Zap,
  CloudSun,
  MapPin,
  Tag,
  BookOpen,
  Camera,
  Sparkles,
  Check,
  CheckCircle2,
  RefreshCw,
  Clock,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { JournalEntry, MOODS, MoodType, WeatherType, DailyPrompt } from '../../types/journal';
import { RichEditor } from './RichEditor';
import { DAILY_PROMPTS, getRandomPrompt } from '../../data/prompts';

interface EntryEditorPageProps {
  entry: JournalEntry;
  onSave: (updatedEntry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  isNew?: boolean;
}

export const EntryEditorPage: React.FC<EntryEditorPageProps> = ({
  entry: initialEntry,
  onSave,
  onDelete,
  onBack,
  isNew = false,
}) => {
  const [entry, setEntry] = useState<JournalEntry>(initialEntry);
  const [isSaved, setIsSaved] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'study' | 'memory' | 'prompts'>('editor');
  const [tagInput, setTagInput] = useState('');
  const [isZenMode, setIsZenMode] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<DailyPrompt>(() => getRandomPrompt());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if initialEntry changes
  useEffect(() => {
    setEntry(initialEntry);
  }, [initialEntry.id]);

  // Debounced auto-save
  const triggerAutoSave = (updated: JournalEntry) => {
    setIsSaved(false);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      onSave(updated);
      setIsSaved(true);
    }, 700);
  };

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    const updated = { ...entry, title: newTitle, updatedAt: Date.now() };
    setEntry(updated);
    triggerAutoSave(updated);
  };

  // Handle rich editor content change
  const handleContentChange = (
    html: string,
    plainText: string,
    wordCount: number,
    charCount: number
  ) => {
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    const updated = {
      ...entry,
      content: html,
      plainText,
      wordCount,
      characterCount: charCount,
      readTimeMinutes,
      updatedAt: Date.now(),
    };
    setEntry(updated);
    triggerAutoSave(updated);
  };

  // Handle mood selection
  const handleMoodSelect = (mood: MoodType) => {
    const moodMeta = MOODS[mood];
    const updated = {
      ...entry,
      mood,
      moodScore: moodMeta.score,
      updatedAt: Date.now(),
    };
    setEntry(updated);
    triggerAutoSave(updated);
  };

  // Handle Tag addition
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '');
      if (!entry.tags.includes(cleanTag)) {
        const updated = {
          ...entry,
          tags: [...entry.tags, cleanTag],
          updatedAt: Date.now(),
        };
        setEntry(updated);
        triggerAutoSave(updated);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = {
      ...entry,
      tags: entry.tags.filter((t) => t !== tagToRemove),
      updatedAt: Date.now(),
    };
    setEntry(updated);
    triggerAutoSave(updated);
  };

  return (
    <div
      className={`min-h-screen bg-[var(--bg-primary)] transition-all ${
        isZenMode ? 'p-4 sm:p-8 max-w-4xl mx-auto' : 'p-4 sm:p-6 max-w-5xl mx-auto'
      }`}
    >
      {/* Top Navigation & Status Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Return to Chronicles"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="font-mono text-[var(--text-secondary)]">{entry.date}</span>
            <span aria-hidden="true">·</span>
            <span>{entry.wordCount} words</span>
            <span aria-hidden="true">·</span>
            <span>{entry.readTimeMinutes} min read</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mr-2">
            {isSaved ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Encrypted & Saved</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[var(--accent)] animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Encrypting...</span>
              </span>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-400 transition-colors"
            title="Delete Chronicle"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Zen Mode Button */}
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="p-2 rounded-lg hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title={isZenMode ? 'Exit Zen Mode' : 'Distraction-free Mode'}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Two-Zone Interface or Zen Column */}
      <div className="space-y-6">
        {/* Entry Title & Metadata Controls */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Title of this Chronicle or Study Session..."
            value={entry.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] bg-transparent border-none outline-none focus:outline-none placeholder:text-[var(--text-muted)]/50 tracking-tight"
          />

          {/* Context Ribbon (Mood, Weather, Energy) */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            {/* Mood selector dropdown */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-muted)] pl-1.5">Mood:</span>
              <select
                value={entry.mood}
                onChange={(e) => handleMoodSelect(e.target.value as MoodType)}
                className="bg-transparent text-[var(--text-primary)] font-medium outline-none cursor-pointer pr-1"
              >
                {Object.values(MOODS).map((m) => (
                  <option key={m.type} value={m.type} className="bg-[var(--bg-surface)]">
                    {m.emoji} {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Energy Slider */}
            <div className="flex items-center gap-1.5 p-1.5 px-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-[var(--text-muted)]">Energy:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      const updated = { ...entry, energyLevel: lvl, updatedAt: Date.now() };
                      setEntry(updated);
                      triggerAutoSave(updated);
                    }}
                    className={`w-4 h-4 rounded text-[10px] font-mono flex items-center justify-center transition-colors ${
                      entry.energyLevel >= lvl
                        ? 'bg-[var(--accent)] text-black font-bold'
                        : 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Weather selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <CloudSun className="w-3.5 h-3.5 text-sky-400 pl-0.5" />
              <select
                value={entry.weather || 'sunny'}
                onChange={(e) => {
                  const updated = { ...entry, weather: e.target.value as WeatherType, updatedAt: Date.now() };
                  setEntry(updated);
                  triggerAutoSave(updated);
                }}
                className="bg-transparent text-[var(--text-primary)] font-medium outline-none cursor-pointer text-xs pr-1"
              >
                <option value="sunny" className="bg-[var(--bg-surface)]">☀️ Sunny</option>
                <option value="partly-cloudy" className="bg-[var(--bg-surface)]">⛅ Partly Cloudy</option>
                <option value="rainy" className="bg-[var(--bg-surface)]">🌧️ Rainy</option>
                <option value="clear-night" className="bg-[var(--bg-surface)]">🌙 Clear Night</option>
                <option value="misty" className="bg-[var(--bg-surface)]">🌫️ Misty / Fog</option>
                <option value="snowy" className="bg-[var(--bg-surface)]">❄️ Snowy</option>
              </select>
            </div>

            {/* Location tag */}
            <div className="flex items-center gap-1.5 p-1 px-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Study sanctuary location"
                value={entry.location || ''}
                onChange={(e) => {
                  const updated = { ...entry, location: e.target.value, updatedAt: Date.now() };
                  setEntry(updated);
                  triggerAutoSave(updated);
                }}
                className="bg-transparent text-xs text-[var(--text-primary)] outline-none w-32 placeholder:text-[var(--text-muted)]/50"
              />
            </div>
          </div>
        </div>

        {/* Feature Trays Selector */}
        {!isZenMode && (
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs">
            <button
              onClick={() => setActiveTab(activeTab === 'study' ? 'editor' : 'study')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                entry.isStudyLog || activeTab === 'study'
                  ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study Tracker {entry.isStudyLog ? '✓' : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'memory' ? 'editor' : 'memory')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                entry.memorableMoment?.isMilestone || activeTab === 'memory'
                  ? 'bg-amber-500/15 text-amber-400 font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Memorable Moment {entry.memorableMoment?.isMilestone ? '✓' : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'prompts' ? 'editor' : 'prompts')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'prompts'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Prompts</span>
            </button>
          </div>
        )}

        {/* Study Metadata Drawer */}
        {activeTab === 'study' && (
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-emerald-500/30 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <BookOpen className="w-4 h-4" />
                <span>Study & Research Metadata</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={Boolean(entry.isStudyLog)}
                  onChange={(e) => {
                    const isStudy = e.target.checked;
                    const updated = {
                      ...entry,
                      isStudyLog: isStudy,
                      studyData: isStudy
                        ? entry.studyData || {
                            subject: 'Computer Science & Architecture',
                            topic: 'Cryptographic Primitives',
                            durationMinutes: 60,
                            keyTakeaways: ['Active recall reinforces conceptual schema'],
                            comprehensionRating: 4,
                          }
                        : undefined,
                    };
                    setEntry(updated);
                    triggerAutoSave(updated);
                  }}
                  className="accent-emerald-500 rounded"
                />
                <span>Classify as Study Log</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                  Subject / Discipline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Neuroscience, Philosophy, Rust"
                  value={entry.studyData?.subject || ''}
                  onChange={(e) => {
                    const updated = {
                      ...entry,
                      isStudyLog: true,
                      studyData: {
                        ...(entry.studyData || {
                          subject: '',
                          topic: '',
                          durationMinutes: 45,
                          keyTakeaways: [],
                          comprehensionRating: 4,
                        }),
                        subject: e.target.value,
                      },
                    };
                    setEntry(updated);
                    triggerAutoSave(updated);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                  Core Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. AES Encryption, Synaptic Plasticity"
                  value={entry.studyData?.topic || ''}
                  onChange={(e) => {
                    const updated = {
                      ...entry,
                      isStudyLog: true,
                      studyData: {
                        ...(entry.studyData || {
                          subject: '',
                          topic: '',
                          durationMinutes: 45,
                          keyTakeaways: [],
                          comprehensionRating: 4,
                        }),
                        topic: e.target.value,
                      },
                    };
                    setEntry(updated);
                    triggerAutoSave(updated);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={entry.studyData?.durationMinutes || 45}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    const updated = {
                      ...entry,
                      isStudyLog: true,
                      studyData: {
                        ...(entry.studyData || {
                          subject: '',
                          topic: '',
                          durationMinutes: 45,
                          keyTakeaways: [],
                          comprehensionRating: 4,
                        }),
                        durationMinutes: val,
                      },
                    };
                    setEntry(updated);
                    triggerAutoSave(updated);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Memorable Moment Drawer */}
        {activeTab === 'memory' && (
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-amber-500/30 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Camera className="w-4 h-4" />
                <span>Milestone & Memory Configuration</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={Boolean(entry.memorableMoment?.isMilestone)}
                  onChange={(e) => {
                    const isMilestone = e.target.checked;
                    const updated = {
                      ...entry,
                      memorableMoment: isMilestone
                        ? entry.memorableMoment || {
                            isMilestone: true,
                            category: 'travel_adventure',
                            photoCaption: 'A turning point moment',
                          }
                        : undefined,
                    };
                    setEntry(updated);
                    triggerAutoSave(updated);
                  }}
                  className="accent-amber-500 rounded"
                />
                <span>Feature in Memory Vault</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                  Milestone Category
                </label>
                <select
                  value={entry.memorableMoment?.category || 'travel_adventure'}
                  onChange={(e) => {
                    const updated = {
                      ...entry,
                      memorableMoment: {
                        ...(entry.memorableMoment || { isMilestone: true, photoCaption: '' }),
                        isMilestone: true,
                        category: e.target.value as any,
                      },
                    };
                    setEntry(updated);
                    triggerAutoSave(updated);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="travel_adventure">Travel & Nature Solitude</option>
                  <option value="study_victory">Study Victory / Breakthrough</option>
                  <option value="life_journey">Personal Life Journey</option>
                  <option value="insight">Deep Intellectual Insight</option>
                  <option value="connection">Meaningful Human Connection</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                  Photo URL or Paste into Document
                </label>
                <input
                  type="text"
                  placeholder="https://... or base64"
                  value={entry.memorableMoment?.photoUrl || ''}
                  onChange={(e) => {
                    const updated = {
                      ...entry,
                      memorableMoment: {
                        ...(entry.memorableMoment || { isMilestone: true, category: 'travel_adventure' }),
                        isMilestone: true,
                        photoUrl: e.target.value,
                      },
                    };
                    setEntry(updated);
                    triggerAutoSave(updated);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Daily Prompts Drawer */}
        {activeTab === 'prompts' && (
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent)]/30 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--accent)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Daily Prompt</span>
              </span>
              <button
                type="button"
                onClick={() => setCurrentPrompt(getRandomPrompt())}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Shuffle Prompt</span>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--accent)] font-semibold uppercase tracking-wider">
                {currentPrompt.category}
              </span>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{currentPrompt.question}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 italic">Spark: {currentPrompt.spark}</p>
            </div>
          </div>
        )}

        {/* The Rich Modern Editor Surface */}
        <RichEditor
          content={entry.content}
          onChange={handleContentChange}
          availablePrompts={DAILY_PROMPTS}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(!isZenMode)}
        />

        {/* Tags Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <Tag className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          {entry.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
            >
              <span>#{t}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(t)}
                className="hover:text-rose-400 text-[10px] ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag (Press Enter)..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="px-2.5 py-1 rounded-md bg-transparent border border-dashed border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]/50"
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-[var(--bg-surface)] border border-rose-500/30 p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-rose-400 mb-2">Delete this chronicle?</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              This will permanently purge this entry from your encrypted local vault. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
