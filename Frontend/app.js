const loginForm = document.getElementById('loginForm');
const btnSubmit = loginForm.querySelector('button[type="submit"]');

loginForm.addEventListener('submit', async function(evento) {
    evento.preventDefault();

    const formData = new FormData(loginForm);
    const datosUsuario = Object.fromEntries(formData);

    if (!datosUsuario.user || !datosUsuario.pass) {
        alert("Por favor, ingresa tu usuario y contraseña.");
        return;
    }

    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = "Iniciando sesión...";
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = "0.7";

    // 1. Funciones puras para validar reglas (usando Regex y Arrow Functions)
    const tieneLongitud = (contrasena) => contrasena.length >= 8;
    const tieneNumero = (contrasena) => /\d/.test(contrasena);
    const tieneMayuscula = (contrasena) => /[A-Z]/.test(contrasena);
    const tieneMinuscula = (contrasena) => /[a-z]/.test(contrasena);
    const tieneEspecial = (contrasena) => /[^a-zA-Z0-9]/.test(contrasena);

    // 2. Función de orden superior (Evaluador)
    const evaluarContrasena = (contrasena, listaDeReglas) => {
        // .every() itera la lista y ejecuta cada regla pasándole la contraseña
        return listaDeReglas.every(regla => regla(contrasena));
    };

    // 3. Flujo principal (Composición)
    // Se agrupan las funciones de validación en un arreglo inmutable
    const reglasSeguridad = [
        tieneLongitud, 
        tieneNumero, 
        tieneMayuscula, 
        tieneMinuscula, 
        tieneEspecial
    ];

    // Simulamos la captura del formulario de tu login
    const contrasenaIngresada = datosUsuario.pass; 

    // Ejecución de la validación
    const acceso = evaluarContrasena(contrasenaIngresada, reglasSeguridad);

    if (acceso) {
        alert("Contraseña válida.");
    } else {
        alert("Contraseña no cumple con los requisitos de seguridad. Debe tener al menos 8 caracteres, un número, una letra mayúscula, una letra minúscula y un carácter especial.");
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = "1";
        return;
}

/*try {
        // Disparamos la petición al puerto 8008
        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user: datosUsuario.user,
                password: datosUsuario.pass 
            })
        });

        // Si Python arroja el error 401 (HTTPException)
        if (!respuesta.ok) {
            alert("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
            return; // Detenemos la ejecución aquí
        }

        // Si todo salió bien, leemos la respuesta y redirigimos
        const resultado = await respuesta.json();
        console.log("Acceso concedido:", resultado);
        
        window.location.href = 'lobby.html';

    } catch (error) {
        console.error("Error de conexión con el servidor:", error);
        alert("No se pudo conectar con el servidor backend.");
    } finally {
        // Restauramos el botón
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = "1";
    }*/
});