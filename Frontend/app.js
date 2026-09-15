const loginForm = document.getElementById('loginForm');
// Capturamos también el botón para poder modificarlo
const btnSubmit = loginForm.querySelector('button[type="submit"]');

// Agregamos 'async' porque haremos pausas y esperaremos respuestas de la red
loginForm.addEventListener('submit', async function(evento) {
    evento.preventDefault();

    const formData = new FormData(loginForm);
    const datosUsuario = Object.fromEntries(formData);

    // 1. Validación en el cliente (Paradigma Imperativo)
    if (!datosUsuario.user || !datosUsuario.pass) {
        alert("Por favor, ingresa tu usuario y contraseña.");
        return; // Cortamos la ejecución aquí si faltan datos
    }

    // 2. Feedback visual (Bloqueamos la interfaz)
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = "Iniciando sesión...";
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = "0.7";

    try {
        // 3. El puente de red (Fetch API)
        // Aquí irá tu petición real a Python. Por ahora está comentada:
        /*
        const respuesta = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario)
        });
        const resultado = await respuesta.json();
        */

        // Simulamos que el servidor de Python tarda 1.5 segundos en responder
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log("JSON enviado a Python:", JSON.stringify(datosUsuario));
        
        // Aquí leeríamos el 'resultado' de Python para saber si redirigir o mostrar error

    } catch (error) {
        console.error("Error de conexión con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    } finally {
        // 4. Restauramos la interfaz pase lo que pase (éxito o error)
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = "1";
    }
});