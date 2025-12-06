import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, X, Trophy, User } from 'lucide-react';
import api from '../../api/index.js';

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchBatch();
  }, [id]);

  const fetchBatch = async () => {
    try {
      const { data } = await api.get(`/teacher/batches/${id}`);
      setBatch(data);
    } catch (err) {
      console.error('Failed to load batch:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchStudents = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await api.get(`/teacher/students/search?q=${query}`);
      const existingIds = batch?.students?.map((s) => s._id) || [];
      setSearchResults(data.filter((s) => !existingIds.includes(s._id)));
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddStudent = async (studentId) => {
    try {
      await api.post(`/teacher/batches/${id}/students`, { studentId });
      await fetchBatch();
      setShowAddModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      alert('Failed to add student');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student from the batch?')) return;
    try {
      await api.delete(`/teacher/batches/${id}/students/${studentId}`);
      await fetchBatch();
    } catch (err) {
      alert('Failed to remove student');
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading batch details...</div>;
  }

  if (!batch) {
    return <div className="text-slate-400">Batch not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/teacher/batches')}
            className="text-slate-400 hover:text-white mb-2"
          >
            ← Back to Batches
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{batch.name}</h1>
          {batch.description && <p className="text-slate-400">{batch.description}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/teacher/batches/${id}/leaderboard`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Students Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Students ({batch.students?.length || 0})
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </div>
            <div className="space-y-2">
              {batch.students?.length > 0 ? (
                batch.students.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border-2 border-white/20 bg-black/40 overflow-hidden flex items-center justify-center">
                        {student.profileImage || student.avatar ? (
                          <img
                            src={((student.profileImage || student.avatar).startsWith('http')
                              ? (student.profileImage || student.avatar)
                              : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${student.profileImage || student.avatar}`)}
                            alt={student.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className={`text-sm font-semibold text-slate-300 ${student.profileImage || student.avatar ? 'hidden' : ''}`}>
                          {student.name?.charAt(0)?.toUpperCase() || (
                            <User className="w-5 h-5 text-slate-300" />
                          )}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student._id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm text-center py-4">No students in this batch</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Batch Info */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Batch Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">Subject</p>
                <p className="text-sm text-white">{batch.subject || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Created</p>
                <p className="text-sm text-white">
                  {new Date(batch.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Add Student</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchStudents(e.target.value);
              }}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50 mb-4"
            />
            {searching && <p className="text-slate-400 text-sm">Searching...</p>}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-purple-500/30 transition cursor-pointer"
                  onClick={() => handleAddStudent(student._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full border border-white/20 bg-black/40 overflow-hidden flex items-center justify-center">
                      {student.profileImage || student.avatar ? (
                        <img
                          src={((student.profileImage || student.avatar).startsWith('http')
                            ? (student.profileImage || student.avatar)
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${student.profileImage || student.avatar}`)}
                          alt={student.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`text-xs font-semibold text-slate-300 ${student.profileImage || student.avatar ? 'hidden' : ''}`}>
                        {student.name?.charAt(0)?.toUpperCase() || (
                          <User className="w-4 h-4 text-slate-300" />
                        )}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.email}</p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-purple-400" />
                </div>
              ))}
              {searchQuery && !searching && searchResults.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No students found</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BatchDetails;

