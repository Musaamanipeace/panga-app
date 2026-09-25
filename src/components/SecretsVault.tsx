import { useState, useEffect, useCallback } from "react";
import {
  isVaultInitialized,
  initializeVault,
  unlockVault,
  setSessionKey,
  getSessionKey,
  decryptSecret,
  listSecrets,
} from "../data/secrets";
import type { Resource } from "../data/db";

// Simple in-memory store for decrypted values (not persisted)
const revealedValues = new Map<string, string>();

export function getRevealedValue(id: string): string | undefined {
  return revealedValues.get(id);
}

interface VaultProps {
  projectId?: string | null;
}

export default function SecretsVault({ projectId }: VaultProps) {
  const [initialized, setInitialized] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [passphraseConfirm, setPassphraseConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secrets, setSecrets] = useState<Resource[]>([]);

  const checkInit = useCallback(async () => {
    setInitialized(await isVaultInitialized());
  }, []);

  const loadSecrets = useCallback(async () => {
    setSecrets(await listSecrets(projectId));
  }, [projectId]);

  useEffect(() => {
    void checkInit();
    void loadSecrets();
    if (getSessionKey()) setUnlocked(true);
  }, [checkInit, loadSecrets]);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!passphrase.trim()) {
      setError("Passphrase cannot be empty.");
      return;
    }
    if (passphrase !== passphraseConfirm) {
      setError("Passphrases do not match.");
      return;
    }
    if (passphrase.length < 8) {
      setError("Passphrase should be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await initializeVault(passphrase);
      const key = await unlockVault(passphrase);
      if (!key) {
        setError("Failed to initialize vault.");
      } else {
        setSessionKey(key);
        setUnlocked(true);
        setPassphrase("");
        setPassphraseConfirm("");
        void checkInit();
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!passphrase.trim()) {
      setError("Enter your passphrase.");
      return;
    }
    setLoading(true);
    try {
      const key = await unlockVault(passphrase);
      if (!key) {
        setError("Passphrase incorrect.");
      } else {
        setSessionKey(key);
        setUnlocked(true);
        setPassphrase("");
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="secrets-vault">
      {!initialized ? (
        <div>
          <p className="empty-state">
            Secrets vault is not initialized. Set up a passphrase to encrypt secrets at rest.
          </p>
          <form onSubmit={handleSetup}>
            <input
              type="password"
              placeholder="New passphrase (min 8 characters)"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              data-tip="This passphrase encrypts your secrets. It is never stored."
            />
            <input
              type="password"
              placeholder="Confirm passphrase"
              value={passphraseConfirm}
              onChange={(e) => setPassphraseConfirm(e.target.value)}
              data-tip="Re-type your passphrase to confirm"
            />
            <button type="submit" className="btn-primary clickable" disabled={loading}>
              {loading ? "Initializing..." : "Initialize vault"}
            </button>
            {error && <p className="otp-error">{error}</p>}
          </form>
        </div>
      ) : !unlocked ? (
        <form onSubmit={handleUnlock}>
          <input
            type="password"
            placeholder="Vault passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            data-tip="Unlock the secrets vault with your passphrase"
            autoComplete="off"
          />
          <button type="submit" className="btn-primary clickable" disabled={loading}>
            {loading ? "Unlocking..." : "Unlock vault"}
          </button>
          {error && <p className="otp-error">{error}</p>}
        </form>
      ) : (
        <div>
          <p className="progress-label" style={{ marginBottom: 8 }}>
            Vault unlocked. {secrets.length} secret(s) stored.
          </p>
          <button
            className="btn-secondary btn-small clickable"
            data-tip="Lock the vault (clears the session key from memory)"
            onClick={() => {
              setSessionKey(null);
              setUnlocked(false);
            }}
          >
            Lock vault
          </button>
        </div>
      )}
    </div>
  );
}

// Inline secret reveal — used in the Resources list
export function SecretViewer({ resource }: { resource: Resource }) {
  const revealed = getRevealedValue(resource.id);
  if (revealed) {
    return (
      <span className="resource-notes" data-tip="Value is decrypted in memory only">
        {revealed}
      </span>
    );
  }

  async function reveal() {
    const key = getSessionKey();
    if (!key) {
      alert("Unlock the secrets vault first to reveal secrets.");
      return;
    }
    const val = await decryptSecret(resource);
    if (val !== null) {
      revealedValues.set(resource.id, val);
      // Force re-render by updating a dummy state... use a key trick
      window.dispatchEvent(new CustomEvent("secret-revealed", { detail: { id: resource.id } }));
    }
  }

  return (
    <button
      type="button"
      className="btn-secondary btn-small clickable"
      data-tip="Reveal secret (requires unlocked vault)"
      onClick={reveal}
    >
      Reveal
    </button>
  );
}
