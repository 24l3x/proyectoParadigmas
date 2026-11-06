import { useState } from 'react';
import './Login.css'; 

const tieneLongitud = (contrasena) => contrasena.length >= 8;
const tieneNumero = (contrasena) => /\d/.test(contrasena);
const tieneMayuscula = (contrasena) => /[A-Z]/.test(contrasena);
const tieneMinuscula = (contrasena) => /[a-z]/.test(contrasena);
const tieneEspecial = (contrasena) => /[!@#$%^&*]/.test(contrasena);

const tienearroba = (usuario) => /@/.test(usuario);
const tienecom = (usuario) => /.com/.test(usuario);  

const reglasUsuario = [tienearroba, tienecom];

const evaluarContrasena = (contrasena, listaDeReglas) => {
  return listaDeReglas.every(regla => regla(contrasena));
};

const evaluarCorreo = (usuario, reglasUsuario) => {
   return reglasUsuario.every(regla => regla(usuario));  
};

const reglasSeguridad = [
  tieneLongitud, tieneNumero, tieneMayuscula, tieneMinuscula, tieneEspecial
];

const Login = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const manejarIngreso = (e) => {
    e.preventDefault();
    const accesoContransena = evaluarContrasena(contrasena, reglasSeguridad);
    const accesoCorreo = evaluarCorreo(usuario, reglasUsuario);

    if (accesoContransena && accesoCorreo) {
      setMensajeError(""); 
      
      // Control de roles: Cualquiera puede ser paciente, el staff tiene correos fijos
      let rolAsignado = 'paciente'; 
      if (usuario === 'admin@hospital.com') rolAsignado = 'secretaria';
      if (usuario === 'doc@hospital.com') rolAsignado = 'doctor';

      onLoginSuccess({
        nombre: usuario.split('@')[0], 
        rol: rolAsignado,
        email: usuario
      });

    } else {
      setMensajeError("La contraseña o correo no cumplen los requisitos.");
    }
  };

  return (
    <div className="login-layout">
      <div className="login-form-section">
        <div className="login-box">
          <div className="login-header">
            <h1>Gestión Hospitalaria</h1>
            <p>Ingresa tus credenciales para acceder al sistema</p>
          </div>
          
          <form onSubmit={manejarIngreso}>
            <div className="input-group">
              <label>Usuario o Correo Electrónico</label>
              <input 
                type="text" 
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              <ul className="password-rules">
                <li>Mínimo 8 caracteres</li>
                <li>Al menos 1 mayúscula y 1 minúscula</li>
                <li>Al menos 1 número y 1 carácter especial (!@#$%^&*)</li>
              </ul>
            </div>

            {mensajeError && <p className="mensaje-error-login">{mensajeError}</p>}

            <div className="login-options">
              <label>
                <input type="checkbox" /> Recordarme
              </label>
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>
            
            <button type="submit" className="login-btn">Iniciar Sesión</button>
          </form>
          <div className="login-footer">
            <p>Sistema Hospitalario</p>
          </div>
        </div>
      </div>
      <div className="login-image-section"></div>
    </div>
  );
};

export default Login;