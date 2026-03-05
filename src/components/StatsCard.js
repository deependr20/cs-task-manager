export default function StatsCard({ title, value, icon, color = 'primary', trend, onClick, active }) {
  const configs = {
    primary: {
      bg: 'from-violet-600 to-indigo-500',
      glow: 'shadow-violet-200',
      badge: 'bg-violet-100 text-violet-700',
    },
    blue: {
      bg: 'from-blue-600 to-cyan-500',
      glow: 'shadow-blue-200',
      badge: 'bg-blue-100 text-blue-700',
    },
    amber: {
      bg: 'from-amber-500 to-orange-400',
      glow: 'shadow-amber-200',
      badge: 'bg-amber-100 text-amber-700',
    },
    green: {
      bg: 'from-emerald-600 to-teal-500',
      glow: 'shadow-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
    },
    purple: {
      bg: 'from-purple-600 to-pink-500',
      glow: 'shadow-purple-200',
      badge: 'bg-purple-100 text-purple-700',
    },
  };

  const cfg = configs[color] || configs.primary;

  const wrapperClass = `relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${cfg.bg} shadow-xl ${cfg.glow} group transition-all duration-300 text-left w-full ${onClick ? 'cursor-pointer hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent' : ''} ${active ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-transparent' : ''}`;

  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={wrapperClass}
    >
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-2 w-24 h-24 rounded-full bg-white/5" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">{title}</p>
          <p className="text-4xl font-black text-white">{value}</p>
          {trend && (
            <p className="mt-2 text-white/70 text-xs font-medium">{trend}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 text-white">
          {icon}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 rounded-full">
        <div className="h-full w-2/3 bg-white/50 rounded-full group-hover:w-full transition-all duration-700" />
      </div>
    </div>
  );
}