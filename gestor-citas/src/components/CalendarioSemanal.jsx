import React, { useState, useEffect, useCallback } from 'react';

const formatearHora12 = (hora24) => {
  if (!hora24) return '';
  if (hora24.includes('AM') || hora24.includes('PM')) return hora24;
  const partes = String(hora24).split(':');
  let h = parseInt(partes[0], 10);
  const m = partes[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
};

const generarSemanaActual = () => {
  const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const base = new Date();
  const dias = [];

  for (let i = 0; i < 7; i++) {
    const f = new Date(base);
    f.setHours(0, 0, 0, 0);
    f.setDate(f.getDate() + i);
    const yyyy = f.getFullYear();
    const mm = String(f.getMonth() + 1).padStart(2, '0');
    const dd = String(f.getDate()).padStart(2, '0');
    const fechaISO = `${yyyy}-${mm}-${dd}`;
    dias.push({
      dia: i === 0 ? `Hoy (${diasNombres[f.getDay()]})` : diasNombres[f.getDay()],
      fecha: `${f.getDate()} ${mesesNombres[f.getMonth()]}`,
      fechaISO,
      capacidad: 10
    });
  }
  return dias;
};

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
  const [diasBase] = useState(() => generarSemanaActual());
  const [citasBD, setCitasBD] = useState([]);
  const [fechaSeleccionadaISO, setFechaSeleccionadaISO] = useState(() => diasBase[0].fechaISO);

  const cargarCitas = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/citas');
      if (res.ok) {
        const data = await res.json();
        setCitasBD(data);
      }
    } catch (error) {
      console.error('Error al cargar calendario desde BD:', error);
    }
  }, []);

  useEffect(() => {
    cargarCitas();
    const intervalo = setInterval(cargarCitas, 5000);
    return () => clearInterval(intervalo);
  }, [cargarCitas]);

  const datosSemana = diasBase.map((d) => {
    const citasDia = citasBD.filter(
      (c) => c.fecha === d.fechaISO && (c.estado || '').toLowerCase() !== 'cancelada'
    );
    return {
      ...d,
      ocupadas: citasDia.length,
      citas: citasDia
    };
  });

  const diaSeleccionado = datosSemana.find((d) => d.fechaISO === fechaSeleccionadaISO) || datosSemana[0];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Encabezado y Leyenda del Semáforo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">Calendario Semanal (Próximos 7 Días)</h1>
          <p className="text-xs text-on-surface-muted mt-0.5">Sincronizado dinámicamente con las citas registradas en la base de datos</p>
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

      {/* Grid de los 7 días (Semáforo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {datosSemana.map((item) => {
          const semaforo = obtenerEstiloSemaforo(item.ocupadas, item.capacidad);
          const activo = diaSeleccionado.fechaISO === item.fechaISO;
          const porcentaje = Math.min(100, Math.round((item.ocupadas / item.capacidad) * 100));

          return (
            <div
              key={item.fechaISO}
              onClick={() => setFechaSeleccionadaISO(item.fechaISO)}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all flex flex-col justify-between ${semaforo.card} ${
                activo ? 'ring-2 ring-primary shadow-sm scale-[1.01]' : 'hover:opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-headline font-bold text-xs text-slate-800">{item.dia}</span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${semaforo.badge}`}>
                    {semaforo.texto}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block mb-3">{item.fecha} ({item.fechaISO})</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Citas</span>
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
              Citas del {diaSeleccionado.dia} ({diaSeleccionado.fechaISO})
            </h2>
            <p className="text-xs text-on-surface-muted">
              Mostrando {diaSeleccionado.citas.length} citas activas • {Math.max(0, diaSeleccionado.capacidad - diaSeleccionado.ocupadas)} espacios disponibles
            </p>
          </div>
        </div>

        {diaSeleccionado.citas.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No hay citas agendadas para este día.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {diaSeleccionado.citas.map((cita) => (
              <div key={cita.num_cita} className="p-3.5 rounded-lg border border-outline-light bg-slate-50/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary block">{formatearHora12(cita.hora)}</span>
                  <span className="text-sm font-semibold text-on-surface block mt-0.5">
                    {cita.nombre_paciente || cita.num_paciente}
                  </span>
                  <span className="text-[11px] text-on-surface-muted">
                    #{cita.num_cita} • {cita.nombre_medico}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  {cita.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarioSemanal;
