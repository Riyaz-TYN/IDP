import { useState, type FormEvent, type CSSProperties, type ReactNode } from 'react';

export const SESSION_KEY = 'tyn-auth';

export interface TeamSession {
  groupId: string;
  displayName: string;
  members: string[];
  isAdmin: boolean;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, CSSProperties> = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f7f9fc',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  card: {
    background: '#ffffff',
    borderRadius: 16,
    padding: '48px 40px',
    width: 400,
    boxShadow: '0 20px 45px rgba(16,35,63,0.12)',
    border: '1px solid #e2e8f0',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  logoIcon: {
    background: '#10233F',
    color: '#22D3EE',
    fontWeight: 900,
    fontSize: 18,
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  tagline: {
    fontSize: 9,
    letterSpacing: '1.5px',
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 32,
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 6,
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
  input: {
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    color: '#0f172a',
    fontSize: 14,
    padding: '10px 13px',
    marginBottom: 16,
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: 500,
  },
  button: {
    background: '#0070C0',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    padding: '12px 0',
    cursor: 'pointer',
    marginTop: 4,
    fontFamily: 'Inter, sans-serif',
    width: '100%',
    transition: 'background 0.15s',
  },
  footer: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 1.6,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getSession(): TeamSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage({ onSuccess }: { onSuccess: (session: TeamSession) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/credentials-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        const session: TeamSession = {
          groupId:     data.groupId,
          displayName: data.displayName,
          members:     data.members,
          isAdmin:     data.isAdmin ?? false,
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        onSuccess(session);
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>N</div>
          <span style={styles.logoText}>NiFo · IDP</span>
        </div>
        <p style={styles.tagline}>THE YELLOW NETWORK · INTERNAL DEVELOPER PORTAL</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label htmlFor="tyn-username" style={styles.label}>Team Username</label>
          <input
            id="tyn-username"
            style={styles.input}
            type="text"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="e.g. team-alpha"
            required
          />

          <label htmlFor="tyn-password" style={styles.label}>Password</label>
          <input
            id="tyn-password"
            style={styles.input}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={styles.footer}>
          Each team has their own credentials.<br />
          Contact your IDP admin if you need access.
        </p>
      </div>
    </div>
  );
}

// ─── Gate ─────────────────────────────────────────────────────────────────────

export function LoginGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TeamSession | null>(getSession);

  if (!session) {
    return <LoginPage onSuccess={setSession} />;
  }

  return <>{children}</>;
}
