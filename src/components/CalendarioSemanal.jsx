import React, { useState } from 'react';

const datosSemana = [
  {
    dia: 'Lunes',
    fecha: '12 Oct',
    ocupadas: 3,
    capacidad: 10,
    citas: [
      { id: 1, hora: '09:00 AM', paciente: 'Elena Rostova', doctor: 'Dr. Ruiz' },
      { id: 2, hora: '10:30 AM', paciente: 'Marco Polo', doctor: 'Dra. Salas' },
      { id: 3, hora: '12:00 PM', paciente: 'Ana Gómez', doctor: 'Dr. Ruiz' },
    ]
  },
  {
    dia: 'Martes',
    fecha: '13 Oct',
    ocupadas: 7,
    capacidad: 10,
    citas: [
      { id: 4, hora: '08:00 AM', paciente: 'Luis Pérez', doctor: 'Dr. Castro' },
      { id: 5, hora: '09:00 AM', paciente: 'Sofía Vargas', doctor: 'Dra. Salas' },
      { id: 6, hora: '11:00 AM', paciente: 'Jorge Ríos', doctor: 'Dr. Ruiz' },
      { id: 7, hora: '01:00 PM', paciente: 'Diana Paz', doctor: 'Dr. Castro' },
    ]
  },
  {
    dia: 'Miércoles',
    fecha: '14 Oct',
    ocupadas: 10,
    capacidad: 10,
    citas: [
      { id: 8, hora: '08:00 AM', paciente: 'Carlos Slim', doctor: 'Dr. Ruiz' },
      { id: 9, hora: '09:30 AM', paciente: 'Marta Díaz', doctor: 'Dra. Salas' },
      { id: 10, hora: '11:00 AM', paciente: 'Pedro Páramo', doctor: 'Dr. Castro' },
    ]
  },
  {
    dia: 'Jueves',
    fecha: '15 Oct',
    ocupadas: 2,
    capacidad: 10,
    citas: [
      { id: 11, hora: '10:00 AM', paciente: 'Lucía Méndez', doctor: 'Dra. Salas' },
      { id: 12, hora: '04:00 PM', paciente: 'Raúl Velasco', doctor: 'Dr. Ruiz' },
    ]
  },
  {
    dia: 'Viernes',
    fecha: '16 Oct',
    ocupadas: 6,
    capacidad: 10,
    citas: [
      { id: 13, hora: '09:00 AM', paciente: 'Andrés Bello', doctor: 'Dr. Castro' },
      { id: 14, hora: '11:30 AM', paciente: 'Carla Morrison', doctor: 'Dra. Salas' },
    ]
  }
];

// Función que determina el color del semáforo según porcentaje de ocupación
const obtenerEstiloSemaforo = (ocupadas, capacidad) => {
  const porcentaje = (ocupadas / capacidad) * 100;
  if (porcentaje >= 85) {
    return {
      card: 'bg-red-50/70 border-red-200',
      badge: 'bg-red-100 text-red-800 border-red-300',
      bar: 'bg-red-500',
      texto: 'Saturado'
    };
  }
  if (porcentaje >= 50) {
    return {
      card: 'bg-amber-50/70 border-amber-200',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      bar: 'bg-amber-500',
      texto: 'Media'
    };
  }
  return {
    card: 'bg-emerald-50/70 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bar: 'bg-emerald-500',
    texto: 'Disponible'
  };
};

const CalendarioSemanal = () => {
  const [diaSeleccionado, setDiaSeleccionado] = useState(datosSemana[0]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Encabezado y Leyenda del Semáforo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">Calendario Semanal</h1>
          <p className="text-xs text-on-surface-muted mt-0.5">Disponibilidad de la clínica del 12 al 16 de Octubre</p>
        </div>

        {/* Leyenda de colores */}
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-outline-light text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Libre
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Media ocupación
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Saturado
          </span>
        </div>
      </div>

      {/* Grid de los 5 días (Semáforo) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {datosSemana.map((item) => {
          const semaforo = obtenerEstiloSemaforo(item.ocupadas, item.capacidad);
          const activo = diaSeleccionado.dia === item.dia;
          const porcentaje = Math.round((item.ocupadas / item.capacidad) * 100);

          return (
            <div
              key={item.dia}
              onClick={() => setDiaSeleccionado(item)}
              className={`rounded-xl border p-4 cursor-pointer transition-all flex flex-col justify-between ${semaforo.card} ${
                activo ? 'ring-2 ring-primary shadow-sm scale-[1.01]' : 'hover:opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-headline font-bold text-base text-slate-800">{item.dia}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${semaforo.badge}`}>
                    {semaforo.texto}
                  </span>
                </div>
                <span className="text-xs text-slate-500 block mb-4">{item.fecha}</span>
              </div>

              {/* Barra de progreso y contador */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Citas agendadas</span>
                  <span>{item.ocupadas} / {item.capacidad}</span>
                </div>
                <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden border border-slate-200/60">
                  <div className={`h-full ${semaforo.bar}`} style={{ width: `${porcentaje}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalle de las citas del día seleccionado */}
      <div className="bg-white border border-outline-light rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-outline-light pb-4 mb-4">
          <div>
            <h2 className="font-headline font-bold text-base text-on-surface">
              Citas del {diaSeleccionado.dia} ({diaSeleccionado.fecha})
            </h2>
            <p className="text-xs text-on-surface-muted">
              Mostrando {diaSeleccionado.citas.length} citas registradas • {diaSeleccionado.capacidad - diaSeleccionado.ocupadas} espacios disponibles
            </p>
          </div>
          {diaSeleccionado.ocupadas < diaSeleccionado.capacidad && (
            <button className="px-3.5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition-colors">
              + Agendar en {diaSeleccionado.dia}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {diaSeleccionado.citas.map((cita) => (
            <div key={cita.id} className="p-3.5 rounded-lg border border-outline-light bg-slate-50/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary block">{cita.hora}</span>
                <span className="text-sm font-semibold text-on-surface block mt-0.5">{cita.paciente}</span>
                <span className="text-[11px] text-on-surface-muted">{cita.doctor}</span>
              </div>
              <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarioSemanal;