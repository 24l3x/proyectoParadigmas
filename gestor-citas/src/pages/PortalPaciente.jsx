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

const PortalPaciente = ({ usuario, rol, onCambiarVista, onLogout }) => {
  // Si es secretaria entra directo a agendar, si es paciente ve sus citas primero
  const [tabActiva, setTabActiva] = useState(rol === 'secretaria' ? 'agendar' : 'mis-citas'); 
  const [citasHistorial, setCitasHistorial] = useState(citasIniciales);

  const [diaElegido, setDiaElegido] = useState(diasDisponibles[0]);
  const [horaElegida, setHoraElegida] = useState(diasDisponibles[0].horas[0]);
  const [doctorAsignado, setDoctorAsignado] = useState(doctoresGuardia[0]);
  const [mostrarCambioDoctor, setMostrarCambioDoctor] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [idPaciente, setIdPaciente] = useState(''); // Lógica de tu amigo

  const manejarRegresar = () => {
    onCambiarVista(rol === 'secretaria' ? 'secretaria' : 'dashboard-paciente');
  };

  const manejarConfirmacion = (e) => {
    e.preventDefault();
    if (!motivo) return alert("Por favor ingresa un motivo breve para la consulta.");

    alert(`Cita Guardada Exitosamente.\nPaciente: ${rol === 'secretaria' ? idPaciente : usuario?.nombre || 'Elena Rostova'}\nDía: ${diaElegido.dia}\nHora: ${horaElegida}`);
    
    // Si es paciente, agregamos a su historial visual; si es secretaria, la regresamos directo
    if (rol === 'paciente') {
      const nuevaCita = {
        id: Math.floor(Math.random() * 10000) + 1000,
        fechaCompleta: `${diaElegido.dia} a las ${horaElegida}`,
        doctor: doctorAsignado.nombre,
        especialidad: doctorAsignado.especialidad,
        cancelable: true
      };
      setCitasHistorial([nuevaCita, ...citasHistorial]);
      setMotivo('');
      setTabActiva('mis-citas');
    } else {
      manejarRegresar();
    }
  };

  const handleCancelar = (id) => {
    if(confirm("¿Estás seguro de cancelar esta cita?")) setCitasHistorial(citasHistorial.filter(cita => cita.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 font-body text-on-surface flex flex-col items-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        
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

        {/* Solo mostrar pestañas si es el paciente navegando */}
        {rol === 'paciente' && (
          <div className="flex gap-4 border-b border-outline-light/70 px-2 w-full">
            <button onClick={() => setTabActiva('mis-citas')} className={`pb-3 text-sm font-semibold transition-colors ${tabActiva === 'mis-citas' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-800'}`}>Mis Citas</button>
            <button onClick={() => setTabActiva('agendar')} className={`pb-3 text-sm font-semibold transition-colors ${tabActiva === 'agendar' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-800'}`}>Agendar Nueva Cita</button>
          </div>
        )}

        {tabActiva === 'mis-citas' && rol === 'paciente' && (
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
        )}

        {tabActiva === 'agendar' && (
          <form onSubmit={manejarConfirmacion} className="bg-white border border-outline-light rounded-xl p-6 shadow-2xs flex flex-col gap-6 w-full">
            
            {/* Lógica de tu amigo: Buscador de Paciente para la Secretaria */}
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

            {/* Lógica de tu amigo: Botones duales */}
            <div className="flex flex-col sm:flex-row gap-3 border-t border-outline-light pt-6 mt-2">
              <button type="button" onClick={manejarRegresar} className="w-full sm:w-1/3 py-3 bg-white border border-outline-light text-on-surface-variant rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-xs">
                Cancelar y Regresar
              </button>
              <button type="submit" className="w-full sm:w-2/3 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs">
                Confirmar Cita para el {diaElegido.dia}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PortalPaciente;