// Settings section: username + password sign-in (Supabase) and sync status.
import { useEffect, useState } from "react";
import {
  DEFAULT_LOGIN_DOMAIN,
  getAccount,
  getLoginDomain,
  setLoginDomain,
  signIn,
  signOut,
  signUp,
  subscribeSupabaseSync,
  syncNow,
  type SyncState,
} from "../sync/supabaseSync";

export default function AccountPanel() {
  const [account, setAccount] = useState<{ id: string; login: string } | null>(null);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState(getLoginDomain());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [sync, setSync] = useState<SyncState>({ phase: "off", at: null, message: "" });

  useEffect(() => {
    void getAccount().then(setAccount);
    return subscribeSupabaseSync(setSync);
  }, []);

  async function go(kind: "in" | "up") {
    setBusy(true);
    setMsg("");
    setLoginDomain(domain);
    const res = kind === "in" ? await signIn(login, password) : await signUp(login, password);
    if (res.error) setMsg(res.error);
    else if ("needsConfirm" in res && res.needsConfirm) setMsg("Account created, but Supabase wants email confirmation. Turn off “Confirm email” in your Supabase Auth settings, then sign in.");
    else {
      setPassword("");
      setAccount(await getAccount());
      void syncNow();
    }
    setBusy(false);
  }

  return (
    <section id="account" className="settings-section" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Account &amp; sync</h2>
      <p className="pg-muted">Sign in with a username and password to sync tasks, thoughts and notes across devices. Everything keeps working offline without an account. Clipboard clips, PDFs, API keys and voice models never leave this device.</p>
      {account ? (
        <div className="pg-actions">
          <span>
            Signed in as <strong>{account.login}</strong>
          </span>
          <button type="button" className="btn-secondary btn-small" onClick={() => void syncNow()} disabled={sync.phase === "syncing"}>
            Sync now
          </button>
          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={async () => {
              await signOut();
              setAccount(null);
            }}
          >
            Sign out
          </button>
        </div>
      ) : (
        <form
          className="pg-note-form"
          onSubmit={(e) => {
            e.preventDefault();
            void go("in");
          }}
        >
          <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Username" autoComplete="username" autoCapitalize="none" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8+ characters)" autoComplete="current-password" />
          <div className="pg-actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              Sign in
            </button>
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => void go("up")}>
              Create account
            </button>
          </div>
          <details>
            <summary className="pg-muted">Advanced</summary>
            <label className="pg-muted">
              Domain used behind usernames (default {DEFAULT_LOGIN_DOMAIN}). Typing a real email as the username also works.
              <input value={domain} onChange={(e) => setDomain(e.target.value)} />
            </label>
          </details>
        </form>
      )}
      {msg && <p className="pg-error">{msg}</p>}
      <p className="pg-muted">
        Sync: {sync.phase === "off" ? sync.message || "not signed in" : sync.message}
        {sync.at ? ` · ${new Date(sync.at).toLocaleTimeString()}` : ""}
      </p>
    </section>
  );
}
