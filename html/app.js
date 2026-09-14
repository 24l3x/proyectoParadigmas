const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', function(evento) {
    evento.preventDefault();// Esto es para que no cargue la pagina mai, no debes quitar esto
    const formData = new FormData(loginForm);
    const datosUsuario = Object.fromEntries(formData);//Esto segun crea el paquete que enviaremos a python después
    console.log("Datos capturados listos para enviar a Python:", datosUsuario);
});