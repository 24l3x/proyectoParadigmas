import React, { useState } from 'react';
import SidebarHospital from '../components/SidebarHospital';
import HeaderHospital from '../components/HeaderHospital';
import CitasDelDia from '../components/CitasDelDia';
import CalendarioSemanal from '../components/CalendarioSemanal';

const DashboardSecretaria = ({ usuario, onCambiarVista, onLogout }) => {
  const [pestañaActiva, setPestañaActiva] = useState('citas');

  return (
    <div className="bg-slate-50/50 font-body text-on-surface antialiased text-sm min-h-screen">
      <SidebarHospital 
        pestañaActiva={pestañaActiva} 
        setPestañaActiva={setPestañaActiva} 
        onLogout={onLogout} 
      />
      <div className="pl-56">
        <HeaderHospital usuario={usuario} />
        <main className="w-full pt-24 px-8 pb-8 max-w-6xl mx-auto">
          {pestañaActiva === 'calendario' ? (
            <CalendarioSemanal />
          ) : (
            <CitasDelDia onCambiarVista={onCambiarVista} usuario={usuario} />
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardSecretaria;