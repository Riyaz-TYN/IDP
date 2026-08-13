import React, { useState } from 'react';

const SESSION_KEY = 'tyn-auth';

function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        sessionStorage.setItem(SESSION_KEY, 'true');
        onSuccess();
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
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>Y</div>
          <span style={styles.logoText}>
            the <span style={styles.logoYellow}>yellow</span> network
          </span>
        </div>

        <p style={styles.tagline}>INTERNAL DEVELOPER PORTAL</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="tyn-developers"
            required
          />

          <label style={styles.label}>Password</label>
          <input
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
          Access restricted to The Yellow Network developers.
        </p>
      </div>
    </div>
  );
}

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(
    sessionStorage.getItem(SESSION_KEY) === 'true',
  );

  if (!authed) {
    return <LoginPage onSuccess={() => setAuthed(true)} />;
  }

  return <>{children}</>;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d1b2e',
    fontFamily: "'Arial Black', Arial, sans-serif",
  },
  card: {
    background: '#1a2d4a',
    borderRadius: 12,
    padding: '48px 40px',
    width: 380,
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  logoIcon: {
    background: '#c8e600',
    color: '#0d1b2e',
    fontWeight: 900,
    fontSize: 18,
    width: 36,
    height: 36,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 900,
    color: '#ffffff',
    letterSpacing: '-0.3px',
  },
  logoYellow: {
    background: '#c8e600',
    color: '#0d1b2e',
    borderRadius: 4,
    padding: '0 4px',
  },
  tagline: {
    fontSize: 9,
    letterSpacing: '2.5px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    marginBottom: 32,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 700,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    fontFamily: 'Arial, sans-serif',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  input: {
    background: '#0d1b2e',
    border: '1.5px solid #2a3f5f',
    borderRadius: 6,
    color: '#ffffff',
    fontSize: 15,
    padding: '11px 14px',
    marginBottom: 18,
    outline: 'none',
    fontFamily: 'Arial, sans-serif',
    width: '100%',
    boxSizing: 'border-box',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    marginBottom: 12,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 600,
  },
  button: {
    background: '#c8e600',
    color: '#0d1b2e',
    border: 'none',
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 900,
    padding: '13px 0',
    cursor: 'pointer',
    marginTop: 4,
    fontFamily: "'Arial Black', Arial, sans-serif",
    letterSpacing: '0.3px',
    transition: 'opacity 0.15s',
    width: '100%',
  },
  footer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 24,
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.5,
  },
};
