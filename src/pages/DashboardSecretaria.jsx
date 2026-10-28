import React, { useState } from 'react';
import CalendarioSemanal from '../components/CalendarioSemanal';

const citasIniciales = [
  {
    id: 1,
    paciente: 'Elena Rostova',
    iniciales: 'ER',
    edad: 31,
    genero: 'Mujer',
    hora: '09:30 AM',
    especialidad: 'Cardiología',
    consultorio: 'Consultorio 104',
    estado: 'En espera',
    motivo: 'Control rutinario de seguimiento cardiológico y expedición de receta médica.'
  },
  {
    id: 2,
    paciente: 'Carlos Mendoza',
    iniciales: 'CM',
    edad: 45,
    genero: 'Hombre',
    hora: '10:15 AM',
    especialidad: 'Medicina General',
    consultorio: 'Consultorio 101',
    estado: 'Pendiente',
    motivo: 'Revisión de resultados de laboratorio generales.'
  },
  {
    id: 3,
    paciente: 'Sofía Vargas',
    iniciales: 'SV',
    edad: 28,
    genero: 'Mujer',
    hora: '11:00 AM',
    especialidad: 'Dermatología',
    consultorio: 'Consultorio 202',
    estado: 'Atendido',
    motivo: 'Consulta de revisión anual.'
  }
];

const DashboardSecretaria = ({ onCambiarVista }) => {
  // Estado para cambiar entre 'citas' y 'calendario' sin recargar la página
  const [pestañaActiva, setPestañaActiva] = useState('citas');
  const [citaSeleccionada, setCitaSeleccionada] = useState(citasIniciales[0]);

  return (
    <div className="bg-slate-50/50 font-body text-on-surface antialiased text-sm min-h-screen">
      {/* Barra Lateral Minimalista */}
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

        {/* Botón inferior para cerrar sesión o cambiar de vista en tu demo */}
        {onCambiarVista && (
          <div className="p-3 border-t border-outline-light/70">
            <button
              type="button"
              onClick={() => onCambiarVista('login')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </aside>

      {/* Contenido Principal */}
      <div className="pl-56">
        {/* Header Simplificado */}
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
              <span className="block font-headline font-semibold text-xs text-on-surface">Sarah Jenkins</span>
              <span className="block text-[11px] text-on-surface-muted">Recepción</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
              SJ
            </div>
          </div>
        </header>

        <main className="w-full pt-24 px-8 pb-8 max-w-6xl mx-auto">
          {/* Renderizado Condicional: Muestra Citas del Día O el Calendario Semanal */}
          {pestañaActiva === 'calendario' ? (
            <CalendarioSemanal />
          ) : (
            <div className="flex flex-col gap-6">
              {/* Título y Botón Principal */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">Citas del Día</h1>
                  <p className="text-xs text-on-surface-muted mt-0.5">Gestiona las consultas programadas para hoy</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors" type="button">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Nueva Cita</span>
                </button>
              </div>

              {/* Resumen Simple (3 tarjetas limpias) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-outline-light rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-on-surface-muted">Total Citas Hoy</span>
                    <p className="font-headline text-2xl font-bold text-on-surface mt-1">12</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-on-surface-muted">
                    <span className="material-symbols-outlined">event</span>
                  </div>
                </div>

                <div className="bg-white border border-outline-light rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-on-surface-muted">Pendientes / En Espera</span>
                    <p className="font-headline text-2xl font-bold text-amber-600 mt-1">5</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                </div>

                <div className="bg-white border border-outline-light rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-on-surface-muted">Completadas</span>
                    <p className="font-headline text-2xl font-bold text-teal-700 mt-1">7</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                </div>
              </div>

              {/* Contenedor Principal: Tabla + Detalle */}
              <div className="grid grid-cols-12 gap-6 items-start">
                <div className="col-span-12 lg:col-span-8 bg-white border border-outline-light rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-light bg-slate-50/70 text-[11px] font-semibold text-on-surface-muted uppercase">
                        <th className="py-3 px-4">Paciente</th>
                        <th className="py-3 px-4">Hora</th>
                        <th className="py-3 px-4">Consultorio</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-light text-on-surface">
                      {citasIniciales.map((cita) => {
                        const seleccionada = citaSeleccionada.id === cita.id;
                        return (
                          <tr 
                            key={cita.id}
                            onClick={() => setCitaSeleccionada(cita)}
                            className={`transition-colors cursor-pointer ${
                              seleccionada ? 'bg-teal-50/40' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-semibold text-xs">
                                  {cita.iniciales}
                                </div>
                                <span className="font-semibold text-[13px]">{cita.paciente}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-xs">{cita.hora}</td>
                            <td className="py-3.5 px-4">
                              <span className="block text-xs font-medium">{cita.especialidad}</span>
                              <span className="block text-[11px] text-on-surface-muted">{cita.consultorio}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                cita.estado === 'Atendido' 
                                  ? 'bg-teal-50 text-teal-700' 
                                  : cita.estado === 'En espera'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {cita.estado}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button className="text-xs font-semibold text-primary hover:underline" type="button">
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Panel Lateral de Detalle */}
                <div className="col-span-12 lg:col-span-4 bg-white border border-outline-light rounded-xl p-5 flex flex-col gap-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-outline-light pb-3">
                    <span className="font-headline font-semibold text-xs text-on-surface uppercase tracking-wider">
                      Información de la Cita
                    </span>
                    <span className="text-xs text-on-surface-muted">#{citaSeleccionada.id}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-sm">
                      {citaSeleccionada.iniciales}
                    </div>
                    <div>
                      <h2 className="font-headline font-bold text-base text-on-surface">{citaSeleccionada.paciente}</h2>
                      <span className="text-xs text-on-surface-muted">{citaSeleccionada.edad} años • {citaSeleccionada.genero}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-outline-light/60 text-xs">
                    <div>
                      <span className="text-[11px] text-on-surface-muted block">Horario</span>
                      <span className="font-semibold">{citaSeleccionada.hora}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-muted block">Ubicación</span>
                      <span className="font-semibold">{citaSeleccionada.consultorio}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-muted uppercase block mb-1">
                      Motivo de consulta
                    </span>
                    <p className="text-xs text-on-surface bg-slate-50 p-3 rounded-lg border border-outline-light/60 leading-relaxed">
                      {citaSeleccionada.motivo}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition-colors" type="button">
                      Marcar Atendido
                    </button>
                    <button className="px-3 py-2 border border-outline-light text-on-surface-muted hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors" type="button">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardSecretaria;