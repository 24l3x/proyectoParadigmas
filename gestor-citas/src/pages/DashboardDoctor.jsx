import React, { useState } from 'react';
import SidebarHospital from '../components/SidebarHospital';
import HeaderHospital from '../components/HeaderHospital';
import CalendarioSemanal from '../components/CalendarioSemanal';

const pacientesIniciales = [
  { id: 1, paciente: 'Elena Rostova', hora: '09:30 AM', motivo: 'Dolor de pecho y seguimiento preventivo.', estado: 'Esperando en sala' },
  { id: 2, paciente: 'Carlos Mendoza', hora: '10:15 AM', motivo: 'Lectura de estudios de laboratorio (Glucosa alta).', estado: 'Próximo' },
  { id: 3, paciente: 'Sofía Vargas', hora: '11:00 AM', motivo: 'Revisión general.', estado: 'Próximo' }
];

const DashboardDoctor = ({ usuario, onLogout }) => {
  const [pestañaActiva, setPestañaActiva] = useState('citas'); 
  const [pacientes, setPacientes] = useState(pacientesIniciales);
  const [pacienteActual, setPacienteActual] = useState(pacientesIniciales[0]);
  const [diagnostico, setDiagnostico] = useState('');
  const [receta, setReceta] = useState('');

  const handleEmitirReceta = () => {
    if (!pacienteActual) return;
    
    alert(`Receta emitida para ${pacienteActual.paciente}. Consulta finalizada.`);
    
    // Simulación de BD: Quitamos al paciente de la lista de espera
    const nuevaLista = pacientes.filter(p => p.id !== pacienteActual.id);
    setPacientes(nuevaLista);
    setPacienteActual(nuevaLista.length > 0 ? nuevaLista[0] : null);
    setDiagnostico('');
    setReceta('');
  };

  return (
    <div className="bg-slate-50/50 font-body text-on-surface antialiased text-sm min-h-screen flex">
      <SidebarHospital pestañaActiva={pestañaActiva} setPestañaActiva={setPestañaActiva} onLogout={onLogout} />
      
      <div className="pl-56 w-full flex flex-col">
        <HeaderHospital usuario={usuario} />

        <main className="w-full pt-24 px-8 pb-8 max-w-6xl mx-auto flex-1">
          {pestañaActiva === 'calendario' ? (
            <CalendarioSemanal />
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-headline text-2xl font-bold tracking-tight">Consultorio Médico</h1>
                <p className="text-xs text-slate-500 mt-1">Dr. {usuario?.nombre} • Gestiona tus consultas y emite recetas médicas.</p>
              </div>

              <div className="grid grid-cols-12 gap-6 items-start">
                
                {/* Lista de pacientes con diseño de Tarjetas Separadas */}
                <div className="col-span-12 lg:col-span-4 bg-white border border-outline-light rounded-xl overflow-hidden shadow-2xs flex flex-col">
                  <div className="bg-slate-50 border-b border-outline-light p-4">
                    <span className="font-bold text-xs uppercase text-slate-500">Pacientes en Espera</span>
                  </div>
                  
                  {/* Contenedor corregido: En lugar de divide-y, usamos gap para separar las tarjetas */}
                  <div className="flex flex-col gap-2 p-3 bg-slate-50/30">
                    {pacientes.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs font-medium">
                        No hay más pacientes por hoy.
                      </div>
                    ) : (
                      pacientes.map((paciente) => {
                        const activo = pacienteActual?.id === paciente.id;
                        return (
                          <div 
                            key={paciente.id} 
                            onClick={() => setPacienteActual(paciente)}
                            className={`p-3.5 rounded-lg cursor-pointer transition-all border ${
                              activo 
                                ? 'bg-teal-50/60 border-primary shadow-sm ring-1 ring-primary/20' 
                                : 'bg-white border-outline-light hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <h3 className={`font-bold text-sm ${activo ? 'text-teal-900' : 'text-slate-800'}`}>
                                {paciente.paciente}
                              </h3>
                              <span className="text-xs font-bold text-primary">{paciente.hora}</span>
                            </div>
                            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                              {paciente.estado}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Área de Trabajo Médico */}
                {pacienteActual ? (
                  <div className="col-span-12 lg:col-span-8 bg-white border border-outline-light rounded-xl p-6 shadow-2xs">
                    <div className="flex justify-between items-center border-b border-outline-light pb-4 mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{pacienteActual.paciente}</h2>
                        <p className="text-xs text-slate-500 mt-1">Motivo: {pacienteActual.motivo}</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 font-mono text-xs rounded border">
                        Expediente #{pacienteActual.id}
                      </span>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-[16px]">monitor_heart</span> Diagnóstico y Notas Clínicas
                        </label>
                        <textarea 
                          rows="3" 
                          placeholder="Escribe la valoración del paciente, síntomas y diagnóstico..."
                          value={diagnostico}
                          onChange={(e) => setDiagnostico(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-outline-light rounded-lg text-sm focus:bg-white focus:border-primary focus:outline-none resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-[16px]">prescriptions</span> Receta Médica / Tratamiento
                        </label>
                        <textarea 
                          rows="3" 
                          placeholder="Ej. Paracetamol 500mg cada 8 horas por 5 días..."
                          value={receta}
                          onChange={(e) => setReceta(e.target.value)}
                          className="w-full p-3 bg-teal-50/30 border border-teal-200 rounded-lg text-sm focus:bg-white focus:border-primary focus:outline-none resize-none"
                        ></textarea>
                      </div>

                      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-outline-light mt-2">
                        <button className="px-4 py-2 border border-outline-light text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                          Guardar Borrador
                        </button>
                        <button 
                          className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover shadow-xs flex items-center gap-1.5 transition-colors"
                          onClick={handleEmitirReceta}
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Emitir Receta y Finalizar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="col-span-12 lg:col-span-8 bg-slate-50 border border-outline-light rounded-xl p-12 shadow-2xs flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-3">task_alt</span>
                    <h2 className="text-lg font-bold text-slate-600">Jornada finalizada</h2>
                    <p className="text-xs mt-1">No tienes más pacientes en espera por el momento.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardDoctor;