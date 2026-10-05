import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, Eye, EyeOff, AlertTriangle, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { createPassphraseVerifier, verifyPassphrase, generateRecoveryKey } from '../../services/crypto';
import { VaultState } from '../../types/journal';

interface VaultLockModalProps {
  vaultState: VaultState;
  onUnlock: (passphrase: string) => void;
  onSetupVault: (passphrase: string, salt: string, verifier: string, recoveryKey: string) => void;
  onSkipSetup: () => void;
}

export const VaultLockModal: React.FC<VaultLockModalProps> = ({
  vaultState,
  onUnlock,
  onSetupVault,
  onSkipSetup,
}) => {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(!vaultState.isConfigured);
  const [recoveryKey, setRecoveryKey] = useState(() => generateRecoveryKey());
  const [savedRecoveryKey, setSavedRecoveryKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase) {
      setErrorMsg('Please enter your master vault passphrase');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (vaultState.saltBase64 && vaultState.verifierHash) {
        const isValid = await verifyPassphrase(passphrase, vaultState.saltBase64, vaultState.verifierHash);
        if (isValid) {
          onUnlock(passphrase);
        } else {
          setErrorMsg('Incorrect passphrase. Master key derivation failed.');
        }
      } else {
        // Unconfigured vault fallback unlock
        onUnlock(passphrase);
      }
    } catch {
      setErrorMsg('Cryptographic verification error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle New Vault Setup
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.length < 6) {
      setErrorMsg('Passphrase must be at least 6 characters for AES-256 security.');
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setErrorMsg('Passphrases do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Generate 16 bytes random salt
      const saltBytes = crypto.getRandomValues(new Uint8Array(16));
      let binary = '';
      for (let i = 0; i < saltBytes.byteLength; i++) {
        binary += String.fromCharCode(saltBytes[i]);
      }
      const saltBase64 = btoa(binary);
      const verifier = await createPassphraseVerifier(passphrase, saltBase64);

      onSetupVault(passphrase, saltBase64, verifier, recoveryKey);
    } catch {
      setErrorMsg('Failed to initialize cryptographic parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--accent)]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Vault Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] mb-3 border border-[var(--border-subtle)]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-primary)]">
            {isSettingUp ? 'Initialize End-to-End Vault' : 'Unlock Encrypted Vault'}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-sm mx-auto leading-relaxed">
            {isSettingUp
              ? 'Your journals and study memories are encrypted client-side using AES-256-GCM. Only you hold the decryption key.'
              : 'Enter your master passphrase to decrypt your daily entries and reflections.'}
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSettingUp ? (
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                Create Master Passphrase
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Min 6 characters (e.g. passphrase with words)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                Confirm Master Passphrase
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Repeat master passphrase"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Generated Recovery Key */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[var(--accent)]" />
                  Cryptographic Recovery Key
                </span>
                <button
                  type="button"
                  onClick={() => setRecoveryKey(generateRecoveryKey())}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  title="Generate New Recovery Key"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <div className="font-mono text-xs font-semibold tracking-wider text-[var(--accent)] select-all bg-[var(--bg-primary)] px-2.5 py-1.5 rounded border border-[var(--border-subtle)]">
                {recoveryKey}
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer text-[11px] text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={savedRecoveryKey}
                  onChange={(e) => setSavedRecoveryKey(e.target.checked)}
                  className="accent-[var(--accent)] rounded"
                />
                <span>I have recorded this recovery key in a safe place</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !savedRecoveryKey || !passphrase}
              className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-black font-semibold text-xs hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <span>Deriving 256-bit Keys...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure & Lock My Sanctuary</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onSkipSetup}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Skip Passphrase (Local Device Mode Only)
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                Enter Master Passphrase
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passphrase}
                  autoFocus
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Master passphrase"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !passphrase}
              className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-black font-semibold text-xs hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <span>Verifying Decryption...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unlock Journal Vault</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs text-[var(--text-muted)]">
              <button
                type="button"
                onClick={() => setIsSettingUp(true)}
                className="hover:text-[var(--text-secondary)] transition-colors"
              >
                Reset / Re-configure Vault
              </button>
              <button
                type="button"
                onClick={onSkipSetup}
                className="hover:text-[var(--text-secondary)] transition-colors"
              >
                Explore Demo Mode
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
