import React, { useState, useEffect, useCallback } from 'react';

const doctoresGuardia = [
  { id: 1, num_empleado: 'EMP-001', nombre: 'Dr. Alejandro Ruiz', especialidad: 'Medicina General', consultorio: 'Consultorio 101', recomendado: true },
  { id: 2, num_empleado: 'EMP-002', nombre: 'Dra. Valeria Salas', especialidad: 'Medicina General', consultorio: 'Consultorio 104', recomendado: false }
];

const HORARIOS_DIA = [
  '08:00 AM',
  '09:30 AM',
  '11:00 AM',
  '12:30 PM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
  '08:00 PM',
  '09:30 PM'
];

// Convierte "09:30 AM" o "02:00 PM" a "HH:MM:00" (formato 24h)
const convertirHoraA24 = (hora12) => {
  const [tiempo, periodo] = hora12.split(' ');
  let [horas, minutos] = tiempo.split(':').map(Number);
  if (periodo === 'PM' && horas !== 12) horas += 12;
  if (periodo === 'AM' && horas === 12) horas = 0;
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
};

// Convierte "HH:MM:SS" a formato "09:30 AM"
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

// Genera 7 días dinámicos a partir de la fecha actual
const generarDiasDisponibles = (fechaBase) => {
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const lista = [];

  for (let i = 0; i < 7; i++) {
    const fecha = new Date(fechaBase);
    fecha.setHours(0, 0, 0, 0);
    fecha.setDate(fecha.getDate() + i);

    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    const fechaISO = `${yyyy}-${mm}-${dd}`;

    const nombreDia = diasSemana[fecha.getDay()];
    const nombreMes = meses[fecha.getMonth()];
    const prefijo = i === 0 ? 'Hoy • ' : i === 1 ? 'Mañana • ' : '';
    const etiqueta = `${prefijo}${nombreDia} ${fecha.getDate()} ${nombreMes}`;

    lista.push({
      dia: etiqueta,
      fechaISO,
      cupo: true,
      horas: HORARIOS_DIA
    });
  }
  return lista;
};

