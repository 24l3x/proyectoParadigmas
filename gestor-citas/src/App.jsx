import React, { useState } from 'react';
import Login from './pages/Login';
import DashboardSecretaria from './pages/DashboardSecretaria';
import PortalPaciente from './pages/PortalPaciente';
import DashboardDoctor from './pages/DashboardDoctor'; // NUEVO: Importamos la vista del doctor

function App() {
  const [usuarioActual, setUsuarioActual] = useState(null);

  const handleLogout = () => {
    setUsuarioActual(null);
  };

  // Función para el botón demo flotante
  const setDemoUser = (rol) => {
    if (rol === 'login') setUsuarioActual(null);
    else if (rol === 'secretaria') setUsuarioActual({ nombre: 'Sarah Jenkins (Demo)', rol: 'secretaria' });
    else if (rol === 'doctor') setUsuarioActual({ nombre: 'Dr. Ruiz (Demo)', rol: 'doctor' }); // Agregado
    else if (rol === 'paciente') setUsuarioActual({ nombre: 'Elena Rostova (Demo)', rol: 'paciente' });
  };

  return (
    <div>
      {!usuarioActual && <Login onLoginSuccess={setUsuarioActual} />}
      
      {usuarioActual?.rol === 'secretaria' && (
        <DashboardSecretaria usuario={usuarioActual} onLogout={handleLogout} />
      )}

      {/* NUEVO: Enrutamiento exclusivo para el Doctor */}
      {usuarioActual?.rol === 'doctor' && (
        <DashboardDoctor usuario={usuarioActual} onLogout={handleLogout} />
      )}
      
      {usuarioActual?.rol === 'paciente' && (
        <PortalPaciente usuario={usuarioActual} onLogout={handleLogout} />
      )}

      {/* Selector flotante para cambiar de vista rápido */}
      <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs">
        <span className="px-2 text-slate-400 font-medium">Vista Demo:</span>
        <button onClick={() => setDemoUser('login')} className={`px-2.5 py-1 rounded-lg transition-colors ${!usuarioActual ? 'bg-primary text-white' : 'hover:bg-slate-800'}`}>Login</button>
        <button onClick={() => setDemoUser('secretaria')} className={`px-2.5 py-1 rounded-lg transition-colors ${usuarioActual?.rol === 'secretaria' ? 'bg-primary text-white' : 'hover:bg-slate-800'}`}>Secretaria</button>
        <button onClick={() => setDemoUser('doctor')} className={`px-2.5 py-1 rounded-lg transition-colors ${usuarioActual?.rol === 'doctor' ? 'bg-primary text-white' : 'hover:bg-slate-800'}`}>Doctor</button>
        <button onClick={() => setDemoUser('paciente')} className={`px-2.5 py-1 rounded-lg transition-colors ${usuarioActual?.rol === 'paciente' ? 'bg-primary text-white' : 'hover:bg-slate-800'}`}>Paciente</button>
      </div>
    </div>
  );
}

export default App;