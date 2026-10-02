import { useState } from 'react';
import './Login.css'; // Crearemos un archivo CSS específico para no chocar con el otro diseño

const tieneLongitud = (contrasena) => contrasena.length >= 8;
const tieneNumero = (contrasena) => /\d/.test(contrasena);
const tieneMayuscula = (contrasena) => /[A-Z]/.test(contrasena);
const tieneMinuscula = (contrasena) => /[a-z]/.test(contrasena);
const tieneEspecial = (contrasena) => /[!@#$%^&*]/.test(contrasena);

const tienearroba = (usuario) => /@/.test(usuario);
const tienecom = (usuario) => /.com/.test(usuario);  

const reglasUsuario = [tienearroba, tienecom ];

const evaluarContrasena = (contrasena, listaDeReglas) => {
  return listaDeReglas.every(regla => regla(contrasena));
};

const evaluarCorreo = (usuario, reglasUsuario) => {
   return reglasUsuario.every(regla => regla(usuario));  
};

const reglasSeguridad = [
  tieneLongitud, tieneNumero, tieneMayuscula, tieneMinuscula, tieneEspecial
];

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const manejarIngreso = (e) => {
    e.preventDefault();
    const accesoContransena = evaluarContrasena(contrasena, reglasSeguridad);
    const accesoCorreo = evaluarCorreo(usuario, reglasUsuario);

    if (accesoContransena && accesoCorreo ) {
      setMensajeError(""); 
      alert("Aprobado: Ejecutando fetch('/api/login')...");
    } else {
      setMensajeError("La contraseña o correo no son correctos");
    }
  };


  //validacion usuario



  return (
    <div className="login-layout">
      {/* Mitad Izquierda: Formulario */}
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

      {/* Mitad Derecha: Imagen decorativa */}
      <div className="login-image-section">
        {/* La imagen se define en el CSS */}
      </div>
    </div>
  );
};

export default Login;