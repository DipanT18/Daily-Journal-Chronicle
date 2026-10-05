import React, { useMemo } from 'react';
import {
  Flame,
  PenTool,
  Clock,
  Sparkles,
  BookOpen,
  Calendar,
  Smile,
  Compass,
  Zap,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { JournalEntry, MOODS, MoodType } from '../../types/journal';

interface SmartDashboardProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
}

export const SmartDashboard: React.FC<SmartDashboardProps> = ({
  entries,
  onSelectEntry,
  onNewEntry,
}) => {
  // Compute analytics
  const analytics = useMemo(() => {
    let totalWords = 0;
    let totalStudyMinutes = 0;
    const moodCounts: Partial<Record<MoodType, number>> = {};
    const studySubjectCounts: Record<string, number> = {};
    let memorableMomentsCount = 0;

    // Date frequency map for heatmap
    const dateMap: Record<string, { count: number; words: number }> = {};

    entries.forEach((e) => {
      totalWords += e.wordCount || 0;
      if (e.isStudyLog && e.studyData?.durationMinutes) {
        totalStudyMinutes += e.studyData.durationMinutes;
        const subj = e.studyData.subject || 'General Study';
        studySubjectCounts[subj] = (studySubjectCounts[subj] || 0) + e.studyData.durationMinutes;
      }
      if (e.memorableMoment?.isMilestone || e.tags.includes('memory')) {
        memorableMomentsCount++;
      }
      if (e.mood) {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      }

      const dateStr = e.date;
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { count: 0, words: 0 };
      }
      dateMap[dateStr].count += 1;
      dateMap[dateStr].words += e.wordCount || 0;
    });

    // Calculate streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      if (dateMap[iso] && dateMap[iso].count > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Generate last 60 days heatmap tiles
    const heatmapDays: { dateStr: string; dayNum: number; count: number; words: number }[] = [];
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      heatmapDays.push({
        dateStr: iso,
        dayNum: d.getDate(),
        count: dateMap[iso]?.count || 0,
        words: dateMap[iso]?.words || 0,
      });
    }

    return {
      totalWords,
      totalEntries: entries.length,
      avgWordsPerEntry: entries.length ? Math.round(totalWords / entries.length) : 0,
      totalStudyHours: (totalStudyMinutes / 60).toFixed(1),
      streak,
      moodCounts,
      studySubjectCounts,
      memorableMomentsCount,
      heatmapDays,
    };
  }, [entries]);

  // Find memorable highlights
  const memoryEntries = useMemo(() => {
    return entries.filter(
      (e) => e.memorableMoment?.isMilestone || e.tags.includes('memory') || e.tags.includes('milestone')
    );
  }, [entries]);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Editorial Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            Personal Sanctuary & Intellect Matrix
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] leading-tight">
            The Chronicle of Your Growth & Insights
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Every entry is a brick in your intellectual cathedral. Fully encrypted, synchronized locally, and preserved for the years ahead.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={onNewEntry}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Write Today&apos;s Chronicle</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
          <img
            src="/src/assets/images/journal_writing_desk_1791160915043.jpg"
            alt="Writing desk ambient"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-surface)] to-transparent" />
        </div>
      </div>

      {/* Core Quantitative Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Writing Velocity</span>
            <PenTool className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-[var(--text-primary)]">
              {analytics.totalWords.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              words across {analytics.totalEntries} entries
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Consistency Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-[var(--text-primary)] flex items-baseline gap-1.5">
              <span>{analytics.streak}</span>
              <span className="text-xs font-sans font-normal text-[var(--text-muted)]">consecutive days</span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              {analytics.streak >= 3 ? 'Unbroken momentum' : 'Write today to continue'}
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Study Deep Work</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-[var(--text-primary)] flex items-baseline gap-1.5">
              <span>{analytics.totalStudyHours}</span>
              <span className="text-xs font-sans font-normal text-[var(--text-muted)]">hours logged</span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              structured study logs
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Memory Vault</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-[var(--text-primary)]">
              {analytics.memorableMomentsCount}
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              memorable moments & milestones
            </div>
          </div>
        </div>
      </div>

      {/* Activity Heatmap Grid */}
      <div className="rounded-2xl p-5 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              60-Day Rhythm & Consistency Grid
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Visualizing daily writing concentration and reflective practice
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent)]/30" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent)]/60" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent)]" />
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 gap-1.5">
          {analytics.heatmapDays.map((tile) => {
            let bgClass = 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)]';
            if (tile.words > 300) {
              bgClass = 'bg-[var(--accent)] text-black border-transparent shadow-sm';
            } else if (tile.words > 150) {
              bgClass = 'bg-[var(--accent)]/70 text-black border-transparent';
            } else if (tile.words > 0 || tile.count > 0) {
              bgClass = 'bg-[var(--accent)]/30 border-transparent';
            }

            return (
              <div
                key={tile.dateStr}
                title={`${tile.dateStr}: ${tile.words} words (${tile.count} entries)`}
                className={`h-7 rounded-sm border flex items-center justify-center text-[10px] font-mono cursor-pointer transition-transform hover:scale-110 ${bgClass}`}
              >
                {tile.dayNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Mood Spectrum & Study Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <div className="rounded-2xl p-5 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Smile className="w-4 h-4 text-[var(--accent)]" />
              <span>Emotional Resonance & Moods</span>
            </h2>
            <span className="text-[11px] text-[var(--text-muted)]">Cumulative</span>
          </div>

          <div className="space-y-3">
            {Object.values(MOODS).map((m) => {
              const count = analytics.moodCounts[m.type] || 0;
              const percentage = entries.length ? Math.round((count / entries.length) * 100) : 0;
              return (
                <div key={m.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-surface-elevated)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: m.color || 'var(--accent)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Study Subject Allocation */}
        <div className="rounded-2xl p-5 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Study Subjects & Focus Areas</span>
              </h2>
              <span className="text-[11px] text-[var(--text-muted)]">Time Invested</span>
            </div>

            {Object.keys(analytics.studySubjectCounts).length > 0 ? (
              <div className="space-y-3.5">
                {Object.entries(analytics.studySubjectCounts).map(([subject, minutes]) => (
                  <div key={subject} className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between text-xs font-medium text-[var(--text-primary)]">
                      <span>{subject}</span>
                      <span className="font-mono text-[11px] text-[var(--accent)] tabular-nums">
                        {Math.floor(minutes / 60)}h {minutes % 60}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                No study logs recorded yet. Toggle &ldquo;Study Log&rdquo; when writing to track research sessions.
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Average Depth</span>
            <span className="font-mono text-[var(--text-secondary)]">{analytics.avgWordsPerEntry} words / session</span>
          </div>
        </div>
      </div>

      {/* Memorable Moments Showcase */}
      {memoryEntries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Memorable Moments & Milestones</span>
            </h2>
            <span className="text-xs text-[var(--text-muted)]">{memoryEntries.length} memories captured</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memoryEntries.map((m) => (
              <div
                key={m.id}
                onClick={() => onSelectEntry(m)}
                className="group cursor-pointer rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all overflow-hidden p-4 flex flex-col justify-between"
              >
                <div>
                  {m.memorableMoment?.photoUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-3 border border-[var(--border-subtle)]">
                      <img
                        src={m.memorableMoment.photoUrl}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="text-xs text-[var(--accent)] font-medium mb-1">
                    {m.memorableMoment?.category?.replace('_', ' ') || 'Milestone'}
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">
                    {m.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                    {m.memorableMoment?.photoCaption || m.plainText}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>{m.date}</span>
                  <span>{m.location || 'Sanctuary'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
