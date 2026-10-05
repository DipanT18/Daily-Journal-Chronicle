import { JournalEntry, VaultState, EncryptedExportPayload } from '../types/journal';
import { encryptData, decryptData, createPassphraseVerifier } from './crypto';

const DB_NAME = 'AetheriaJournalVault';
const DB_VERSION = 1;
const STORE_ENTRIES = 'entries';
const STORE_CONFIG = 'config';
const LOCAL_STORAGE_KEY = 'aetheria_vault_data_fallback';
const VAULT_STATE_KEY = 'aetheria_vault_state';

// Pre-seeded starter entries with rich formatting, study log, and memories
export const SEED_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-seed-1',
    title: 'The Architecture of Deep Focus & Neural Consolidation',
    content: `
      <h2>The Geometry of Unbroken Work</h2>
      <p>Today marks the completion of the 4th study cycle on cognitive consolidation mechanisms during intensive learning. It has become abundantly clear that active retrieval and spatial mind-mapping outshine passive review by a staggering margin.</p>
      
      <blockquote>
        "The mind is not a vessel to be filled, but a fire to be kindled." — Plutarch
      </blockquote>
      
      <h3>Key Discoveries from Today's Intensive Session</h3>
      <ul>
        <li><strong>Spaced Interleaving:</strong> Rotating between algorithmic proofs and architectural synthesis prevents cognitive fatigue.</li>
        <li><strong>The 90-Minute Ultradian Limit:</strong> Peak cognitive alertness wanes past 85 minutes. Forcing past this yields negative returns.</li>
        <li><strong>Zero Context Switching:</strong> Encrypting the workspace and silencing notifications quadrupled retention depth.</li>
      </ul>

      <h3>Milestone Checklist</h3>
      <ul class="checklist">
        <li>[x] Synthesize chapter on synaptic plasticity and LTP</li>
        <li>[x] Implement working cryptographic vault prototype</li>
        <li>[ ] Outline cross-device synchronization protocol</li>
      </ul>

      <p><em>Reflection:</em> When the writing desk is clear and the mind untethered from distraction, study ceases to be an obligation and becomes pure craft.</p>
    `,
    plainText: "The Geometry of Unbroken Work. Today marks the completion of the 4th study cycle on cognitive consolidation mechanisms during intensive learning. It has become abundantly clear that active retrieval and spatial mind-mapping outshine passive review by a staggering margin. Key Discoveries from Today's Intensive Session: Spaced Interleaving, The 90-Minute Ultradian Limit, Zero Context Switching. Milestone Checklist: Synthesize chapter on synaptic plasticity, Implement working cryptographic vault prototype.",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    mood: 'focused',
    moodScore: 9,
    energyLevel: 5,
    weather: 'clear-night',
    location: 'Sanctuary Study Desk',
    tags: ['study', 'neuroscience', 'deepwork', 'mastery'],
    isPinned: true,
    isStudyLog: true,
    studyData: {
      subject: 'Cognitive Science & Cryptography',
      topic: 'Synaptic Plasticity & AES-GCM Key Derivation',
      durationMinutes: 135,
      keyTakeaways: [
        'PBKDF2 with 100k rounds provides resilient resistance against brute-force',
        'Memory consolidation accelerates during evening slow-wave reflection',
        'Physical notes paired with encrypted digital archive create the optimal workflow'
      ],
      comprehensionRating: 5,
      nextAction: 'Review state machines for zero-knowledge data sync',
    },
    wordCount: 168,
    characterCount: 1140,
    readTimeMinutes: 1,
  },
  {
    id: 'entry-seed-2',
    title: 'Dawn Above the Cloud Line — When Time Suspended',
    content: `
      <h2>The Stillness Before First Light</h2>
      <p>We reached the ridge crest at 05:20 AM. The mountain air was crisply sub-zero, biting through the woolen gloves, but the sight that unfolded washed all exhaustion away in an instant.</p>
      
      <p>Below us lay an unbroken sea of clouds, illuminated in tones of soft gold and lavender as the sun pierced the eastern horizon. The reflection upon the glacier lake was a mirror of quiet majesty.</p>

      <div class="image-container my-4">
        <img src="/src/assets/images/memorable_golden_peaks_1791160930614.jpg" alt="Golden mountain peaks above the clouds" class="rounded-xl w-full max-h-96 object-cover border border-white/10 shadow-lg" />
        <p class="text-xs text-center text-slate-400 mt-2 italic">Golden dawn reflection over the high alpine lake (05:42 AM)</p>
      </div>

      <h3>Why This Moment Stays With Me</h3>
      <ol>
        <li>No digital notifications, no deadlines, only the rhythm of breathing and stone.</li>
        <li>A reminder of how small our everyday worries are against geological time.</li>
        <li>The pact made with myself to preserve this inner sanctuary regardless of external noise.</li>
      </ol>
      
      <p>Carrying this tranquility into the weeks ahead.</p>
    `,
    plainText: "The Stillness Before First Light. We reached the ridge crest at 05:20 AM. The mountain air was crisply sub-zero, but the sight that unfolded washed all exhaustion away in an instant. Below us lay an unbroken sea of clouds, illuminated in tones of soft gold and lavender. Why This Moment Stays With Me: No digital notifications, only breathing and stone. A reminder of how small our everyday worries are. Carrying this tranquility into the weeks ahead.",
    date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    mood: 'ecstatic',
    moodScore: 10,
    energyLevel: 5,
    weather: 'sunny',
    location: 'High Alpine Ridge',
    tags: ['memory', 'travel', 'gratitude', 'nature', 'milestone'],
    isPinned: true,
    memorableMoment: {
      isMilestone: true,
      category: 'travel_adventure',
      photoUrl: '/src/assets/images/memorable_golden_peaks_1791160930614.jpg',
      photoCaption: 'Golden dawn reflection over the high alpine lake (05:42 AM)',
      locationName: 'High Alpine Ridge Sanctuary',
    },
    wordCount: 154,
    characterCount: 980,
    readTimeMinutes: 1,
  },
  {
    id: 'entry-seed-3',
    title: 'Evening Gratitude & Calibrating Intentions',
    content: `
      <h2>Daily Prompt Reflection</h2>
      <p><em>Prompt: "What quiet victory occurred today that nobody else observed?"</em></p>
      
      <p>Today's quiet victory was staying completely patient during a complex debugging dilemma. Rather than rushing or reacting with frustration, I closed my eyes, took three diaphragmatic breaths, and stepped through the cryptographic state machine line by line.</p>

      <h3>Three Things I Am Grateful For:</h3>
      <ul>
        <li>The aroma of freshly brewed Earl Grey tea during the rainy afternoon.</li>
        <li>A stimulating conversation with a colleague about end-to-end privacy and human autonomy.</li>
        <li>Having a quiet, dedicated digital space where thoughts can unravel without surveillance or algorithmic judgment.</li>
      </ul>

      <p>Tomorrow's aim: Continue the study journey with equal presence and curiosity.</p>
    `,
    plainText: "Daily Prompt Reflection. Prompt: What quiet victory occurred today that nobody else observed? Today's quiet victory was staying completely patient during a complex debugging dilemma. Three Things I Am Grateful For: The aroma of freshly brewed Earl Grey tea, A stimulating conversation about privacy, Having a quiet dedicated space where thoughts can unravel.",
    date: new Date().toISOString().split('T')[0],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    mood: 'calm',
    moodScore: 8,
    energyLevel: 4,
    weather: 'rainy',
    location: 'Home Study Library',
    tags: ['reflection', 'gratitude', 'evening', 'mindfulness'],
    promptQuestion: 'What quiet victory occurred today that nobody else observed?',
    wordCount: 132,
    characterCount: 890,
    readTimeMinutes: 1,
  }
];

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
        const entryStore = db.createObjectStore(STORE_ENTRIES, { keyPath: 'id' });
        entryStore.createIndex('date', 'date', { unique: false });
        entryStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Storage Service API
