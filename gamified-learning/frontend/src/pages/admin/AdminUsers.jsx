import { useEffect, useMemo, useState } from 'react';
import useApi from '../../hooks/useApi.js';

const roles = ['all', 'student', 'teacher', 'admin'];

const AdminUsers = () => {
  const api = useApi();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, studentsRes] = await Promise.all([api.get('/admin/teachers'), api.get('/admin/students')]);
        setUsers([...teachersRes.data, ...studentsRes.data]);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesRole = filter === 'all' || user.role === filter;
        const matchesSearch =
          !search ||
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase());
        return matchesRole && matchesSearch;
      }),
    [users, filter, search]
  );

  const handleStatus = async (user) => {
    setSaving(true);
    try {
      const next = user.status === 'active' ? 'inactive' : 'active';
      await api.patch(`/admin/users/${user._id}/status`, { status: next });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, status: next } : u)));
    } catch (err) {
      console.error('Status update failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRole = async (user, role) => {
    setSaving(true);
    try {
      await api.patch(`/admin/users/${user._id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role } : u)));
    } catch (err) {
      console.error('Role update failed', err);
    } finally {
      setSaving(false);
    }
  };

  const loadDetail = async (user) => {
    setSelected(user);
    setDetail(null);
    try {
      if (user.role === 'student') {
        const [statsRes, batchesRes, submissionsRes] = await Promise.all([
          api.get(`/admin/students/${user._id}/stats`),
          api.get(`/admin/students/${user._id}/batches`),
          api.get(`/admin/students/${user._id}/submissions`)
        ]);
        setDetail({
          stats: statsRes.data,
          batches: batchesRes.data,
          submissions: submissionsRes.data
        });
      } else {
        setDetail({ stats: user });
      }
    } catch (err) {
      console.error('Failed to load user detail', err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Users</h2>
          <p className="text-xs text-slate-400">Inspect all registered users. Live admin controls.</p>
        </div>
        <input
          className="w-full max-w-xs rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-primary/60"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading users...</p> : null}

      <div className="flex flex-wrap gap-2 text-xs">
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setFilter(role)}
            className={`rounded-full border px-3 py-1 font-semibold capitalize transition ${
              filter === role
                ? 'border-primary/70 bg-primary/20 text-white'
                : 'border-white/10 bg-black/40 text-slate-300 hover:border-white/30'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.15em] text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full border border-white/15 bg-black/40">
                      {user.profileImage || user.avatar ? (
                        <img
                          src={((user.profileImage || user.avatar).startsWith('http')
                            ? (user.profileImage || user.avatar)
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profileImage || user.avatar}`)}
                          alt={user.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`flex h-full w-full items-center justify-center text-xs text-slate-300 ${user.profileImage || user.avatar ? 'hidden' : ''}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{user.email}</td>
                <td className="px-4 py-3 capitalize text-slate-200">{user.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      user.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-slate-500/15 text-slate-300'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-slate-200">
                  <select
                    className="mr-2 rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-xs"
                    defaultValue={user.role}
                    onChange={(e) => handleRole(user, e.target.value)}
                    disabled={saving}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="button"
                    className="mr-2 rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                    onClick={() => loadDetail(user)}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                    onClick={() => handleStatus(user)}
                    disabled={saving}
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-sm text-slate-400">
                  No users match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="glass-panel rounded-2xl border border-primary/40 p-5 shadow-neon">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">User Detail</p>
              <h3 className="text-xl font-semibold">{selected.name}</h3>
              <p className="text-sm text-slate-400">{selected.email}</p>
              <p className="text-xs text-slate-400">Role: {selected.role}</p>
            </div>
            <button type="button" className="text-xs text-slate-400" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>

          {!detail && <p className="mt-3 text-sm text-slate-400">Loading details...</p>}

          {detail?.stats && selected.role === 'student' && (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">XP</p>
                <p className="text-lg font-semibold">{detail.stats.xp ?? 0}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Level</p>
                <p className="text-lg font-semibold">{detail.stats.level ?? 1}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Streak</p>
                <p className="text-lg font-semibold">{detail.stats.streak?.count ?? 0} days</p>
              </div>
            </div>
          )}

          {detail?.batches && detail.batches.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Batches</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {detail.batches.map((b) => (
                  <div key={b._id} className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <p className="font-semibold">{b.name}</p>
                    <p className="text-xs text-slate-500">Teacher: {b.teacher?.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail?.submissions && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent submissions</p>
              <div className="mt-2 space-y-2">
                {detail.submissions.slice(0, 5).map((s) => (
                  <div key={s._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                    <div>
                      <p className="font-semibold">{s.quiz?.title || 'Quiz'}</p>
                      <p className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="text-xs text-emerald-300">{s.score}/{s.totalQuestions}</span>
                  </div>
                ))}
                {detail.submissions.length === 0 && <p className="text-xs text-slate-500">No submissions.</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;


