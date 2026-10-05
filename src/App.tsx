/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { JournalEntry, AppTheme, AppFont, VaultState } from './types/journal';
import { StorageService, SEED_ENTRIES } from './services/storage';
import { TopBar } from './components/Navigation/TopBar';
import { JournalListView } from './components/JournalList/JournalListView';
import { EntryEditorPage } from './components/Editor/EntryEditorPage';
import { SmartDashboard } from './components/Dashboard/SmartDashboard';
import { MemoriesVault } from './components/Memories/MemoriesVault';
import { ConnectedAppsHub } from './components/ConnectedApps/ConnectedAppsHub';
import { VaultLockModal } from './components/Vault/VaultLockModal';
import { SettingsModal } from './components/Settings/SettingsModal';

export default function App() {
  // App views
  const [currentView, setCurrentView] = useState<'list' | 'dashboard' | 'memories' | 'connected' | 'editor'>('list');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('aetheria_theme') as AppTheme) || 'obsidian';
  });
  const [font, setFont] = useState<AppFont>(() => {
    return (localStorage.getItem('aetheria_font') as AppFont) || 'sans';
  });

  // Vault state
  const [vaultState, setVaultState] = useState<VaultState>(() => StorageService.getVaultState());
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(() => {
    const s = StorageService.getVaultState();
    return s.isConfigured; // locked by default if configured
  });
  const [masterPassphrase, setMasterPassphrase] = useState<string>('');

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Inactivity tracking for auto-lock
  const lastActivityRef = useRef<number>(Date.now());

  // Load entries on mount
  useEffect(() => {
    async function loadData() {
      const loaded = await StorageService.getAllEntries();
      setEntries(loaded);
    }
    loadData();
  }, []);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync theme & font classes to body
  useEffect(() => {
    document.body.className = `theme-${theme} font-${font} antialiased selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-200`;
    localStorage.setItem('aetheria_theme', theme);
  }, [theme, font]);

  useEffect(() => {
    localStorage.setItem('aetheria_font', font);
  }, [font]);

  // Auto-lock inactivity monitor
  useEffect(() => {
    if (!vaultState.isConfigured || isVaultLocked || vaultState.autoLockMinutes === 0) return;

    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - lastActivityRef.current) / 1000 / 60;
      if (elapsedMinutes >= vaultState.autoLockMinutes) {
        setIsVaultLocked(true);
        setMasterPassphrase('');
      }
    }, 30000);

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', recordActivity);
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('touchstart', recordActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('touchstart', recordActivity);
    };
  }, [vaultState, isVaultLocked]);

  // Create new journal entry
  const handleCreateNewEntry = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: '',
      content: '',
      plainText: '',
      date: todayStr,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mood: 'calm',
      moodScore: 8,
      energyLevel: 4,
      weather: 'sunny',
      location: 'Study Sanctuary',
      tags: ['chronicle'],
      wordCount: 0,
      characterCount: 0,
      readTimeMinutes: 1,
      isEncrypted: vaultState.isConfigured,
    };

    setActiveEntry(newEntry);
    setIsNewEntry(true);
    setCurrentView('editor');
  };

  // Save entry handler
  const handleSaveEntry = async (updated: JournalEntry) => {
    await StorageService.saveEntry(updated);
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      } else {
        return [updated, ...prev];
      }
    });
  };

  // Delete entry handler
  const handleDeleteEntry = async (id: string) => {
    await StorageService.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setActiveEntry(null);
    setCurrentView('list');
  };

  // Toggle pin
  const handleTogglePin = async (id: string) => {
    const target = entries.find((e) => e.id === id);
    if (!target) return;
    const updated = { ...target, isPinned: !target.isPinned };
    await handleSaveEntry(updated);
  };

  // Select entry to read/edit
  const handleSelectEntry = (entry: JournalEntry) => {
    setActiveEntry(entry);
    setIsNewEntry(false);
    setCurrentView('editor');
  };

  // Vault Unlock
  const handleUnlockVault = (passphrase: string) => {
    setMasterPassphrase(passphrase);
    setIsVaultLocked(false);
    lastActivityRef.current = Date.now();
  };

  // Vault Setup
  const handleSetupVault = (passphrase: string, salt: string, verifier: string, recoveryKey: string) => {
    const updatedState: VaultState = {
      isConfigured: true,
      isUnlocked: true,
      saltBase64: salt,
      verifierHash: verifier,
      autoLockMinutes: 15,
      keyHint: `Recovery key: ${recoveryKey}`,
    };
    StorageService.saveVaultState(updatedState);
    setVaultState(updatedState);
    setMasterPassphrase(passphrase);
    setIsVaultLocked(false);
  };

  // Skip Setup (Local mode)
  const handleSkipSetup = () => {
    setIsVaultLocked(false);
  };

  // Lock Vault
  const handleLockVault = () => {
    setIsVaultLocked(true);
    setMasterPassphrase('');
    setShowSettings(false);
    if (currentView === 'editor') {
      setCurrentView('list');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] pb-16 md:pb-0">
      {/* Vault Lock Screen if locked */}
      {isVaultLocked && (
        <VaultLockModal
          vaultState={vaultState}
          onUnlock={handleUnlockVault}
          onSetupVault={handleSetupVault}
          onSkipSetup={handleSkipSetup}
        />
      )}

      {/* Primary Top Bar */}
      <TopBar
        currentView={currentView}
        onNavigate={(v) => {
          setCurrentView(v);
          setActiveEntry(null);
        }}
        onNewEntry={handleCreateNewEntry}
        onOpenSettings={() => setShowSettings(true)}
        onLockVault={handleLockVault}
        vaultState={vaultState}
        isOnline={isOnline}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {currentView === 'editor' && activeEntry ? (
          <EntryEditorPage
            entry={activeEntry}
            onSave={handleSaveEntry}
            onDelete={handleDeleteEntry}
            onBack={() => {
              setCurrentView('list');
              setActiveEntry(null);
            }}
            isNew={isNewEntry}
          />
        ) : currentView === 'dashboard' ? (
          <SmartDashboard
            entries={entries}
            onSelectEntry={handleSelectEntry}
            onNewEntry={handleCreateNewEntry}
          />
        ) : currentView === 'memories' ? (
          <MemoriesVault
            entries={entries}
            onSelectEntry={handleSelectEntry}
            onNewMemory={handleCreateNewEntry}
          />
        ) : currentView === 'connected' ? (
          <ConnectedAppsHub
            entries={entries}
            vaultState={vaultState}
            onImportSuccess={(imported) => {
              setEntries(imported);
              setCurrentView('list');
            }}
          />
        ) : (
          <JournalListView
            entries={entries}
            selectedEntryId={activeEntry?.id || null}
            onSelectEntry={handleSelectEntry}
            onNewEntry={handleCreateNewEntry}
            onDeleteEntry={handleDeleteEntry}
            onTogglePin={handleTogglePin}
          />
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          currentTheme={theme}
          onSelectTheme={setTheme}
          currentFont={font}
          onSelectFont={setFont}
          vaultState={vaultState}
          onUpdateVaultState={(st) => {
            StorageService.saveVaultState(st);
            setVaultState(st);
          }}
          isOnline={isOnline}
          onLockVault={handleLockVault}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
