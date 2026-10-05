import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  BookOpen,
  Calendar,
  Pin,
  Clock,
  ArrowUpDown,
  Tag as TagIcon,
  Smile,
  Compass,
  History
} from 'lucide-react';
import { JournalEntry, MOODS, MoodType } from '../../types/journal';

interface JournalListViewProps {
  entries: JournalEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const JournalListView: React.FC<JournalListViewProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  onTogglePin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'study' | 'memories' | 'pinned'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((e) => {
      e.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [entries]);

  // "On This Day" throwback check
  const onThisDayEntries = useMemo(() => {
    const today = new Date();
    const currentMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return entries.filter((e) => {
      const parts = e.date.split('-');
      if (parts.length >= 3) {
        const entryMonthDay = `${parts[1]}-${parts[2]}`;
        return entryMonthDay === currentMonthDay && e.date !== today.toISOString().split('T')[0];
      }
      return false;
    });
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return entries.filter((entry) => {
      // Search matching
      if (q) {
        const matchesTitle = entry.title.toLowerCase().includes(q);
        const matchesContent = entry.plainText.toLowerCase().includes(q);
        const matchesTags = entry.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesStudy = entry.studyData?.subject?.toLowerCase().includes(q) || entry.studyData?.topic?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesTags && !matchesStudy) {
          return false;
        }
      }

      // Mood filter
      if (selectedMood !== 'all' && entry.mood !== selectedMood) {
        return false;
      }

      // Type filter
      if (filterType === 'study' && !entry.isStudyLog) return false;
      if (filterType === 'memories' && !entry.memorableMoment?.isMilestone && !entry.tags.includes('memory')) return false;
      if (filterType === 'pinned' && !entry.isPinned) return false;

      // Tag filter
      if (selectedTag && !entry.tags?.includes(selectedTag)) return false;

      return true;
    });
  }, [entries, searchQuery, selectedMood, filterType, selectedTag]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Search & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
            Journal Chronicles & Study Records
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            {entries.length} reflections stored securely in your private vault
          </p>
        </div>

        <button
          onClick={onNewEntry}
          className="px-4 py-2 rounded-xl bg-[var(--accent)] text-black text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Chronicle</span>
        </button>
      </div>

      {/* On This Day Throwback Banner */}
      {onThisDayEntries.length > 0 && (
        <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--accent)]/30 flex items-start gap-3 relative overflow-hidden">
          <div className="p-2 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-[var(--accent)] flex items-center gap-1.5">
              <span>On This Day Throwback</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              You wrote &ldquo;{onThisDayEntries[0].title}&rdquo; exactly on this calendar date in a previous chapter.
            </p>
            <button
              onClick={() => onSelectEntry(onThisDayEntries[0])}
              className="mt-2 text-xs text-[var(--text-primary)] hover:text-[var(--accent)] font-medium underline flex items-center gap-1"
            >
              Revisit past reflection
            </button>
          </div>
        </div>
      )}

      {/* Search Input & Segmented Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Instant offline search in titles, concepts, notes, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Segmented type buttons */}
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-[var(--accent)] text-black font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All Chronicles
            </button>
            <button
              onClick={() => setFilterType('study')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'study'
                  ? 'bg-[var(--accent)] text-black font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Study Logs
            </button>
            <button
              onClick={() => setFilterType('memories')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'memories'
                  ? 'bg-[var(--accent)] text-black font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Memories
            </button>
            <button
              onClick={() => setFilterType('pinned')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'pinned'
                  ? 'bg-[var(--accent)] text-black font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Pinned
            </button>
          </div>

          {/* Mood filter selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              <option value="all">All Moods</option>
              {Object.values(MOODS).map((m) => (
                <option key={m.type} value={m.type}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>

            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-xs px-2 py-1 rounded bg-[var(--accent-soft)] text-[var(--accent)] flex items-center gap-1"
              >
                <span>#{selectedTag}</span>
                <span>×</span>
              </button>
            )}
          </div>
        </div>

        {/* Tag pills filter bar if tags exist */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-[var(--text-muted)]">
            <span className="text-[11px] shrink-0 font-medium">Filter tag:</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? 'bg-[var(--accent)] text-black font-semibold'
                    : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entry Cards List */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No Chronicles Found</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No journals match "${searchQuery}". Try a different keyword.`
              : 'Your vault is ready. Write your very first chronicle today.'}
          </p>
          <button
            onClick={onNewEntry}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Create New Entry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const moodMeta = MOODS[entry.mood] || MOODS.calm;
            const isSelected = entry.id === selectedEntryId;

            return (
              <article
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className={`group cursor-pointer rounded-2xl p-5 sm:p-6 bg-[var(--bg-surface)] border transition-all duration-200 hover:border-[var(--accent)] hover:shadow-md ${
                  isSelected ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/30' : 'border-[var(--border-subtle)]'
                }`}
              >
                {/* Header row: Zero-pill discipline metadata with subtle typographic separators */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[var(--text-secondary)]">{entry.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <span>{moodMeta.emoji}</span>
                      <span className="text-[var(--text-secondary)]">{moodMeta.label}</span>
                    </span>
                    {entry.isStudyLog && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 font-medium">Study Log</span>
                      </>
                    )}
                    {entry.memorableMoment?.isMilestone && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-400 font-medium">Milestone</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{entry.readTimeMinutes} min read</span>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(entry.id);
                      }}
                      className={`p-1 rounded hover:bg-[var(--bg-surface-elevated)] ${
                        entry.isPinned ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                      }`}
                      title={entry.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-base sm:text-lg font-serif font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                  {entry.title || 'Untitled Chronicle'}
                </h2>

                {/* Excerpt */}
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 line-clamp-2 leading-relaxed">
                  {entry.plainText}
                </p>

                {/* Study block summary if present */}
                {entry.isStudyLog && entry.studyData && (
                  <div className="mt-3 p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs">
                    <div className="flex items-center justify-between text-[var(--text-primary)] font-medium">
                      <span>Subject: {entry.studyData.subject}</span>
                      <span className="font-mono text-[var(--text-muted)] text-[11px]">{entry.studyData.durationMinutes} min</span>
                    </div>
                    {entry.studyData.keyTakeaways?.[0] && (
                      <div className="text-[11px] text-[var(--text-muted)] mt-1 italic line-clamp-1">
                        Takeaway: {entry.studyData.keyTakeaways[0]}
                      </div>
                    )}
                  </div>
                )}

                {/* Tags footer */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]/60 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <TagIcon className="w-3 h-3 text-[var(--text-muted)]" />
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((t) => (
                        <span key={t} className="hover:text-[var(--text-primary)]">
                          #{t}
                        </span>
                      ))}
                    </div>
                    {entry.location && (
                      <span className="ml-auto text-[11px] text-[var(--text-muted)]">
                        📍 {entry.location}
                      </span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
