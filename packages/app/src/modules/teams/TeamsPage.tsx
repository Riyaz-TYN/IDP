import { useState, useEffect, type CSSProperties, type FormEvent } from 'react';

interface Team {
  groupId: string;
  username: string;
  displayName: string;
  members: string[];
}

const API = '/api/credentials-auth';

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, CSSProperties> = {
  page: {
    padding: '32px 40px',
    fontFamily: "'Inter', system-ui, sans-serif",
    background: '#f7f9fc',
    minHeight: '100%',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: '6px 0 0',
  },
  newTeamBtn: {
    background: '#0070C0',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  stateText: {
    color: '#64748b',
    fontSize: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: 20,
  },
  // Card
  card: {
    background: '#ffffff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 12px rgba(16,35,63,0.07)',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    background: '#fafbfd',
  },
  cardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 9,
    background: '#10233F',
    color: '#22D3EE',
    fontWeight: 800,
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardHeaderText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  cardName: {
    fontSize: 15,
    fontWeight: 700,
    color: '#0f172a',
  },
  cardMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  deleteBtn: {
    background: 'transparent',
    border: '1px solid #fecaca',
    borderRadius: 6,
    color: '#ef4444',
    fontSize: 12,
    padding: '4px 10px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  confirmRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  confirmText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: 600,
  },
  confirmYes: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    padding: '3px 10px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  confirmNo: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: 5,
    padding: '3px 10px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    color: '#64748b',
  },
  memberSection: {
    padding: '16px 20px',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 10,
  },
  memberChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    minHeight: 28,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: '#eff6ff',
    color: '#0070C0',
    borderRadius: 20,
    padding: '4px 10px',
    fontSize: 13,
    fontWeight: 500,
  },
  chipRemove: {
    background: 'none',
    border: 'none',
    color: '#0070C0',
    cursor: 'pointer',
    fontSize: 15,
    lineHeight: '1',
    padding: 0,
    opacity: 0.6,
  },
  emptyHint: {
    fontSize: 13,
    color: '#cbd5e1',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  memberInputRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: 7,
    color: '#0f172a',
    fontSize: 14,
    padding: '9px 12px',
    marginBottom: 14,
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    width: '100%',
    boxSizing: 'border-box',
  },
  addBtn: {
    background: '#0070C0',
    color: '#fff',
    border: 'none',
    borderRadius: 7,
    padding: '9px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    flexShrink: 0,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    margin: '8px 0 0',
    fontWeight: 500,
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 0',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 24,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    padding: '32px 36px',
    width: 520,
    maxWidth: '90vw',
    boxShadow: '0 24px 60px rgba(16,35,63,0.2)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 18,
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: '1',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#475569',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  modalActions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  cancelBtn: {
    background: 'transparent',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    color: '#475569',
    fontSize: 14,
    fontWeight: 600,
    padding: '10px 20px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  submitBtn: {
    background: '#0070C0',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
};

// ─── Create Team Modal ────────────────────────────────────────────────────────

