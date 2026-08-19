/**
 * SCRIPT PARA ACTUALIZAR SECUENCIA.JSON
 * Basado en la lógica de Gsm con >= 5 repeticiones
 */

const fs = require('fs');
const path = require('path');

// ============================================
// RUTAS DE ARCHIVOS
// ============================================
const RUTA_LOTTO = path.join(__dirname, '../data/lotto.json');
const RUTA_SECUENCIA = path.join(__dirname, '../data/secuencia.json');

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Cuenta cuántos números se repiten entre dos arrays
 */
function contarRepeticiones(ultimo, penultimo) {
    if (!ultimo || !penultimo || !Array.isArray(ultimo) || !Array.isArray(penultimo)) {
        return 0;
    }

    // Convertir a Set para comparación eficiente
    const setUltimo = new Set(ultimo.map(String));
    const setPenultimo = new Set(penultimo.map(String));

    let repetidos = 0;
    for (let val of setUltimo) {
        if (setPenultimo.has(val)) {
            repetidos++;
        }
    }
    return repetidos;
}

/**
 * Aplica la regla de secuencia:
 * - Si repeticiones >= 5: elimina la más antigua y agrega la más reciente
 * - Mantiene máximo 3 secuencias
 */
function aplicarReglaSecuencia(lottoResultados, secuenciaActual) {
    if (!lottoResultados || lottoResultados.length < 2) {
        console.log('⚠️ No hay suficientes resultados en lotto.json para analizar');
        return secuenciaActual;
    }

    // Tomar los 2 más recientes (últimos 2 elementos)
    const ultimo = lottoResultados[lottoResultados.length - 1];
    const penultimo = lottoResultados[lottoResultados.length - 2];

    const repeticiones = contarRepeticiones(ultimo, penultimo);
    console.log(`📊 Repeticiones encontradas: ${repeticiones}`);

    // Copia de seguridad de la secuencia actual
    let nuevaSecuencia = secuenciaActual ? [...secuenciaActual] : [];

    // ✅ CAMBIO AQUÍ: De >= 6 a >= 5
    if (repeticiones >= 5) {
        console.log(`✅ ${repeticiones} repeticiones >= 5 → Aplicando rotación`);

        // 1. Eliminar la más antigua (primer elemento)
        if (nuevaSecuencia.length > 0) {
            const eliminada = nuevaSecuencia.shift();
            console.log(`   🗑️ Secuencia eliminada: [${eliminada.join(', ')}]`);
        } else {
            console.log('   ℹ️ No había secuencias para eliminar');
        }

        // 2. Agregar la más reciente (último sorteo de lotto)
        nuevaSecuencia.push([...ultimo]);
        console.log(`   ➕ Secuencia agregada: [${ultimo.join(', ')}]`);

    } else {
        console.log(`ℹ️ ${repeticiones} repeticiones < 5 → No se aplica rotación`);
    }

    // Limitar a máximo 3 secuencias
    while (nuevaSecuencia.length > 3) {
        const eliminada = nuevaSecuencia.shift();
        console.log(`   ⚠️ Excediendo límite, eliminando: [${eliminada.join(', ')}]`);
    }

    return nuevaSecuencia;
}

/**
 * Lee un archivo JSON de forma segura
 */
function leerJSON(ruta) {
    try {
        if (!fs.existsSync(ruta)) {
            console.log(`⚠️ El archivo ${ruta} no existe, se creará uno nuevo`);
            return null;
        }
        const contenido = fs.readFileSync(ruta, 'utf8');
        return JSON.parse(contenido);
    } catch (error) {
        console.error(`❌ Error al leer ${ruta}:`, error.message);
        return null;
    }
}

/**
 * Escribe un archivo JSON de forma segura
 */
function escribirJSON(ruta, data) {
    try {
        const dir = path.dirname(ruta);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(ruta, JSON.stringify(data, null, 2));
        console.log(`✅ ${path.basename(ruta)} actualizado correctamente`);
        return true;
    } catch (error) {
        console.error(`❌ Error al escribir ${ruta}:`, error.message);
        return false;
    }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

function actualizarSecuencia() {
    console.log('🔄 ACTUALIZANDO SECUENCIA.JSON');
    console.log('==========================================');
    console.log(`📅 ${new Date().toLocaleString('es-VE')}`);
    console.log('');

    // 1. Leer lotto.json
    const lottoData = leerJSON(RUTA_LOTTO);
    if (!lottoData || !lottoData.resultados || lottoData.resultados.length < 2) {
        console.error('❌ No hay datos suficientes en lotto.json');
        console.log('   Se necesitan al menos 2 resultados para analizar');
        return false;
    }

    console.log(`📊 lotto.json tiene ${lottoData.resultados.length} resultados`);
    console.log(`   Último sorteo: [${lottoData.resultados[lottoData.resultados.length - 1].join(', ')}]`);
    console.log(`   Penúltimo:     [${lottoData.resultados[lottoData.resultados.length - 2].join(', ')}]`);
    console.log('');

    // 2. Leer secuencia.json (si existe)
    let secuenciaData = leerJSON(RUTA_SECUENCIA);
    let secuenciaActual = [];

    if (secuenciaData && secuenciaData.resultados) {
        secuenciaActual = secuenciaData.resultados;
        console.log(`📊 secuencia.json tiene ${secuenciaActual.length} secuencias`);
        if (secuenciaActual.length > 0) {
            console.log(`   Última secuencia: [${secuenciaActual[secuenciaActual.length - 1].join(', ')}]`);
        }
    } else {
        console.log('📊 secuencia.json está vacío o no existe, se creará uno nuevo');
        secuenciaActual = [];
    }
    console.log('');

    // 3. Aplicar la regla de secuencia
    const nuevaSecuencia = aplicarReglaSecuencia(lottoData.resultados, secuenciaActual);
    console.log('');

    // 4. Verificar si hubo cambios
    const huboCambios = JSON.stringify(secuenciaActual) !== JSON.stringify(nuevaSecuencia);

    if (!huboCambios) {
        console.log('ℹ️ No hubo cambios en secuencia.json');
        return true;
    }

    // 5. Guardar el nuevo archivo
    const nuevoData = {
        resultados: nuevaSecuencia,
        fecha_actualizacion: new Date().toISOString()
    };

    if (escribirJSON(RUTA_SECUENCIA, nuevoData)) {
        console.log('');
        console.log('🎉 SECUENCIA.JSON ACTUALIZADO EXITOSAMENTE');
        console.log(`   Secuencias guardadas: ${nuevaSecuencia.length}`);
        if (nuevaSecuencia.length > 0) {
            console.log(`   Última secuencia: [${nuevaSecuencia[nuevaSecuencia.length - 1].join(', ')}]`);
        }
        return true;
    }

    return false;
}

// ============================================
// EJECUCIÓN
// ============================================

if (require.main === module) {
    const success = actualizarSecuencia();
    process.exit(success ? 0 : 1);
}

module.exports = { actualizarSecuencia, contarRepeticiones, aplicarReglaSecuencia };
