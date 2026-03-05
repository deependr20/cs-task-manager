'use client';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onRaiseMemo, onViewMemo, existingMemo, role }) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  const statusConfig = {
    'Pending': {
      dot: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300',
      border: 'border-amber-400',
      cardBg: 'bg-amber-50',
      innerBg: 'bg-amber-100/70',
      remarksBg: 'bg-amber-100',
    },
    'In Progress': {
      dot: 'bg-blue-500',
      badge: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300',
      border: 'border-blue-500',
      cardBg: 'bg-blue-50',
      innerBg: 'bg-blue-100/70',
      remarksBg: 'bg-blue-100',
    },
    'Pending Manager Approval': {
      dot: 'bg-violet-500',
      badge: 'bg-violet-100 text-violet-700 ring-1 ring-violet-300',
      border: 'border-violet-500',
      cardBg: 'bg-violet-50',
      innerBg: 'bg-violet-100/70',
      remarksBg: 'bg-violet-100',
    },
    'Pending Admin Approval': {
      dot: 'bg-orange-500',
      badge: 'bg-orange-100 text-orange-700 ring-1 ring-orange-300',
      border: 'border-orange-500',
      cardBg: 'bg-orange-50',
      innerBg: 'bg-orange-100/70',
      remarksBg: 'bg-orange-100',
    },
    'Completed': {
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300',
      border: 'border-emerald-500',
      cardBg: 'bg-emerald-50',
      innerBg: 'bg-emerald-100/70',
      remarksBg: 'bg-emerald-100',
    },
  };

  const priorityConfig = {
    High: 'bg-rose-100 text-rose-700 ring-1 ring-rose-300',
    Medium: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300',
    Low: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  };

  // Always use status config for card colors — overdue NEVER overrides card background
  const sc = statusConfig[task.status] || statusConfig['Pending'];
  const pc = priorityConfig[task.priority] || priorityConfig['Low'];

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isManagerSelfUpdate = role === 'manager';

  return (
    <div className={`group relative rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${sc.border} ${sc.cardBg}`}>
      {/* Top gradient strip */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 opacity-60" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-800 truncate group-hover:text-violet-700 transition-colors">
              {task.title}
            </h3>
            {task.companyName && (
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {task.companyName}
              </p>
            )}
          </div>
          {role === 'admin' && (
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {task.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
            {task.status}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${pc}`}>
            {task.priority}
          </span>
          {isOverdue && (
            // Sharp solid red badge — bold, high-contrast, unmissable
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white shadow-lg shadow-red-400/50 tracking-wide uppercase animate-pulse">
              ⚠ Overdue
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`${sc.innerBg} rounded-xl p-2.5`}>
            <p className="text-xs text-slate-400 mb-0.5">Due Date</p>
            <p className={`text-xs font-semibold ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
              {formatDate(task.dueDate)}
            </p>
          </div>
          {task.completionDate && (
            <div className={`${sc.innerBg} rounded-xl p-2.5`}>
              <p className="text-xs text-slate-400 mb-0.5">Completion</p>
              <p className="text-xs font-semibold text-slate-700">{formatDate(task.completionDate)}</p>
            </div>
          )}
        </div>

        {/* Assigned to */}
        {task.assignedTo && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {task.assignedTo.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">{task.assignedTo.name}</p>
              {task.assignedTo.designation && (
                <p className="text-xs text-slate-400">{task.assignedTo.designation}</p>
              )}
            </div>
          </div>
        )}

        {/* Employee / Manager status update */}
        {(role === 'employee' || role === 'manager') && onStatusChange && (
          <div className="mt-1 pt-4 border-t border-black/10">
            <p className="text-xs font-semibold text-slate-500 mb-2">Update Status</p>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              className="w-full text-sm rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all"
              disabled={
                task.status === 'Pending Manager Approval' ||
                task.status === 'Pending Admin Approval' ||
                task.status === 'Completed'
              }
            >
              <option value="Pending">📋 Pending</option>
              <option value="In Progress">⚡ In Progress</option>
              <option value={isManagerSelfUpdate ? 'Pending Admin Approval' : 'Pending Manager Approval'}>
                {isManagerSelfUpdate ? '⏳ Submit for Admin Approval' : '⏳ Submit for Manager Approval'}
              </option>
              {task.status === 'Completed' && <option value="Completed">✅ Completed</option>}
            </select>
          </div>
        )}

        {/* Raise Memo / View Memo - admin/manager */}
        {(onRaiseMemo || onViewMemo) && (role === 'admin' || role === 'manager') && (
          <div className="mt-3 pt-3 border-t border-black/10">
            {existingMemo && onViewMemo ? (
              <button
                type="button"
                onClick={() => onViewMemo(existingMemo)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Memo
              </button>
            ) : onRaiseMemo ? (
              <button
                type="button"
                onClick={() => onRaiseMemo(task)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Raise Memo
              </button>
            ) : null}
          </div>
        )}

        {/* Remarks */}
        {task.remarks && task.remarks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-black/10">
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Remarks ({task.remarks.length})
            </p>
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {task.remarks.slice(-2).map((remark, index) => (
                <div key={index} className={`${sc.remarksBg} rounded-lg p-2.5`}>
                  <p className="text-xs text-slate-600 leading-relaxed">{remark.note}</p>
                  <p className="text-xs text-violet-500 font-semibold mt-1">
                    {remark.addedBy?.name} · {new Date(remark.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}