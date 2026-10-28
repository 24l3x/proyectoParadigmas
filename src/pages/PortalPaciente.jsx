import React, { useState } from 'react';

const doctoresGuardia = [
  { id: 1, nombre: 'Dr. Alejandro Ruiz', especialidad: 'Medicina General', consultorio: 'Consultorio 101', recomendado: true },
  { id: 2, nombre: 'Dra. Valeria Salas', especialidad: 'Medicina General', consultorio: 'Consultorio 104', recomendado: false },
  { id: 3, nombre: 'Dr. Fernando Castro', especialidad: 'Medicina General', consultorio: 'Consultorio 108', recomendado: false },
];

const diasDisponibles = [
  { dia: 'Lunes 12', estado: 'Disponible', cupo: true },
  { dia: 'Martes 13', estado: 'Pocos lugares', cupo: true },
  { dia: 'Miércoles 14', estado: 'Lleno', cupo: false },
  { dia: 'Jueves 15', estado: 'Disponible', cupo: true },
];

const horarios = ['09:00 AM', '10:30 AM', '12:00 PM', '04:00 PM'];

const PortalPaciente = () => {
  const [diaElegido, setDiaElegido] = useState('Lunes 12');
  const [horaElegida, setHoraElegida] = useState('10:30 AM');
  const [doctorAsignado, setDoctorAsignado] = useState(doctoresGuardia[0]);
  const [mostrarCambioDoctor, setMostrarCambioDoctor] = useState(false);
  const [motivo, setMotivo] = useState('');

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 font-body text-on-surface">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* Cabecera del Paciente */}
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-outline-light">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">local_hospital</span>
            <span className="font-headline font-bold text-base">CarePoint • Portal de Pacientes</span>
          </div>
          <span className="text-xs font-medium text-on-surface-muted">Hola, Elena Rostova</span>
        </div>

        {/* Tarjeta Principal de Agendado */}
        <div className="bg-white border border-outline-light rounded-xl p-6 shadow-2xs flex flex-col gap-6">
          <div>
            <h1 className="font-headline text-xl font-bold text-on-surface">Agendar Nueva Cita</h1>
            <p className="text-xs text-on-surface-muted mt-1">
              Selecciona el día y horario que prefieras. Nosotros te asignaremos al médico con menor tiempo de espera.
            </p>
          </div>

          {/* Paso 1: Elegir Día */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted block mb-2.5">
              1. Elige un día disponible
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {diasDisponibles.map((item) => (
                <button
                  key={item.dia}
                  disabled={!item.cupo}
                  onClick={() => setDiaElegido(item.dia)}
                  type="button"
                  className={`p-3 rounded-xl border text-left transition-all ${
                    !item.cupo
                      ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                      : diaElegido === item.dia
                      ? 'bg-teal-50/70 border-primary ring-1 ring-primary'
                      : 'bg-white border-outline-light hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs block text-slate-800">{item.dia}</span>
                  <span className={`text-[11px] font-medium ${!item.cupo ? 'text-red-600' : 'text-teal-700'}`}>
                    {item.estado}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Paso 2: Elegir Hora */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted block mb-2.5">
              2. Elige un horario
            </label>
            <div className="flex flex-wrap gap-2">
              {horarios.map((hora) => (
                <button
                  key={hora}
                  onClick={() => setHoraElegida(hora)}
                  type="button"
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    horaElegida === hora
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-700 border-outline-light hover:bg-slate-50'
                  }`}
                >
                  {hora}
                </button>
              ))}
            </div>
          </div>

          {/* Paso 3: Doctor Designado Automáticamente */}
          <div className="bg-teal-50/50 border border-teal-200/80 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                  DR
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-800">
                      Médico Designado
                    </span>
                    {doctorAsignado.recomendado && (
                      <span className="text-[10px] bg-teal-200/70 text-teal-900 px-2 py-0.5 rounded-full font-semibold">
                        Asignación rápida
                      </span>
                    )}
                  </div>
                  <h3 className="font-headline font-bold text-sm text-slate-900 mt-0.5">
                    {doctorAsignado.nombre}
                  </h3>
                  <span className="text-xs text-slate-600">
                    {doctorAsignado.especialidad} • {doctorAsignado.consultorio}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMostrarCambioDoctor(!mostrarCambioDoctor)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {mostrarCambioDoctor ? 'Ocultar opciones' : '¿Cambiar de doctor?'}
              </button>
            </div>

            {/* Desplegable opcional si el paciente no quiere al doctor asignado */}
            {mostrarCambioDoctor && (
              <div className="pt-3 border-t border-teal-200/60 flex flex-col gap-2">
                <span className="text-xs text-slate-600 font-medium">
                  Selecciona otro médico disponible en este horario:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {doctoresGuardia.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setDoctorAsignado(doc);
                        setMostrarCambioDoctor(false);
                      }}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        doctorAsignado.id === doc.id
                          ? 'bg-white border-primary font-semibold ring-1 ring-primary'
                          : 'bg-white/70 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className="block text-slate-800">{doc.nombre}</span>
                      <span className="text-[10px] text-slate-500">{doc.consultorio}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Motivo corto */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted block mb-2">
              3. Motivo breve de la consulta
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Dolor de cabeza frecuente, revisión general..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-outline-light rounded-lg text-xs focus:bg-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Botón de Confirmación */}
          <button
            type="button"
            className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs"
          >
            Confirmar Cita para el {diaElegido} a las {horaElegida}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortalPaciente;