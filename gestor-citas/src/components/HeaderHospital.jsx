import React from 'react';

const HeaderHospital = ({ usuario }) => {
  return (
    <header className="fixed top-0 left-56 right-0 h-16 bg-white border-b border-outline-light z-30 px-8 flex items-center justify-between">
      <div className="relative w-80">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
        <input 
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-outline-light rounded-lg text-xs text-on-surface placeholder:text-outline focus:bg-white focus:outline-none focus:border-primary transition-all" 
          placeholder="Buscar paciente..." 
          type="text" 
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="block font-headline font-semibold text-xs text-on-surface capitalize">{usuario?.nombre || 'Sarah Jenkins'}</span>
          <span className="block text-[11px] text-on-surface-muted capitalize">{usuario?.rol || 'Recepción'}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs uppercase">
          {usuario?.nombre ? usuario.nombre.charAt(0) : 'SJ'}
        </div>
      </div>
    </header>
  );
};

export default HeaderHospital;