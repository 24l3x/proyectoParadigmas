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
        // Aquí va la conexión a python
        /*
        const respuesta = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario)
        });
        const resultado = await respuesta.json();
        */

        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log("JSON enviado a Python:", JSON.stringify(datosUsuario));

    } catch (error) {
        console.error("Error de conexión con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    } finally {
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = "1";
    }
});