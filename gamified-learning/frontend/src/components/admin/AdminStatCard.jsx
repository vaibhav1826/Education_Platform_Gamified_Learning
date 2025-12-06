const AdminStatCard = ({ label, value, subtitle }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glass-card">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};

export default AdminStatCard;


