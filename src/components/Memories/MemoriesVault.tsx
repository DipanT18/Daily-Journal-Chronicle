import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  MapPin,
  Calendar,
  Plus,
  X,
  ExternalLink,
  Tag,
  Compass,
  Heart,
  ChevronRight
} from 'lucide-react';
import { JournalEntry } from '../../types/journal';

interface MemoriesVaultProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onNewMemory: () => void;
}

export const MemoriesVault: React.FC<MemoriesVaultProps> = ({
  entries,
  onSelectEntry,
  onNewMemory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; caption?: string } | null>(null);

  // Filter memorable entries
  const memoryEntries = entries.filter((e) => {
    const isMemory = Boolean(e.memorableMoment?.isMilestone || e.tags.includes('memory') || e.tags.includes('milestone'));
    if (!isMemory) return false;
    if (selectedCategory === 'all') return true;
    return e.memorableMoment?.category === selectedCategory;
  });

  const categories = [
    { id: 'all', label: 'All Milestones' },
    { id: 'travel_adventure', label: 'Travel & Solitude' },
    { id: 'study_victory', label: 'Study Victories' },
    { id: 'life_journey', label: 'Life Journey' },
    { id: 'insight', label: 'Deep Insights' },
    { id: 'connection', label: 'Human Connections' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
            Memories & Milestones Sanctuary
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Visual tokens of moments that altered your inner world. Photos, places, and turning points.
          </p>
        </div>

        <button
          onClick={onNewMemory}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Capture Memorable Moment</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === c.id
                ? 'bg-[var(--accent)] text-black font-semibold'
                : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Memory Cards Grid */}
      {memoryEntries.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto mb-3">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No memories found in this category</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            When creating an entry, tag it as a memorable moment or paste a photograph to permanently archive it here.
          </p>
          <button
            onClick={onNewMemory}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Memory</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memoryEntries.map((m) => (
            <div
              key={m.id}
              className="group rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all overflow-hidden flex flex-col justify-between shadow-sm"
            >
              <div>
                {/* Photo showcase */}
                {m.memorableMoment?.photoUrl ? (
                  <div
                    className="relative aspect-4/3 overflow-hidden bg-black/20 cursor-zoom-in"
                    onClick={() =>
                      setLightboxImage({
                        url: m.memorableMoment!.photoUrl!,
                        title: m.title,
                        caption: m.memorableMoment?.photoCaption,
                      })
                    }
                  >
                    <img
                      src={m.memorableMoment.photoUrl}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-[11px] text-white/90">Click to expand image</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[var(--bg-surface-elevated)]/50 border-b border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                      Written Turning Point
                    </span>
                  </div>
                )}

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-[11px] text-[var(--accent)] font-medium mb-1.5">
                    <span className="uppercase tracking-wider">
                      {m.memorableMoment?.category?.replace('_', ' ') || 'Milestone'}
                    </span>
                    {m.memorableMoment?.locationName && (
                      <span className="text-[var(--text-muted)] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{m.memorableMoment.locationName}</span>
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => onSelectEntry(m)}
                    className="text-base font-serif font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors cursor-pointer line-clamp-1"
                  >
                    {m.title}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-3 leading-relaxed">
                    {m.memorableMoment?.photoCaption || m.plainText}
                  </p>
                </div>
              </div>

              {/* Bottom footer */}
              <div className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/30 flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{m.date}</span>
                </span>

                <button
                  onClick={() => onSelectEntry(m)}
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Open Chronicle</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] flex flex-col items-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-[75vh] w-auto rounded-xl object-contain border border-white/20 shadow-2xl"
            />
            <div className="text-center mt-3 text-white">
              <h3 className="text-sm font-semibold">{lightboxImage.title}</h3>
              {lightboxImage.caption && (
                <p className="text-xs text-white/70 italic mt-0.5">{lightboxImage.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