function CreateTeamModal({
  onCreated,
  onClose,
}: {
  onCreated: (team: Team) => void;
  onClose: () => void;
}) {
  const [displayName, setDisplayName] = useState('');
  const [groupId, setGroupId]         = useState('');
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers]         = useState<string[]>([]);
  const [error, setError]             = useState('');
  const [saving, setSaving]           = useState(false);

  const addMember = () => {
    const name = memberInput.trim();
    if (name && !members.includes(name)) {
      setMembers(prev => [...prev, name]);
      setMemberInput('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const team = await apiFetch<Team>('/teams', {
        method: 'POST',
        body: JSON.stringify({ groupId, username, password, displayName, members }),
      });
      onCreated(team);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <span style={s.modalTitle}>Create New Team</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.fieldGrid}>
            <div style={s.field}>
              <label htmlFor="ct-displayName" style={s.label}>Team Name</label>
              <input
                id="ct-displayName"
                style={s.input}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Team Alpha"
                required
              />
            </div>
            <div style={s.field}>
              <label htmlFor="ct-groupId" style={s.label}>Group ID</label>
              <input
                id="ct-groupId"
                style={s.input}
                value={groupId}
                onChange={e => setGroupId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="e.g. team-alpha"
                required
              />
            </div>
            <div style={s.field}>
              <label htmlFor="ct-username" style={s.label}>Login Username</label>
              <input
                id="ct-username"
                style={s.input}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. team-alpha"
                required
              />
            </div>
            <div style={s.field}>
              <label htmlFor="ct-password" style={s.label}>Password</label>
              <input
                id="ct-password"
                style={s.input}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Set a team password"
                required
              />
            </div>
          </div>

          <div style={s.field}>
            <label htmlFor="ct-member" style={s.label}>Members</label>
            <div style={s.memberInputRow}>
              <input
                id="ct-member"
                style={{ ...s.input, marginBottom: 0, flex: 1 }}
                value={memberInput}
                onChange={e => setMemberInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMember(); } }}
                placeholder="Type a name and press Enter or Add"
              />
              <button type="button" style={s.addBtn} onClick={addMember}>Add</button>
            </div>
            <div style={{ ...s.memberChips, marginTop: 10 }}>
              {members.map(m => (
                <span key={m} style={s.chip}>
                  {m}
                  <button
                    type="button"
                    style={s.chipRemove}
                    onClick={() => setMembers(prev => prev.filter(x => x !== m))}
                  >×</button>
                </span>
              ))}
              {members.length === 0 && <span style={s.emptyHint}>No members added yet</span>}
            </div>
          </div>

          {error && <p style={s.errorText}>{error}</p>}

          <div style={s.modalActions}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={s.submitBtn} disabled={saving}>
              {saving ? 'Creating…' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Team Card ────────────────────────────────────────────────────────────────

function TeamCard({
  team,
  onUpdated,
  onDeleted,
}: {
  team: Team;
  onUpdated: (team: Team) => void;
  onDeleted: (groupId: string) => void;
}) {
  const [members, setMembers]           = useState<string[]>(team.members);
  const [memberInput, setMemberInput]   = useState('');
  const [saving, setSaving]             = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError]               = useState('');

  const saveMembers = async (next: string[]) => {
    setSaving(true);
    setError('');
    try {
      const updated = await apiFetch<Team>(`/teams/${team.groupId}`, {
        method: 'PUT',
        body: JSON.stringify({ members: next }),
      });
      setMembers(updated.members);
      onUpdated(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addMember = async () => {
    const name = memberInput.trim();
    if (!name || members.includes(name)) { setMemberInput(''); return; }
    await saveMembers([...members, name]);
    setMemberInput('');
  };

  const removeMember = (name: string) => saveMembers(members.filter(m => m !== name));

  const handleDelete = async () => {
    try {
      await apiFetch(`/teams/${team.groupId}`, { method: 'DELETE' });
      onDeleted(team.groupId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div style={s.cardAvatar}>{team.displayName.charAt(0).toUpperCase()}</div>
        <div style={s.cardHeaderText}>
          <span style={s.cardName}>{team.displayName}</span>
          <span style={s.cardMeta}>
            @{team.username} · {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
        </div>
        {!confirmDelete ? (
          <button style={s.deleteBtn} onClick={() => setConfirmDelete(true)}>Delete</button>
        ) : (
          <div style={s.confirmRow}>
            <span style={s.confirmText}>Sure?</span>
            <button style={s.confirmYes} onClick={handleDelete}>Yes</button>
            <button style={s.confirmNo} onClick={() => setConfirmDelete(false)}>No</button>
          </div>
        )}
      </div>

      <div style={s.memberSection}>
        <span style={s.sectionLabel}>Members</span>
        <div style={s.memberChips}>
          {members.map(m => (
            <span key={m} style={s.chip}>
              {m}
              <button
                type="button"
                style={s.chipRemove}
                onClick={() => removeMember(m)}
                disabled={saving}
              >×</button>
            </span>
          ))}
          {members.length === 0 && <span style={s.emptyHint}>No members — add one below</span>}
        </div>
        <div style={s.memberInputRow}>
          <input
            id={`add-${team.groupId}`}
            style={{ ...s.input, marginBottom: 0, flex: 1, fontSize: 13 }}
            value={memberInput}
            onChange={e => setMemberInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void addMember(); } }}
            placeholder="Add member name…"
            disabled={saving}
          />
          <button type="button" style={s.addBtn} onClick={() => void addMember()} disabled={saving}>
            {saving ? '…' : 'Add'}
          </button>
        </div>
        {error && <p style={s.errorText}>{error}</p>}
      </div>
    </div>
  );
}

// ─── Teams Page ───────────────────────────────────────────────────────────────

export function TeamsPage() {
  const [teams, setTeams]       = useState<Team[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    apiFetch<Team[]>('/teams')
      .then(setTeams)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (team: Team) => {
    setTeams(prev => [...prev, team]);
    setShowCreate(false);
  };

  const handleUpdated = (updated: Team) =>
    setTeams(prev => prev.map(t => (t.groupId === updated.groupId ? updated : t)));

  const handleDeleted = (groupId: string) =>
    setTeams(prev => prev.filter(t => t.groupId !== groupId));

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Team Management</h1>
          <p style={s.pageSubtitle}>Create teams, add or remove members at any time.</p>
        </div>
        <button style={s.newTeamBtn} onClick={() => setShowCreate(true)}>+ New Team</button>
      </div>

      {loading && <p style={s.stateText}>Loading teams…</p>}
      {error && <p style={s.errorText}>{error}</p>}

      {!loading && !error && teams.length === 0 && (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>👥</div>
          <p style={s.emptyStateText}>No teams yet. Create your first team to get started.</p>
          <button style={s.newTeamBtn} onClick={() => setShowCreate(true)}>Create Team</button>
        </div>
      )}

      <div style={s.grid}>
        {teams.map(team => (
          <TeamCard
            key={team.groupId}
            team={team}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        ))}
      </div>

      {showCreate && (
        <CreateTeamModal onCreated={handleCreated} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
