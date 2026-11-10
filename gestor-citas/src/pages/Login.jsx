import { useState } from 'react';
import './Login.css';

// Puedes mantener o quitar estas validaciones locales si quieres que el backend haga todo el trabajo.
// Por ahora las dejamos como capa extra de seguridad frontal.
const tieneLongitud = (contrasena) => contrasena.length >= 8;
const tieneNumero = (contrasena) => /\d/.test(contrasena);
const tieneMayuscula = (contrasena) => /[A-Z]/.test(contrasena);
const tieneMinuscula = (contrasena) => /[a-z]/.test(contrasena);
const tieneEspecial = (contrasena) => /[!@#$%^&*]/.test(contrasena);
const tienearroba = (usuario) => /@/.test(usuario);
const tienecom = (usuario) => /.com/.test(usuario);

const reglasUsuario = [tienearroba, tienecom];
const reglasSeguridad = [tieneLongitud, tieneNumero, tieneMayuscula, tieneMinuscula, tieneEspecial];

const evaluarContrasena = (contrasena, listaDeReglas) => listaDeReglas.every(regla => regla(contrasena));
const evaluarCorreo = (usuario, reglasUsuario) => reglasUsuario.every(regla => regla(usuario));

const Login = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarIngreso = async (e) => {
    e.preventDefault();
    const accesoContransena = evaluarContrasena(contrasena, reglasSeguridad);
    const accesoCorreo = evaluarCorreo(usuario, reglasUsuario);

    if (accesoContransena && accesoCorreo) {
      setCargando(true);
      setMensajeError("");
      
      try {
        const response = await fetch('http://localhost:8000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // CORRECCIÓN CLAVE: Enviamos "correo" en lugar de "usuario"
          body: JSON.stringify({ 
            correo: usuario, 
            contrasena: contrasena 
          }),
        });

        if (response.ok) {
          const data = await response.json();
          onLoginSuccess({
            nombre: data.nombre,
            rol: data.rol,
            id: data.id_usuario,
            num_paciente: data.num_paciente
          });
        } else {
          const errorData = await response.json();
          // PROTECCIÓN PANTALLA BLANCA: Si el error es texto, lo muestra. Si es lista (422), muestra genérico.
          if (typeof errorData.detail === 'string') {
            setMensajeError(errorData.detail);
          } else {
            setMensajeError("Error de validación con el servidor (Revisa F12).");
            console.error("Detalle del error:", errorData.detail);
          }
        }
      } catch (error) {
        console.error("Error al conectar:", error);
        setMensajeError("No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
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
              <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
            </div>
            
            <div className="input-group">
              <label>Contraseña</label>
              <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
              <ul className="password-rules">
                <li>Mínimo 8 caracteres</li>
                <li>Al menos 1 mayúscula y 1 minúscula</li>
                <li>Al menos 1 número y 1 carácter especial (!@#$%^&*)</li>
              </ul>
            </div>

            {mensajeError && <p className="mensaje-error-login">{mensajeError}</p>}

            <div className="login-options">
              <label><input type="checkbox" /> Recordarme</label>
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>
            
            <button type="submit" className="login-btn" disabled={cargando}>
              {cargando ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
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