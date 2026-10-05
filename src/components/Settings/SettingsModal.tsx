import React from 'react';
import {
  X,
  Palette,
  Type,
  Lock,
  Shield,
  Wifi,
  WifiOff,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';
import { AppTheme, AppFont, VaultState } from '../../types/journal';

interface SettingsModalProps {
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  currentFont: AppFont;
  onSelectFont: (font: AppFont) => void;
  vaultState: VaultState;
  onUpdateVaultState: (state: VaultState) => void;
  isOnline: boolean;
  onLockVault: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentTheme,
  onSelectTheme,
  currentFont,
  onSelectFont,
  vaultState,
  onUpdateVaultState,
  isOnline,
  onLockVault,
  onClose,
}) => {
  const themes: { id: AppTheme; name: string; desc: string; bg: string; text: string; accent: string }[] = [
    {
      id: 'obsidian',
      name: 'Obsidian OLED',
      desc: 'Pitch-black contrast with golden amber glow. Best for night writing.',
      bg: '#070709',
      text: '#f4f4f7',
      accent: '#e5a93b',
    },
    {
      id: 'paper',
      name: 'Archival Paper',
      desc: 'Warm organic cream with espresso typography. Gentle on the eyes.',
      bg: '#fbf8f3',
      text: '#211c18',
      accent: '#a3542f',
    },
    {
      id: 'midnight',
      name: 'Midnight Navy',
      desc: 'Deep indigo night sky with electric sky-blue accents.',
      bg: '#080d1a',
      text: '#f1f5f9',
      accent: '#38bdf8',
    },
    {
      id: 'forest',
      name: 'Evergreen Forest',
      desc: 'Pine shadows and moss green highlights for quiet focus.',
      bg: '#07120b',
      text: '#eaf5ee',
      accent: '#34d399',
    },
    {
      id: 'minimal',
      name: 'Minimal Daylight',
      desc: 'Crisp, Scandinavian high-contrast daylight aesthetic.',
      bg: '#ffffff',
      text: '#0f172a',
      accent: '#2563eb',
    },
  ];

  const fonts: { id: AppFont; name: string; sample: string; desc: string }[] = [
    {
      id: 'serif',
      name: 'Instrument & Newsreader Serif',
      sample: 'The unexamined life is not worth living.',
      desc: 'Classic editorial book typography suited for literary prose.',
    },
    {
      id: 'sans',
      name: 'Plus Jakarta Sans',
      sample: 'Clarity, velocity, and modern ergonomics.',
      desc: 'Clean geometric rhythm optimized for modern screens.',
    },
    {
      id: 'mono',
      name: 'JetBrains Code & Monospace',
      sample: 'fn consolidate_memory() -> Result<(), E>',
      desc: 'Engineered for dense technical notes, formulas, and proofs.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[var(--text-primary)]">
                Sanctuary Settings & Themes
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Personalize dark mode palettes, typography, and encryption locks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Themes */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Curated Theme Palettes</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  currentTheme === t.id
                    ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/30 bg-[var(--bg-surface-elevated)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)] bg-[var(--bg-surface-elevated)]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{t.name}</span>
                    {currentTheme === t.id && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                    {t.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[var(--border-subtle)]/40">
                  <div className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: t.bg }} />
                  <div className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: t.text }} />
                  <div className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: t.accent }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Typography */}
        <div className="space-y-4 mb-6 pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Display Typography</span>
          </h3>

          <div className="space-y-2">
            {fonts.map((f) => (
              <button
                key={f.id}
                onClick={() => onSelectFont(f.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  currentFont === f.id
                    ? 'border-[var(--accent)] bg-[var(--bg-surface-elevated)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{f.name}</span>
                  {currentFont === f.id && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                </div>
                <div className="text-sm my-1 text-[var(--accent)] italic">{f.sample}</div>
                <p className="text-[11px] text-[var(--text-muted)]">{f.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Security & Auto-lock */}
        <div className="space-y-4 mb-6 pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Vault Security & Auto-Lock</span>
          </h3>

          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Auto-Lock Inactivity Period</span>
              <select
                value={vaultState.autoLockMinutes}
                onChange={(e) =>
                  onUpdateVaultState({
                    ...vaultState,
                    autoLockMinutes: parseInt(e.target.value, 10),
                  })
                }
                className="px-2 py-1 text-xs rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              >
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={0}>Never (Manual lock only)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]/40">
              <div className="text-[11px] text-[var(--text-muted)]">
                Status: {isOnline ? 'Online (sync ready)' : 'Offline (running fully in local IndexedDB)'}
              </div>
              <button
                type="button"
                onClick={onLockVault}
                className="px-3 py-1.5 text-xs rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Vault Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Close */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-black text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Apply & Return
          </button>
        </div>
      </div>
    </div>
  );
};
