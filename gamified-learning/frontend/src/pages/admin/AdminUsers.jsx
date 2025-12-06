import { useState } from 'react';
// import axios from 'axios'; // TODO: connect to backend API

const mockUsers = [
  { id: 1, name: 'Alex Carter', email: 'alex@example.com', role: 'student', status: 'active' },
  { id: 2, name: 'Priya Sharma', email: 'priya@example.com', role: 'teacher', status: 'active' },
  { id: 3, name: 'Jordan Lee', email: 'jordan@example.com', role: 'student', status: 'inactive' },
  { id: 4, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' }
];

const roles = ['all', 'student', 'teacher', 'admin'];

const AdminUsers = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesRole = filter === 'all' || user.role === filter;
    const matchesSearch =
      !search ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Users</h2>
          <p className="text-xs text-slate-400">
            Inspect all registered users. Actions currently operate on mock data.
          </p>
        </div>
        <input
          className="w-full max-w-xs rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-primary/60"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
                    // TODO: call admin API to change role
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="button"
                    className="mr-2 rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                    // TODO: open profile modal
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                    // TODO: toggle active / inactive status via API
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
    </div>
  );
};

export default AdminUsers;


