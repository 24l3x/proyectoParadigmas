import React, { useState } from 'react';
import Login from './pages/Login';
import DashboardSecretaria from './pages/DashboardSecretaria';
import PortalPaciente from './pages/PortalPaciente';
import DashboardDoctor from './pages/DashboardDoctor';

function App() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [vistaActual, setVistaActual] = useState('login');

  const handleLogout = () => {
    setUsuarioActual(null);
    setVistaActual('login');
  };

  const handleLoginSuccess = (usuario) => {
    setUsuarioActual(usuario);
    // Ahora mandamos al paciente directamente a 'paciente' en lugar de 'dashboard-paciente'
    setVistaActual(usuario.rol);
  };

  const setDemoUser = (rol) => {
    if (rol === 'login') handleLogout();
    else if (rol === 'secretaria') { setUsuarioActual({ nombre: 'Sarah Jenkins', rol: 'secretaria' }); setVistaActual('secretaria'); }
    else if (rol === 'doctor') { setUsuarioActual({ nombre: 'Dr. Ruiz', rol: 'doctor' }); setVistaActual('doctor'); }
    else if (rol === 'paciente') { setUsuarioActual({ nombre: 'Elena Rostova', rol: 'paciente' }); setVistaActual('paciente'); } // Cambio directo a 'paciente'
  };

  return (
    <div>
      {(!usuarioActual || vistaActual === 'login') && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
      
      {usuarioActual && vistaActual === 'secretaria' && (
        <DashboardSecretaria usuario={usuarioActual} onCambiarVista={setVistaActual} onLogout={handleLogout} />
      )}

      {usuarioActual && vistaActual === 'doctor' && (
        <DashboardDoctor usuario={usuarioActual} onLogout={handleLogout} />
      )}
      
      {/* Vista de "Mis Citas" del Paciente (El Dashboard principal) */}
      {usuarioActual && vistaActual === 'paciente' && (
        <PortalPaciente 
          usuario={usuarioActual}
          rol="paciente" 
          onCambiarVista={setVistaActual}
          onLogout={handleLogout}
          mostrarSoloAgendar={false} // Nueva prop
        />
      )}

      {/* Vistas Temporales para "Agendar Nueva Cita" (Tanto Paciente como Secretaria) */}
      {usuarioActual && (vistaActual === 'nueva-cita-secretaria' || vistaActual === 'nueva-cita-paciente') && (
        <PortalPaciente 
          usuario={usuarioActual}
          rol={vistaActual === 'nueva-cita-secretaria' ? 'secretaria' : 'paciente'} 
          onCambiarVista={setVistaActual}
          onLogout={handleLogout}
          mostrarSoloAgendar={true} // Nueva prop
        />
      )}

      {/* Selector flotante Demo */}
      <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs">
        <span className="px-2 text-slate-400 font-medium">Vista Demo:</span>
        <button onClick={() => setDemoUser('login')} className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${!usuarioActual ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-300'}`}>Login</button>
        <button onClick={() => setDemoUser('secretaria')} className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${vistaActual === 'secretaria' ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-300'}`}>Secretaria</button>
        <button onClick={() => setDemoUser('doctor')} className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${vistaActual === 'doctor' ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-300'}`}>Doctor</button>
        <button onClick={() => setDemoUser('paciente')} className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${vistaActual === 'paciente' ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-300'}`}>Paciente</button>
      </div>
    </div>
  );
}

export default App;