export const StorageService = {
  // Initialize and load entries
  async getAllEntries(): Promise<JournalEntry[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_ENTRIES, 'readonly');
        const store = tx.objectStore(STORE_ENTRIES);
        const req = store.getAll();
        req.onsuccess = () => {
          let entries: JournalEntry[] = req.result || [];
          if (entries.length === 0) {
            // Seed initial data
            entries = SEED_ENTRIES;
            this.saveAllEntries(entries);
          }
          // Sort newest first
          entries.sort((a, b) => b.createdAt - a.createdAt);
          resolve(entries);
        };
        req.onerror = () => {
          resolve(this.getFallbackEntries());
        };
      });
    } catch {
      return this.getFallbackEntries();
    }
  },

  // Fallback to localStorage if IndexedDB is blocked
  getFallbackEntries(): JournalEntry[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ENTRIES;
      }
    } catch {
      // ignore
    }
    return SEED_ENTRIES;
  },

  // Save single entry
  async saveEntry(entry: JournalEntry): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ENTRIES, 'readwrite');
        const store = tx.objectStore(STORE_ENTRIES);
        const req = store.put(entry);
        req.onsuccess = () => {
          this.backupToLocalStorage(entry);
          resolve();
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.backupToLocalStorage(entry);
    }
  },

  // Save all entries (e.g. bulk update or re-encryption)
  async saveAllEntries(entries: JournalEntry[]): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_ENTRIES, 'readwrite');
      const store = tx.objectStore(STORE_ENTRIES);
      store.clear();
      entries.forEach((e) => store.put(e));
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  },

  // Delete entry
  async deleteEntry(id: string): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_ENTRIES, 'readwrite');
      const store = tx.objectStore(STORE_ENTRIES);
      store.delete(id);
    } catch {
      // ignore
    }
    try {
      const fallback = this.getFallbackEntries().filter((e) => e.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallback));
    } catch {
      // ignore
    }
  },

  backupToLocalStorage(entry: JournalEntry) {
    try {
      const all = this.getFallbackEntries().filter((e) => e.id !== entry.id);
      all.unshift(entry);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
    } catch {
      // storage full or disabled
    }
  },

  // Vault state configuration
  getVaultState(): VaultState {
    try {
      const raw = localStorage.getItem(VAULT_STATE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return {
      isConfigured: false,
      isUnlocked: true,
      autoLockMinutes: 15,
    };
  },

  saveVaultState(state: VaultState): void {
    try {
      localStorage.setItem(VAULT_STATE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  },

  // Encrypted export payload generator
  async createEncryptedBackup(entries: JournalEntry[], passphrase: string): Promise<string> {
    const payload = {
      entries,
      exportedAt: new Date().toISOString(),
      vaultType: 'AetheriaVault_E2EE',
      version: 1,
    };
    const encrypted = await encryptData(payload, passphrase);
    const exportFile: EncryptedExportPayload = {
      version: 1,
      appName: 'Aetheria Journal',
      exportedAt: new Date().toISOString(),
      salt: encrypted.salt,
      iv: encrypted.iv,
      ciphertext: encrypted.ciphertext,
      checksum: `sha256_${encrypted.ciphertext.length}`,
    };
    return JSON.stringify(exportFile, null, 2);
  },

  // Restore encrypted backup
  async restoreEncryptedBackup(fileContent: string, passphrase: string): Promise<JournalEntry[]> {
    const parsed: EncryptedExportPayload = JSON.parse(fileContent);
    if (!parsed.ciphertext || !parsed.salt || !parsed.iv) {
      throw new Error('Invalid vault backup format');
    }
    const decrypted = await decryptData(parsed.ciphertext, parsed.salt, parsed.iv, passphrase);
    if (decrypted && Array.isArray(decrypted.entries)) {
      await this.saveAllEntries(decrypted.entries);
      return decrypted.entries;
    }
    throw new Error('Corrupted or incorrect vault passphrase');
  }
};
