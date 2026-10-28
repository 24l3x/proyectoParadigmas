import React, { useState } from 'react';
import Login from './pages/Login';
import DashboardSecretaria from './pages/DashboardSecretaria';
import PortalPaciente from './pages/PortalPaciente';

function App() {
  // Puedes cambiar el valor inicial a 'login', 'secretaria' o 'paciente'
  const [vistaActual, setVistaActual] = useState('secretaria');

  return (
    <div>
      {vistaActual === 'login' && <Login onLoginSuccess={(rol) => setVistaActual(rol)} />}
      {vistaActual === 'secretaria' && <DashboardSecretaria onCambiarVista={setVistaActual} />}
      {vistaActual === 'paciente' && <PortalPaciente />}

      {/* Selector flotante para cambiar de vista rápido en tu proyecto escolar */}
      <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs">
        <span className="px-2 text-slate-400 font-medium">Vista Demo:</span>
        <button
          onClick={() => setVistaActual('login')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            vistaActual === 'login' ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setVistaActual('secretaria')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            vistaActual === 'secretaria' ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          Secretaria
        </button>
        <button
          onClick={() => setVistaActual('paciente')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            vistaActual === 'paciente' ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          Paciente
        </button>
      </div>
    </div>
  );
}

export default App;