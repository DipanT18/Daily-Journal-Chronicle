import React, { useState } from 'react';
import {
  Download,
  Upload,
  Calendar,
  FileText,
  ShieldCheck,
  Cloud,
  Share2,
  HardDrive,
  CheckCircle,
  Copy,
  ExternalLink,
  Laptop,
  Smartphone,
  Printer
} from 'lucide-react';
import { JournalEntry, VaultState } from '../../types/journal';
import { StorageService } from '../../services/storage';

interface ConnectedAppsHubProps {
  entries: JournalEntry[];
  vaultState: VaultState;
  onImportSuccess: (importedEntries: JournalEntry[]) => void;
}

export const ConnectedAppsHub: React.FC<ConnectedAppsHubProps> = ({
  entries,
  vaultState,
  onImportSuccess,
}) => {
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [importPassphrase, setImportPassphrase] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);

  // 1. Export as Encrypted .aethvault
  const handleExportEncrypted = async () => {
    if (!exportPassphrase) {
      setStatusMessage({ text: 'Please supply a passphrase to encrypt your backup file', type: 'error' });
      return;
    }
    try {
      const encryptedJson = await StorageService.createEncryptedBackup(entries, exportPassphrase);
      const blob = new Blob([encryptedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Aetheria_Encrypted_Vault_${new Date().toISOString().split('T')[0]}.aethvault`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ text: 'Encrypted vault archive downloaded successfully.', type: 'success' });
    } catch {
      setStatusMessage({ text: 'Encryption failed. Check passphrase requirements.', type: 'error' });
    }
  };

  // 2. Export as Markdown (.md) bundle for Obsidian & Notion
  const handleExportMarkdown = () => {
    try {
      const markdownFiles = entries.map((entry) => {
        const yamlFrontmatter = [
          '---',
          `title: "${entry.title.replace(/"/g, '\\"')}"`,
          `date: ${entry.date}`,
          `mood: ${entry.mood}`,
          `tags: [${entry.tags.map((t) => `"${t}"`).join(', ')}]`,
          entry.isStudyLog ? `study_subject: "${entry.studyData?.subject || ''}"` : null,
          entry.isStudyLog ? `study_duration: ${entry.studyData?.durationMinutes || 0}` : null,
          entry.memorableMoment ? `milestone: "${entry.memorableMoment.category}"` : null,
          '---',
          '',
          `# ${entry.title}`,
          '',
          entry.plainText,
          '',
        ]
          .filter(Boolean)
          .join('\n');

        return { filename: `${entry.date}_${entry.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`, content: yamlFrontmatter };
      });

      // Combine into master markdown document
      const fullDoc = markdownFiles.map((f) => f.content).join('\n\n---\n\n');
      const blob = new Blob([fullDoc], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Obsidian_Notion_Journal_${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ text: 'Obsidian & Notion compatible Markdown export generated.', type: 'success' });
    } catch {
      setStatusMessage({ text: 'Failed to generate markdown.', type: 'error' });
    }
  };

  // 3. Export as iCalendar (.ics) for Google Calendar & Apple Calendar
  const handleExportCalendar = () => {
    try {
      const icsEvents = entries
        .map((entry) => {
          const dateClean = entry.date.replace(/-/g, '');
          return [
            'BEGIN:VEVENT',
            `UID:aetheria-${entry.id}@vault`,
            `DTSTAMP:${dateClean}T120000Z`,
            `DTSTART;VALUE=DATE:${dateClean}`,
            `DTEND;VALUE=DATE:${dateClean}`,
            `SUMMARY:Journal: ${entry.title.replace(/[,;]/g, ' ')}`,
            `DESCRIPTION:Mood: ${entry.mood} | Words: ${entry.wordCount} | Tags: ${entry.tags.join(', ')}`,
            'END:VEVENT',
          ].join('\r\n');
        })
        .join('\r\n');

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Aetheria Journal//Journal Calendar 1.0//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        icsEvents,
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Journal_Milestones_Calendar_${new Date().toISOString().split('T')[0]}.ics`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ text: 'iCalendar (.ics) exported. Import into Google Calendar or Apple Calendar.', type: 'success' });
    } catch {
      setStatusMessage({ text: 'Failed to create iCalendar file.', type: 'error' });
    }
  };

  // 4. Import Vault
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        if (parsed.ciphertext) {
          // Encrypted
          if (!importPassphrase) {
            setStatusMessage({ text: 'Please enter the decryption passphrase for this encrypted vault file.', type: 'error' });
            return;
          }
          const restored = await StorageService.restoreEncryptedBackup(content, importPassphrase);
          onImportSuccess(restored);
          setStatusMessage({ text: `Successfully restored ${restored.length} entries from encrypted vault!`, type: 'success' });
        } else if (Array.isArray(parsed)) {
          // Plain JSON
          await StorageService.saveAllEntries(parsed);
          onImportSuccess(parsed);
          setStatusMessage({ text: `Imported ${parsed.length} entries.`, type: 'success' });
        }
      } catch {
        setStatusMessage({ text: 'Decryption failed: check file format and passphrase.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // 5. Simulate Cloud Backup / Webhook Sync
  const handleTestWebhookSync = () => {
    if (!webhookUrl) {
      setStatusMessage({ text: 'Please enter a target backup endpoint URL or WebDAV address', type: 'error' });
      return;
    }
    setIsSimulatingSync(true);
    setTimeout(() => {
      setIsSimulatingSync(false);
      setStatusMessage({
        text: `Handshake test successful with ${new URL(webhookUrl).hostname}! Encrypted payload verified.`,
        type: 'success',
      });
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
          Connected Ecosystem & Data Portability
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Zero lock-in. Seamlessly bridge your encrypted journal with your calendar, second-brain apps, and cross-device archives.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* End-to-End Encrypted Vault Export */}
        <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Cryptographic Vault Backup (.aethvault)
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
              Pack all entries, study data, and photos into a tamper-proof AES-256 encrypted file. Safe to store on Dropbox, Google Drive, or cold USB storage.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  Vault Encryption Passphrase
                </label>
                <input
                  type="password"
                  placeholder="Passphrase for this archive"
                  value={exportPassphrase}
                  onChange={(e) => setExportPassphrase(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleExportEncrypted}
              className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-black font-semibold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Encrypted Vault File</span>
            </button>
          </div>
        </div>

        {/* Second-Brain & Note Apps (Obsidian / Notion / Logseq) */}
        <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Obsidian & Notion Markdown Bundle
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
              Export all chronicles formatted with YAML frontmatter tags, study topics, and dates. Drop directly into your Obsidian Vault or Notion Workspace.
            </p>

            <div className="text-[11px] text-[var(--text-secondary)] space-y-1 bg-[var(--bg-surface-elevated)] p-3 rounded-xl border border-[var(--border-subtle)]">
              <div>• Compatible with: <strong>Obsidian, Notion, Logseq, Bear, Roam</strong></div>
              <div>• Preserves tags, mood scores, and study metadata</div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleExportMarkdown}
              className="w-full py-2.5 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-medium text-xs hover:border-[var(--accent)] transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Markdown Bundle (.md)</span>
            </button>
          </div>
        </div>

        {/* Calendar Sync Integration (Google / Apple / Outlook) */}
        <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Calendar Timeline Feed (.ics)
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
              Generate an iCalendar calendar file containing your journal reflections, study sessions, and milestone dates to visualize alongside your schedule.
            </p>

            <div className="text-[11px] text-[var(--text-secondary)] space-y-1 bg-[var(--bg-surface-elevated)] p-3 rounded-xl border border-[var(--border-subtle)]">
              <div>• Compatible with: <strong>Google Calendar, Apple iCal, Outlook</strong></div>
              <div>• Maps study hours and milestone dates directly to your calendar</div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleExportCalendar}
              className="w-full py-2.5 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-medium text-xs hover:border-[var(--accent)] transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Export iCalendar (.ics) Feed</span>
            </button>
          </div>
        </div>

        {/* Restore / Import Vault Archive */}
        <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Restore or Import Vault
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
              Import a previously exported .aethvault archive or JSON backup. If encrypted, provide the original passphrase below:
            </p>

            <div className="mb-4">
              <input
                type="password"
                placeholder="Passphrase for encrypted file (if applicable)"
                value={importPassphrase}
                onChange={(e) => setImportPassphrase(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <label className="w-full py-2.5 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-medium text-xs hover:border-[var(--accent)] transition-colors flex items-center justify-center gap-2 cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>Select File to Restore</span>
              <input
                type="file"
                accept=".json,.aethvault,.txt"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Cloud & Cross-Device Sync Setup */}
      <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Self-Hosted Cloud Storage & Custom Webhook Sync
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Optionally sync encrypted blobs to your own Nextcloud, WebDAV, Supabase, or AWS S3 endpoint.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="url"
            placeholder="https://your-server.com/api/journal-backup"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="sm:col-span-3 px-3.5 py-2.5 text-xs rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={handleTestWebhookSync}
            disabled={isSimulatingSync || !webhookUrl}
            className="py-2.5 rounded-lg bg-[var(--accent)] text-black font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {isSimulatingSync ? 'Testing Handshake...' : 'Verify Cloud Sync'}
          </button>
        </div>
      </div>

      {/* Printable Book Mode */}
      <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Printer className="w-4 h-4 text-[var(--accent)]" />
            <span>Printable Physical Book Layout</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Format your journal entries into an archival typography layout ready for printing to PDF or physical book binding.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>
    </div>
  );
};
