import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige automáticamente al usuario a la pantalla de Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Tu vista actual */}
        <Route path="/login" element={<Login />} />
        
        {/* Aquí agregarás tus nuevas rutas cuando decidas retomar el panel de doctores */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;