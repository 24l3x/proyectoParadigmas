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

const calcularHorasRestantes = (fechaISO, hora24, ahora) => {
  if (!fechaISO || !hora24) return 0;
  const [yyyy, mm, dd] = String(fechaISO).split('-').map(Number);
  const partesHora = String(hora24).split(':').map(Number);
  const fechaCita = new Date(yyyy, mm - 1, dd, partesHora[0] || 0, partesHora[1] || 0, 0);
  return (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
};

const obtenerIniciales = (nombre) => {
  if (!nombre) return 'PA';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
};

const CitasDelDia = ({ onCambiarVista }) => {
  const [ahora, setAhora] = useState(() => new Date());
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setAhora(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cargarCitasBackend = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const res = await fetch('http://localhost:8000/api/citas');
      if (res.ok) {
        const data = await res.json();
        setCitas(data);
        setCitaSeleccionada((prev) => {
          if (!data.length) return null;
          if (prev) {
            const actualizada = data.find((c) => c.num_cita === prev.num_cita);
            if (actualizada) return actualizada;
          }
          return data[0];
        });
      }
    } catch (error) {
      console.error('Error al cargar citas del backend:', error);
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCitasBackend(false);
    const intervalo = setInterval(() => {
      cargarCitasBackend(true);
    }, 5000);
    return () => clearInterval(intervalo);
  }, [cargarCitasBackend]);

  const manejarMarcarAtendido = async (cita) => {
    if (!cita) return;
    try {
      const res = await fetch(`http://localhost:8000/api/citas/${cita.num_cita}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Atendido' })
      });
      if (res.ok) {
        cargarCitasBackend(true);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || 'No se pudo actualizar el estado.');
      }
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      alert('Error de conexión con el backend.');
    }
  };

  const manejarCancelarCita = async (cita) => {
    if (!cita) return;
    const horasRestantes = calcularHorasRestantes(cita.fecha, cita.hora, ahora);
    if (horasRestantes < 48) {
      return alert(
        `No se puede cancelar la cita #${cita.num_cita}.\nFaltan ${Math.max(0, horasRestantes).toFixed(1)} horas y solo se permite cancelar con 48 horas o más de anticipación.`
      );
    }

    if (!confirm(`¿Confirmas la cancelación de la cita #${cita.num_cita} del paciente ${cita.num_paciente}?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/citas/${cita.num_cita}/cancelar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mot_cancelacion: 'Cancelada por secretaría (>= 48 hrs)' })
      });
      if (res.ok) {
        alert(`Cita #${cita.num_cita} cancelada correctamente.`);
        cargarCitasBackend(true);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || 'No se pudo cancelar la cita.');
      }
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      alert('Error de conexión con el backend.');
    }
  };

  const fechaHoyTexto = ahora.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const horaHoyTexto = ahora.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const totalCitas = citas.length;
  const pendientesCount = citas.filter((c) => (c.estado || '').toLowerCase() === 'pendiente' || (c.estado || '').toLowerCase() === 'en espera').length;
  const atendidasCount = citas.filter((c) => (c.estado || '').toLowerCase() === 'atendido').length;

  const horasCitaSel = citaSeleccionada
    ? calcularHorasRestantes(citaSeleccionada.fecha, citaSeleccionada.hora, ahora)
    : 0;
  const selCancelable = citaSeleccionada &&
    (citaSeleccionada.estado || '').toLowerCase() !== 'cancelada' &&
    (citaSeleccionada.estado || '').toLowerCase() !== 'atendido' &&
    horasCitaSel >= 48;

  return (
    <div className="flex flex-col gap-6">
      {/* Banner de fecha y hora actual */}
      <div className="bg-teal-900 text-white px-5 py-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-teal-300 text-2xl">schedule</span>
          <div>
            <p className="text-xs font-bold capitalize">{fechaHoyTexto}</p>
            <p className="text-[11px] text-teal-200">
              Hora actual: <strong className="font-mono text-white">{horaHoyTexto}</strong>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-teal-800/90 border border-teal-600 text-teal-100">
            Agendar: <strong>mín. 2 hrs antes</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-800/90 border border-teal-600 text-teal-100">
            Cancelar: <strong>mín. 48 hrs antes</strong>
          </span>
        </div>
      </div>

      {/* Título y Botones */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">Citas Registradas (Base de Datos)</h1>
          <p className="text-xs text-on-surface-muted mt-0.5">Sincronizado en tiempo real con el Backend</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => cargarCitasBackend(false)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-outline-light text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>{cargando ? 'Sincronizando...' : 'Actualizar BD'}</span>
          </button>
          <button 
            onClick={() => onCambiarVista('nueva-cita-secretaria')} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors" 
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Resumen Simple (3 tarjetas limpias) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-outline-light rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-medium text-on-surface-muted">Total Citas en BD</span>
            <p className="font-headline text-2xl font-bold text-on-surface mt-1">{totalCitas}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-on-surface-muted">
            <span className="material-symbols-outlined">event</span>
          </div>
        </div>

        <div className="bg-white border border-outline-light rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-medium text-on-surface-muted">Pendientes / En Espera</span>
            <p className="font-headline text-2xl font-bold text-amber-600 mt-1">{pendientesCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined">schedule</span>
          </div>
        </div>

        <div className="bg-white border border-outline-light rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-medium text-on-surface-muted">Atendidas</span>
            <p className="font-headline text-2xl font-bold text-teal-700 mt-1">{atendidasCount}</p>
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
                <th className="py-3 px-4">Folio / Paciente</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Médico</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Cancelación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-light text-on-surface">
              {citas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 px-4 text-center text-xs text-slate-500">
                    No hay citas registradas actualmente en la base de datos.
                  </td>
                </tr>
              ) : (
                citas.map((cita) => {
                  const seleccionada = citaSeleccionada?.num_cita === cita.num_cita;
                  const hrs = calcularHorasRestantes(cita.fecha, cita.hora, ahora);
                  const cancelada = (cita.estado || '').toLowerCase() === 'cancelada';
                  const atendido = (cita.estado || '').toLowerCase() === 'atendido';
                  const puedeCancelar = !cancelada && !atendido && hrs >= 48;

                  return (
                    <tr 
                      key={cita.num_cita}
                      onClick={() => setCitaSeleccionada(cita)}
                      className={`transition-colors cursor-pointer ${
                        seleccionada ? 'bg-teal-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-semibold text-xs">
                            {obtenerIniciales(cita.nombre_paciente || cita.num_paciente)}
                          </div>
                          <div>
                            <span className="font-semibold text-[13px] block">
                              {cita.nombre_paciente || cita.num_paciente}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              #{cita.num_cita} • {cita.num_paciente}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="block font-medium text-xs">{cita.fecha}</span>
                        <span className="block text-[11px] text-on-surface-muted">{formatearHora12(cita.hora)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="block text-xs font-medium">{cita.nombre_medico}</span>
                        <span className="block text-[11px] text-on-surface-muted">{cita.num_empleado_medico}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          atendido
                            ? 'bg-teal-50 text-teal-700'
                            : cancelada
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {cancelada ? (
                          <span className="text-[11px] text-red-500 font-medium">Cancelada</span>
                        ) : puedeCancelar ? (
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            Disponible ({hrs.toFixed(0)}h)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            No disp. (&lt;48h)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Panel Lateral de Detalle */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-light rounded-xl p-5 flex flex-col gap-4 shadow-2xs">
          {citaSeleccionada ? (
            <>
              <div className="flex items-center justify-between border-b border-outline-light pb-3">
                <span className="font-headline font-semibold text-xs text-on-surface uppercase tracking-wider">
                  Información de la Cita
                </span>
                <span className="text-xs font-mono text-on-surface-muted">Folio #{citaSeleccionada.num_cita}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-sm">
                  {obtenerIniciales(citaSeleccionada.nombre_paciente || citaSeleccionada.num_paciente)}
                </div>
                <div>
                  <h2 className="font-headline font-bold text-base text-on-surface">
                    {citaSeleccionada.nombre_paciente || citaSeleccionada.num_paciente}
                  </h2>
                  <span className="text-xs text-on-surface-muted font-mono">
                    ID Paciente: {citaSeleccionada.num_paciente}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-outline-light/60 text-xs">
                <div>
                  <span className="text-[11px] text-on-surface-muted block">Fecha y Horario</span>
                  <span className="font-semibold">{citaSeleccionada.fecha} • {formatearHora12(citaSeleccionada.hora)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-on-surface-muted block">Médico Asignado</span>
                  <span className="font-semibold">{citaSeleccionada.nombre_medico}</span>
                </div>
              </div>

              <div className={`p-3 rounded-lg border text-xs ${
                horasCitaSel >= 48
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <span className="font-bold block">
                  {horasCitaSel >= 0
                    ? `Tiempo para la cita: ${horasCitaSel.toFixed(1)} horas`
                    : `Cita pasada hace ${Math.abs(horasCitaSel).toFixed(1)} horas`}
                </span>
                <span className="text-[11px]">
                  {horasCitaSel >= 48
                    ? 'Cumple con las 48 horas o más: puede cancelarse.'
                    : 'Faltan menos de 48 horas: cancelación deshabilitada.'}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => manejarMarcarAtendido(citaSeleccionada)}
                  disabled={(citaSeleccionada.estado || '').toLowerCase() === 'cancelada' || (citaSeleccionada.estado || '').toLowerCase() === 'atendido'}
                  className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                  type="button"
                >
                  Marcar Atendido
                </button>
                <button
                  onClick={() => manejarCancelarCita(citaSeleccionada)}
                  disabled={!selCancelable}
                  className={`px-3 py-2 border rounded-lg text-xs font-semibold transition-colors ${
                    selCancelable
                      ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                      : 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed'
                  }`}
                  type="button"
                >
                  {selCancelable ? 'Cancelar Cita' : 'No Cancelable (<48h)'}
                </button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Selecciona una cita de la tabla para ver su información.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitasDelDia;
