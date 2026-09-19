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

try {
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
    }
});