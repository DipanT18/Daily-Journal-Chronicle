import React from 'react';
import {
  Lock,
  Plus,
  Settings,
  Wifi,
  WifiOff,
  BookOpen,
  LayoutDashboard,
  Sparkles,
  Share2,
  Moon
} from 'lucide-react';
import { VaultState } from '../../types/journal';

interface TopBarProps {
  currentView: 'list' | 'dashboard' | 'memories' | 'connected' | 'editor';
  onNavigate: (view: 'list' | 'dashboard' | 'memories' | 'connected') => void;
  onNewEntry: () => void;
  onOpenSettings: () => void;
  onLockVault: () => void;
  vaultState: VaultState;
  isOnline: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  onNewEntry,
  onOpenSettings,
  onLockVault,
  vaultState,
  isOnline,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark in display face */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('list');
          }}
          className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors select-none"
        >
          Aetheria
        </a>

        {/* Zone 2: 4-6 clean text navigation links with subtle hover states */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onNavigate('list')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'list'
                ? 'text-[var(--accent)] font-semibold border-b-2 border-[var(--accent)] pb-1'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Chronicles
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'dashboard'
                ? 'text-[var(--accent)] font-semibold border-b-2 border-[var(--accent)] pb-1'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => onNavigate('memories')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'memories'
                ? 'text-[var(--accent)] font-semibold border-b-2 border-[var(--accent)] pb-1'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Memories
          </button>
          <button
            onClick={() => onNavigate('connected')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'connected'
                ? 'text-[var(--accent)] font-semibold border-b-2 border-[var(--accent)] pb-1'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Integrations
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions (Settings & New Chronicle / Lock) */}
        <div className="flex items-center gap-2.5">
          {/* Quick Lock if vault configured */}
          {vaultState.isConfigured && (
            <button
              onClick={onLockVault}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
              title="Lock Vault"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Settings / Appearance button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
            title="Themes & Vault Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* New Chronicle primary action button */}
          <button
            onClick={onNewEntry}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[var(--accent)] text-black font-semibold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chronicle</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed for responsive mobile devices) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => onNavigate('list')}
          className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-2 ${
            currentView === 'list' ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Entries</span>
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-2 ${
            currentView === 'dashboard' ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={onNewEntry}
          className="w-10 h-10 -mt-4 rounded-full bg-[var(--accent)] text-black flex items-center justify-center shadow-lg"
          title="Write Now"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigate('memories')}
          className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-2 ${
            currentView === 'memories' ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Memories</span>
        </button>
        <button
          onClick={() => onNavigate('connected')}
          className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-2 ${
            currentView === 'connected' ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Sync</span>
        </button>
      </div>
    </header>
  );
};
