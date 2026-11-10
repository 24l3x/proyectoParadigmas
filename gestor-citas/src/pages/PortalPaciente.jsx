import React, { useState } from 'react';

const doctoresGuardia = [
  { id: 1, nombre: 'Dr. Alejandro Ruiz', especialidad: 'Medicina General', consultorio: '101', recomendado: true },
  { id: 2, nombre: 'Dra. Valeria Salas', especialidad: 'Medicina General', consultorio: '104', recomendado: false }
];

const diasDisponibles = [
  { dia: 'Lunes 12', estado: 'Disponible', cupo: true, horas: ['09:00 AM', '10:30 AM'] },
  { dia: 'Martes 13', estado: 'Pocos lugares', cupo: true, horas: ['12:00 PM', '04:00 PM'] }
];

const citasIniciales = [
  { id: 8492, fechaCompleta: 'Lunes 12 a las 09:30 AM', doctor: 'Dr. Alejandro Ruiz', especialidad: 'Medicina General', cancelable: false }
];

const PortalPaciente = ({ usuario, rol, onCambiarVista, onLogout, mostrarSoloAgendar }) => {
  const [citasHistorial, setCitasHistorial] = useState(citasIniciales);

  const [diaElegido, setDiaElegido] = useState(diasDisponibles[0]);
  const [horaElegida, setHoraElegida] = useState(diasDisponibles[0].horas[0]);
  const [doctorAsignado, setDoctorAsignado] = useState(doctoresGuardia[0]);
  const [mostrarCambioDoctor, setMostrarCambioDoctor] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [idPaciente, setIdPaciente] = useState('');
  
  // Estado extra para deshabilitar el botón mientras carga la petición
  const [cargando, setCargando] = useState(false);

  const manejarRegresar = () => {
    // Si es secretaria vuelve a su dashboard, si es paciente vuelve a 'paciente' (Mis Citas)
    onCambiarVista(rol === 'secretaria' ? 'secretaria' : 'paciente');
  };

  const manejarConfirmacion = async (e) => {
    e.preventDefault();
    if (!motivo) return alert("Por favor ingresa un motivo breve para la consulta.");

    // 1. Preparar la estructura de datos que espera el backend de Python (FastAPI/Pydantic)
    // El backend espera fechas 'YYYY-MM-DD' y horas 'HH:MM:SS'. Aquí hacemos un formato rápido para el MVP.
    let fechaReal = diaElegido.dia.includes("13") ? "2026-10-13" : "2026-10-12"; 
    
    // Transformar "09:30 AM" a "09:30:00" y ajustar a 24 horas si es PM
    let horaReal = horaElegida.split(' ')[0] + ":00";
    if (horaElegida.includes("PM") && !horaElegida.startsWith("12")) {
       let partes = horaElegida.split(' ')[0].split(':');
       horaReal = `${parseInt(partes[0]) + 12}:${partes[1]}:00`;
    }

    // Determinar qué num_paciente y qué creador_por_usuario enviar a la base de datos
    const numPacienteBD = rol === 'secretaria' ? idPaciente : (usuario?.num_paciente || "PAC-DEMO-001");
    // El id (UUID) se guardó durante el login. Si es undefined usamos un valor mock para evitar errores.
    const usuarioCreador = usuario?.id || "00000000-0000-0000-0000-000000000000";

    const datosCita = {
      fecha: fechaReal,
      hora: horaReal,
      num_paciente: numPacienteBD,
      num_empleado_medico: "EMP-00" + doctorAsignado.id, // Simulamos el num_empleado del médico seleccionado
      creada_por_usuario: usuarioCreador
    };

    setCargando(true);

    // 2. Enviar la petición HTTP al Backend en Python (FastAPI)
    try {
      const respuesta = await fetch('http://localhost:8000/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosCita),
      });

      if (respuesta.ok) {
        const citaCreada = await respuesta.json(); // El backend nos devuelve la Cita (incluyendo el num_cita auto-generado)
        alert(`Cita Guardada Exitosamente.\nFolio BD: ${citaCreada.num_cita}\nPaciente: ${rol === 'secretaria' ? idPaciente : usuario?.nombre || 'Elena Rostova'}\nDía: ${diaElegido.dia}\nHora: ${horaElegida}`);
        
        // Si es paciente, actualizamos su historial de la pantalla
        if (rol === 'paciente') {
          const nuevaCitaUi = {
            id: citaCreada.num_cita, // Usamos el ID real de la base de datos
            fechaCompleta: `${diaElegido.dia} a las ${horaElegida}`,
            doctor: doctorAsignado.nombre,
            especialidad: doctorAsignado.especialidad,
            cancelable: true
          };
          setCitasHistorial([nuevaCitaUi, ...citasHistorial]);
          setMotivo('');
        }
        
        manejarRegresar(); // Volvemos a la vista anterior
      } else {
        // La API retornó un error (Ej. Paciente no existe)
        const errorData = await respuesta.json();
        alert(`No se pudo crear la cita: ${errorData.detail || 'Verifique los datos'}`);
      }
    } catch (error) {
      console.error("Error al conectar con la API:", error);
      alert("Error de conexión. Asegúrese de que el servidor Backend (Python) esté corriendo en el puerto 8000.");
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = (id) => {
    if(confirm("¿Estás seguro de cancelar esta cita?")) setCitasHistorial(citasHistorial.filter(cita => cita.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 font-body text-on-surface flex flex-col items-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        
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
              <span className="text-xs font-medium text-on-surface-muted">Hola, {usuario?.nombre}</span>
              <button onClick={onLogout} className="text-[11px] font-bold text-red-600 hover:underline">Salir</button>
            </div>
          )}
        </div>

        {/* VISTA 1: Dashboard del Paciente (Mis Citas) */}
        {!mostrarSoloAgendar && rol === 'paciente' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">Mis Citas</h1>
                <p className="text-xs text-on-surface-muted mt-0.5">Historial y próximas consultas programadas</p>
              </div>
              <button 
                onClick={() => onCambiarVista('nueva-cita-paciente')} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors" 
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Nueva Cita</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {citasHistorial.map((cita) => (
                <div key={cita.id} className="bg-white border border-outline-light rounded-xl p-5 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-700"><span className="material-symbols-outlined">event_available</span></div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{cita.fechaCompleta}</h3>
                      <p className="text-xs text-slate-500">{cita.doctor} • {cita.especialidad}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-full border border-emerald-200">Confirmada</span>
                    {cita.cancelable ? (
                      <button onClick={() => handleCancelar(cita.id)} className="text-xs font-semibold text-red-500 hover:text-red-700">Cancelar cita</button>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">Cancelación no disponible (Menos de 48hrs)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 2: Formulario Temporal para Agendar (Pacientes y Secretaria) */}
        {mostrarSoloAgendar && (
          <form onSubmit={manejarConfirmacion} className="bg-white border border-outline-light rounded-xl p-6 shadow-2xs flex flex-col gap-6 w-full">
            
            <div className="border-b border-outline-light pb-4 mb-2">
              <h2 className="font-headline text-xl font-bold text-on-surface">Agendar Nueva Consulta</h2>
              <p className="text-xs text-on-surface-muted mt-1">Completa los datos para programar la cita en el sistema.</p>
            </div>

            {rol === 'secretaria' && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted block mb-2">Buscar Paciente (ID o Nombre)</label>
                <input
                  type="text" value={idPaciente} onChange={(e) => setIdPaciente(e.target.value)} required
                  placeholder="Ej. PAC-0912 o Juan Pérez"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-outline-light rounded-lg text-xs focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-2">1. Elige un día</label>
                  <div className="flex gap-2">
                    {diasDisponibles.map((item) => (
                      <button key={item.dia} type="button" disabled={!item.cupo} onClick={() => { setDiaElegido(item); setHoraElegida(item.horas[0]); }} className={`px-4 py-2.5 rounded-lg border text-xs font-bold ${!item.cupo ? 'bg-slate-100 opacity-50 text-slate-400' : diaElegido.dia === item.dia ? 'bg-teal-50 border-primary ring-1 ring-primary text-teal-900' : 'bg-white'}`}>
                        {item.dia}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-2">2. Elige un horario</label>
                  <div className="flex gap-2 flex-wrap">
                    {diaElegido.horas.map((hora) => (
                      <button key={hora} type="button" onClick={() => setHoraElegida(hora)} className={`px-4 py-2 rounded-lg text-xs font-semibold border ${horaElegida === hora ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700'}`}>
                        {hora}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-teal-50/50 border border-teal-200/80 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">DR</div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-teal-800">Médico Designado</span>
                        <h3 className="font-bold text-sm mt-0.5">{doctorAsignado.nombre}</h3>
                        <span className="text-[11px] text-slate-600">{doctorAsignado.consultorio}</span>
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
                          {doc.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-2">3. Motivo de la consulta</label>
                  <input type="text" required value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. Dolor de cabeza frecuente..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-outline-light rounded-lg text-xs focus:bg-white focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 border-t border-outline-light pt-6 mt-2">
              <button type="button" onClick={manejarRegresar} disabled={cargando} className="w-full sm:w-1/3 py-3 bg-white border border-outline-light text-on-surface-variant rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-xs">
                Cancelar y Regresar
              </button>
              <button type="submit" disabled={cargando} className={`w-full sm:w-2/3 py-3 text-white rounded-xl text-xs font-bold shadow-xs transition-colors ${cargando ? 'bg-teal-900 cursor-wait' : 'bg-primary hover:bg-primary-hover'}`}>
                {cargando ? 'Procesando en BD...' : `Confirmar Cita para el ${diaElegido.dia}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PortalPaciente;