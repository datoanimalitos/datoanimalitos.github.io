// js/contador.js

function verificarAccesoDiario() {
    const MAX_INTENTOS = 3;
    const hoy = new Date().toISOString().split('T')[0]; // Fecha actual YYYY-MM-DD
    
    // Leer el registro guardado en el navegador
    let registroAcceso = JSON.parse(localStorage.getItem('registroAccesoUsuario')) || { fecha: hoy, ingresos: 0 };

    // Si cambió el día, reiniciamos el contador a 0
    if (registroAcceso.fecha !== hoy) {
        registroAcceso = { fecha: hoy, ingresos: 0 };
    }

    // 1. Si ya se agotaron los 3 accesos, bloquea y retorna false
    if (registroAcceso.ingresos >= MAX_INTENTOS) {
        alert("Agotó sus 3 accesos, por favor intente más tarde.");
        return false;
    }

    // 2. Descuenta un intento y guarda la nueva cantidad
    registroAcceso.ingresos += 1;
    localStorage.setItem('registroAccesoUsuario', JSON.stringify(registroAcceso));

    const entradasRestantes = MAX_INTENTOS - registroAcceso.ingresos;

    // 3. Muestra el mensaje informativo con el contador antes de dar paso
    if (entradasRestantes > 0) {
        alert(`Acceso permitido. Le quedan ${entradasRestantes} ${entradasRestantes === 1 ? 'acceso' : 'accesos'} disponibles el día de hoy.`);
    } else {
        alert("Acceso permitido. Ha utilizado su último acceso disponible del día.");
    }

    return true; // Acceso concedido
}