// Calcula cuántas horas faltan desde `ahora` hasta `fechaISO` ("YYYY-MM-DD") + `hora24` ("HH:MM:SS")
const calcularHorasRestantes = (fechaISO, hora24, ahora) => {
  if (!fechaISO || !hora24) return 0;
  const [yyyy, mm, dd] = String(fechaISO).split('-').map(Number);
  const partesHora = String(hora24).split(':').map(Number);
  const fechaCita = new Date(yyyy, mm - 1, dd, partesHora[0] || 0, partesHora[1] || 0, 0);
  return (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
};

const formatearFechaLegible = (fechaISO) => {
  if (!fechaISO) return '';
  const [yyyy, mm, dd] = String(fechaISO).split('-').map(Number);
  const fecha = new Date(yyyy, mm - 1, dd);
  return fecha.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const PortalPaciente = ({ usuario, rol, onCambiarVista, onLogout, mostrarSoloAgendar }) => {
  const [ahora, setAhora] = useState(() => new Date());
  const [diasDisponibles] = useState(() => generarDiasDisponibles(new Date()));

  const [citasHistorial, setCitasHistorial] = useState([]);
  const [cargandoCitas, setCargandoCitas] = useState(false);

  const [diaElegido, setDiaElegido] = useState(() => diasDisponibles[0]);
  const [horaElegida, setHoraElegida] = useState(() => {
    const primeraDisponible = diasDisponibles[0].horas.find(
      (h) => calcularHorasRestantes(diasDisponibles[0].fechaISO, convertirHoraA24(h), new Date()) >= 2
    );
    return primeraDisponible || diasDisponibles[0].horas[0];
  });
  const [doctorAsignado, setDoctorAsignado] = useState(doctoresGuardia[0]);
  const [mostrarCambioDoctor, setMostrarCambioDoctor] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [idPaciente, setIdPaciente] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Reloj en tiempo real (se actualiza cada segundo)
  useEffect(() => {
    const timer = setInterval(() => {
      setAhora(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Obtener citas reales desde el Backend de manera dinámica
  const obtenerCitasBackend = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargandoCitas(true);
    try {
      const filtro = rol === 'paciente' && usuario?.num_paciente
        ? `?num_paciente=${encodeURIComponent(usuario.num_paciente)}`
        : '';
      const respuesta = await fetch(`http://localhost:8000/api/citas${filtro}`);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setCitasHistorial(datos);
      }
    } catch (error) {
      console.error('Error al obtener citas del backend:', error);
    } finally {
      if (!silencioso) setCargandoCitas(false);
    }
  }, [rol, usuario?.num_paciente]);

  // Cargar al inicio y sincronizar cada 5 segundos con el backend
  useEffect(() => {
    obtenerCitasBackend(false);
    const intervalo = setInterval(() => {
      obtenerCitasBackend(true);
    }, 5000);
    return () => clearInterval(intervalo);
  }, [obtenerCitasBackend]);

  const manejarSeleccionDia = (item) => {
    setDiaElegido(item);
    const primeraHoraValida = item.horas.find(
      (h) => calcularHorasRestantes(item.fechaISO, convertirHoraA24(h), ahora) >= 2
    );
    setHoraElegida(primeraHoraValida || item.horas[0]);
  };

  const manejarBuscarPaciente = async () => {
    if (!idPaciente.trim()) {
      return alert('Por favor ingresa un ID (ej. PAC-001) o nombre de paciente para buscar.');
    }

    setBuscandoPaciente(true);
    try {
      const respuesta = await fetch(`http://localhost:8000/api/pacientes/buscar/${encodeURIComponent(idPaciente.trim())}`);
      if (respuesta.ok) {
        const data = await respuesta.json();
        setPacienteEncontrado(data);
        setIdPaciente(data.num_paciente);
      } else {
        setPacienteEncontrado(null);
        const errorData = await respuesta.json().catch(() => ({}));
        alert(errorData.detail || `No se encontró el paciente '${idPaciente}' en la base de datos.`);
      }
    } catch (error) {
      console.error('Error al buscar paciente:', error);
      alert('Error de conexión al buscar el paciente. Verifique que el Backend esté corriendo.');
    } finally {
      setBuscandoPaciente(false);
    }
  };

  const manejarRegresar = () => {
    onCambiarVista(rol === 'secretaria' ? 'secretaria' : 'paciente');
  };

  const manejarConfirmacion = async (e) => {
    e.preventDefault();
    if (!motivo) return alert('Por favor ingresa un motivo breve para la consulta.');
    if (rol === 'secretaria' && !idPaciente.trim()) {
      return alert('Por favor ingresa el ID del paciente (ej. PAC-001).');
    }

    const fechaReal = diaElegido.fechaISO;
    const horaReal = convertirHoraA24(horaElegida);

    // Validar que falten al menos 2 horas para la cita
    const horasParaCita = calcularHorasRestantes(fechaReal, horaReal, ahora);
    if (horasParaCita < 2) {
      return alert(
        `No puedes agendar en este horario (${horaElegida}).\nDebes agendar con al menos 2 horas de anticipación respecto a la hora actual.`
      );
    }

    const numPacienteBD = rol === 'secretaria'
      ? (pacienteEncontrado?.num_paciente || idPaciente.trim())
      : (usuario?.num_paciente || 'PAC-001');
    const usuarioCreador = usuario?.id || '00000000-0000-0000-0000-000000000000';

    const datosCita = {
      fecha: fechaReal,
      hora: horaReal,
      num_paciente: numPacienteBD,
      num_empleado_medico: doctorAsignado.num_empleado,
      creada_por_usuario: usuarioCreador
    };

    setCargando(true);

    try {
      const respuesta = await fetch('http://localhost:8000/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosCita),
      });

      if (respuesta.ok) {
        const citaCreada = await respuesta.json();
        const etiquetaPaciente = rol === 'secretaria'
          ? (pacienteEncontrado ? `${citaCreada.num_paciente} (${pacienteEncontrado.nombre} ${pacienteEncontrado.apellidos})` : citaCreada.num_paciente)
          : (usuario?.nombre || citaCreada.num_paciente);
        const avisoCancelacion = horasParaCita >= 48
          ? 'Podrás cancelarla porque faltan 48 horas o más.'
          : 'Nota: Como faltan menos de 48 horas para esta cita, no podrá ser cancelada.';

        alert(
          `Cita Guardada Exitosamente.\nFolio BD: #${citaCreada.num_cita}\nPaciente: ${etiquetaPaciente}\nFecha: ${diaElegido.dia} (${fechaReal})\nHora: ${horaElegida}\n\n${avisoCancelacion}`
        );

        setMotivo('');
        await obtenerCitasBackend(true);
        manejarRegresar();
      } else {
        const errorData = await respuesta.json().catch(() => ({}));
        alert(errorData.detail || 'No se pudo crear la cita. Verifique los datos.');
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
      alert('Error de conexión. Asegúrese de que el servidor Backend (Python) esté corriendo en el puerto 8000.');
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = async (cita) => {
    const horasRestantes = calcularHorasRestantes(cita.fecha, cita.hora, ahora);
    if (horasRestantes < 48) {
      return alert(
        `No es posible cancelar esta cita.\nFaltan ${Math.max(0, horasRestantes).toFixed(1)} horas y el reglamento exige al menos 48 horas de anticipación.`
      );
    }

    if (!confirm(`¿Estás seguro de cancelar la cita #${cita.num_cita} del ${cita.fecha} a las ${formatearHora12(cita.hora)}?`)) {
      return;
    }

    try {
      const respuesta = await fetch(`http://localhost:8000/api/citas/${cita.num_cita}/cancelar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mot_cancelacion: 'Cancelada por el paciente desde el portal (>= 48 hrs)' })
      });

      if (respuesta.ok) {
        alert(`La cita #${cita.num_cita} ha sido cancelada exitosamente.`);
        obtenerCitasBackend(true);
      } else {
        const errorData = await respuesta.json().catch(() => ({}));
        alert(errorData.detail || 'No se pudo cancelar la cita.');
      }
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      alert('Error de conexión con el servidor al intentar cancelar la cita.');
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

  const horasParaSeleccion = calcularHorasRestantes(
    diaElegido.fechaISO,
    convertirHoraA24(horaElegida),
    ahora
  );

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 font-body text-on-surface flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-5">
        
        {/* Cabecera Principal */}
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-outline-light shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">local_hospital</span>
            <span className="font-headline font-bold text-base">
              {rol === 'secretaria' ? 'CarePoint • Nueva Cita (Administración)' : 'CarePoint • Portal de Pacientes'}
            </span>
          </div>
          {rol === 'paciente' && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-on-surface-muted">
                Hola, {usuario?.nombre} {usuario?.num_paciente ? `(${usuario.num_paciente})` : ''}
              </span>
              <button onClick={onLogout} className="text-[11px] font-bold text-red-600 hover:underline">Salir</button>
            </div>
          )}
        </div>

        {/* Reloj e Información de Reglas en Tiempo Real */}
        <div className="bg-teal-900 text-white px-5 py-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-teal-300 text-2xl">schedule</span>
            <div>
              <p className="text-xs font-bold capitalize tracking-wide">{fechaHoyTexto}</p>
              <p className="text-[11px] text-teal-200">
                Hora actual del sistema: <strong className="font-mono text-white">{horaHoyTexto}</strong>
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

        {/* VISTA 1: Dashboard del Paciente (Mis Citas) */}
        {!mostrarSoloAgendar && rol === 'paciente' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">Mis Citas</h1>
                <p className="text-xs text-on-surface-muted mt-0.5">
                  Sincronizado dinámicamente con la base de datos • Solo puedes cancelar con 48 hrs o más de anticipación
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => obtenerCitasBackend(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-outline-light text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>{cargandoCitas ? 'Actualizando...' : ' Sincronizar BD'}</span>
                </button>
                <button 
                  onClick={() => onCambiarVista('nueva-cita-paciente')} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Nueva Cita</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 w-full">
              {citasHistorial.length === 0 ? (
                <div className="bg-white border border-outline-light rounded-xl p-8 text-center text-slate-500 text-xs">
                  No se encontraron citas registradas en la base de datos. ¡Agenda una nueva cita!
                </div>
              ) : (
                citasHistorial.map((cita) => {
                  const horasRestantes = calcularHorasRestantes(cita.fecha, cita.hora, ahora);
                  const estaCancelada = (cita.estado || '').toLowerCase() === 'cancelada';
                  const yaPaso = horasRestantes < 0;
                  const puedeCancelar = !estaCancelada && horasRestantes >= 48;

                  return (
                    <div
                      key={cita.num_cita}
                      className={`bg-white border rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        estaCancelada ? 'border-red-200 bg-red-50/20 opacity-75' : 'border-outline-light'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          estaCancelada ? 'bg-red-100 text-red-600' : 'bg-teal-50 text-teal-700'
                        }`}>
                          <span className="material-symbols-outlined">
                            {estaCancelada ? 'event_busy' : 'event_available'}
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              Folio #{cita.num_cita}
                            </span>
                            <h3 className="font-bold text-sm text-slate-900 capitalize">
                              {formatearFechaLegible(cita.fecha)} • {formatearHora12(cita.hora)}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            {cita.nombre_medico || `Médico (${cita.num_empleado_medico})`} • Paciente: <strong>{cita.num_paciente}</strong>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {estaCancelada ? (
                              <span className="text-red-600 font-medium">Cita cancelada {cita.mot_cancelacion ? `(${cita.mot_cancelacion})` : ''}</span>
                            ) : yaPaso ? (
                              <span className="text-slate-400">Esta fecha/hora ya transcurrió ({Math.abs(horasRestantes).toFixed(1)} hrs atrás)</span>
                            ) : (
                              <span>
                                Tiempo restante para la cita: <strong className={horasRestantes >= 48 ? 'text-teal-700' : 'text-amber-700'}>
                                  {horasRestantes.toFixed(1)} horas
                                </strong>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col sm:items-end gap-2">
                        <span className={`self-start sm:self-end px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
                          estaCancelada
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {cita.estado}
                        </span>

                        {!estaCancelada && (
                          puedeCancelar ? (
                            <button
                              onClick={() => handleCancelar(cita)}
                              className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                              type="button"
                            >
                              Cancelar cita (≥ 48hrs)
                            </button>
                          ) : (
                            <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
                              Cancelación no disponible (Menos de 48hrs)
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* VISTA 2: Formulario para Agendar (Pacientes y Secretaria) */}
        {mostrarSoloAgendar && (
          <form onSubmit={manejarConfirmacion} className="bg-white border border-outline-light rounded-xl p-6 shadow-2xs flex flex-col gap-6 w-full">
            
            <div className="border-b border-outline-light pb-4">
              <h2 className="font-headline text-xl font-bold text-on-surface">Agendar Nueva Consulta</h2>
              <p className="text-xs text-on-surface-muted mt-1">
                Puedes agendar citas hasta <strong>2 horas antes</strong> de la consulta. Recuerda que solo podrás cancelar citas con <strong>48 horas o más</strong> de anticipación.
              </p>
            </div>

            {rol === 'secretaria' && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted block mb-2">Buscar Paciente (ID o Nombre)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={idPaciente}
                    onChange={(e) => {
                      setIdPaciente(e.target.value);
                      if (pacienteEncontrado) setPacienteEncontrado(null);
                    }}
                    required
                    placeholder="Ej. PAC-001 o Juan Pérez"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-outline-light rounded-lg text-xs focus:bg-white focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={manejarBuscarPaciente}
                    disabled={buscandoPaciente}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition-colors whitespace-nowrap"
                  >
                    {buscandoPaciente ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
                {pacienteEncontrado && (
                  <p className="mt-2 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5">
                    Paciente encontrado: <strong>{pacienteEncontrado.num_paciente}</strong> — {pacienteEncontrado.nombre} {pacienteEncontrado.apellidos}
                  </p>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 flex flex-col gap-5">
                {/* 1. Selección de Día (7 días próximos) */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-2">
                    1. Elige un día (Próximos 7 días)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {diasDisponibles.map((item) => {
                      const seleccionado = diaElegido.fechaISO === item.fechaISO;
                      const tieneAlgunHorarioValido = item.horas.some(
                        (h) => calcularHorasRestantes(item.fechaISO, convertirHoraA24(h), ahora) >= 2
                      );
                      return (
                        <button
                          key={item.fechaISO}
                          type="button"
                          onClick={() => manejarSeleccionDia(item)}
                          className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                            seleccionado
                              ? 'bg-teal-50 border-primary ring-1 ring-primary text-teal-900'
                              : tieneAlgunHorarioValido
                              ? 'bg-white border-outline-light hover:border-slate-300'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span className="block text-xs font-bold">{item.dia}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">{item.fechaISO}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Selección de Horario (10 horarios por día con validación de 2h y 48h) */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-2">
                    2. Elige un horario (Mínimo 2 hrs de anticipación)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {diaElegido.horas.map((hora) => {
                      const hrs = calcularHorasRestantes(diaElegido.fechaISO, convertirHoraA24(hora), ahora);
                      const disponibleParaAgendar = hrs >= 2;
                      const esCancelable = hrs >= 48;
                      const activo = horaElegida === hora;

                      return (
                        <button
                          key={hora}
                          type="button"
                          disabled={!disponibleParaAgendar}
                          onClick={() => setHoraElegida(hora)}
                          className={`px-3 py-2 rounded-lg text-left border transition-all ${
                            !disponibleParaAgendar
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                              : activo
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-white text-slate-700 border-outline-light hover:border-primary/60'
                          }`}
                        >
                          <span className="block text-xs font-bold">{hora}</span>
                          <span className={`block text-[10px] ${
                            !disponibleParaAgendar
                              ? 'text-slate-400'
                              : activo
                              ? 'text-teal-100'
                              : esCancelable
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}>
                            {!disponibleParaAgendar
                              ? 'No disponible (< 2h)'
                              : esCancelable
                              ? `En ${Math.floor(hrs)}h • Cancelable`
                              : `En ${Math.floor(hrs)}h • Sin cancelación`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-teal-50/50 border border-teal-200/80 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">DR</div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-teal-800">Médico Designado</span>
                        <h3 className="font-bold text-sm mt-0.5">{doctorAsignado.nombre}</h3>
                        <span className="text-[11px] text-slate-600">{doctorAsignado.consultorio} • {doctorAsignado.num_empleado}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setMostrarCambioDoctor(!mostrarCambioDoctor)} className="text-[11px] font-bold text-primary hover:underline">
                      {mostrarCambioDoctor ? 'Ocultar' : 'Cambiar doctor'}
                    </button>
                  </div>
                  {mostrarCambioDoctor && (
                    <div className="pt-3 border-t border-teal-200/60 mt-3 flex flex-col gap-2">
                      {doctoresGuardia.map((doc) => (
                        <button key={doc.id} type="button" onClick={() => { setDoctorAsignado(doc); setMostrarCambioDoctor(false); }} className={`p-2 rounded border text-left text-xs ${doctorAsignado.id === doc.id ? 'bg-white border-primary font-bold' : 'bg-white/60 border-slate-200'}`}>
                          {doc.nombre} ({doc.consultorio})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resumen de anticipación del horario seleccionado */}
                <div className={`p-3.5 rounded-xl border text-xs ${
                  horasParaSeleccion < 2
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : horasParaSeleccion >= 48
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <p className="font-bold">
                    {horasParaSeleccion < 2
                      ? 'Horario no válido (Faltan menos de 2 horas)'
                      : `Faltan ${horasParaSeleccion.toFixed(1)} horas para la cita seleccionada`}
                  </p>
                  <p className="text-[11px] mt-0.5">
                    {horasParaSeleccion < 2
                      ? 'Por favor selecciona un horario al menos 2 horas después de la hora actual.'
                      : horasParaSeleccion >= 48
                      ? 'Cumple con ≥ 48 hrs: esta cita SÍ podrá cancelarse posteriormente.'
                      : 'Cumple con ≥ 2 hrs para agendar, pero al faltar menos de 48 hrs NO podrá cancelarse.'}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-2">3. Motivo de la consulta</label>
                  <input
                    type="text"
                    required
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ej. Dolor de cabeza frecuente..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-outline-light rounded-lg text-xs focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 border-t border-outline-light pt-6 mt-2">
              <button type="button" onClick={manejarRegresar} disabled={cargando} className="w-full sm:w-1/3 py-3 bg-white border border-outline-light text-on-surface-variant rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-xs">
                Cancelar y Regresar
              </button>
              <button
                type="submit"
                disabled={cargando || horasParaSeleccion < 2}
                className={`w-full sm:w-2/3 py-3 text-white rounded-xl text-xs font-bold shadow-xs transition-colors ${
                  cargando || horasParaSeleccion < 2
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-hover'
                }`}
              >
                {cargando ? 'Procesando en BD...' : `Confirmar Cita para ${diaElegido.dia} a las ${horaElegida}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PortalPaciente;
