import React from 'react';

const SidebarHospital = ({ pestañaActiva, setPestañaActiva, onLogout }) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-outline-light z-40 flex flex-col justify-between">
      <div>
        <div className="h-16 px-6 flex items-center border-b border-outline-light/70 gap-2.5">
          <span className="material-symbols-outlined text-primary text-2xl">local_hospital</span>
          <span className="font-headline font-bold text-base tracking-tight text-on-surface">CarePoint</span>
        </div>
        <div className="p-3">
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setPestañaActiva('citas')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                pestañaActiva === 'citas'
                  ? 'bg-teal-50/80 text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-50 font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">today</span>
              <span className="text-[13px]">Citas del Día</span>
            </button>
            <button
              type="button"
              onClick={() => setPestañaActiva('calendario')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                pestañaActiva === 'calendario'
                  ? 'bg-teal-50/80 text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-50 font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              <span className="text-[13px]">Calendario Semanal</span>
            </button>
          </nav>
        </div>
      </div>
      {onLogout && (
        <div className="p-3 border-t border-outline-light/70">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default SidebarHospital;