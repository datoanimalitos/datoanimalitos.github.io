/**
 * SCRIPT DEFINITIVO - Dr. Animalitos
 * CONFIGURACIÓN PARA LAS 6 LOTERÍAS - COMPLETAMENTE CORREGIDO
 */

const fs = require('fs');
const path = require('path');

// ============================================
// FUNCIÓN PARA FORMATEAR FECHA CORRECTAMENTE
// ============================================

function formatearFechaAPI(fecha) {
  // Formato: 2026-8-25 (sin ceros en mes y día)
  const año = fecha.getFullYear();
  const mes = fecha.getMonth() + 1; // Sin padStart
  const dia = fecha.getDate(); // Sin padStart
  return `${año}-${mes}-${dia}`;
}

function formatearFechaGranjita(fecha) {
  // Formato: 2026-08-25 (con ceros)
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// ============================================
// CONFIGURACIÓN DE LAS 6 LOTERÍAS
// ============================================
const CONFIG = {
  // 🦜 GUÁCHARO ACTIVO (12 números)
  guacharo: {
    apiUrl: 'https://api.lotterly.co/v1/results/guacharo-activo/',
    numeros: 12,
    nombre: 'Guácharo Activo',
    archivo: 'guacharo.json',
    procesar: async (fecha) => {
      const fechaStr = formatearFechaAPI(fecha);
      const url = `${CONFIG.guacharo.apiUrl}?exact_date=${fechaStr}&extended=true&_t=${Date.now()}`;
      
      console.log(`   📡 URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log(`   ⚠️ HTTP ${response.status}: ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length === 12) {
        return data.map(sorteo => {
          const resultado = sorteo.results?.[0]?.result;
          return resultado === "00" ? "00" : parseInt(resultado);
        });
      }
      return null;
    }
  },

  // 🐔 GRANJA MILLONARIA (10 números)
  granja: {
    apiUrl: 'http://www.granjamillonaria.com/Resource?a=granja-millonaria-lista',
    numeros: 10,
    nombre: 'Granja Millonaria',
    archivo: 'granja.json',
    procesar: async (fecha) => {
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const año = fecha.getFullYear();
      const fechaStr = `${dia}/${mes}/${año}`;
      
      console.log(`   📡 Buscando fecha: ${fechaStr}`);
      
      const response = await fetch(CONFIG.granja.apiUrl, {
        headers: {
          'User-Agent': 'DrAnimalitosBot/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) return null;
      const data = await response.json();
      
      const diaData = data.find(d => d.fecha === fechaStr);
      if (!diaData || !diaData.rss) {
        console.log(`   ⚠️ No hay datos para ${fechaStr}`);
        return null;
      }
      
      const numeros = diaData.rss
        .filter(item => item.nu)
        .map(item => parseInt(item.nu))
        .slice(0, 10);
      
      console.log(`   ✅ Encontrados ${numeros.length} números`);
      return numeros.length === 10 ? numeros : null;
    }
  },

  // 🦁 GRANJAZO MILLONARIO (10 números)
  granjazo: {
    apiUrl: 'http://www.granjamillonaria.com/Resource?a=granja-millonaria-lista',
    numeros: 10,
    nombre: 'Granjazo Millonario',
    archivo: 'granjazo.json',
    procesar: async (fecha) => {
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const año = fecha.getFullYear();
      const fechaStr = `${dia}/${mes}/${año}`;
      
      console.log(`   📡 Buscando fecha: ${fechaStr}`);
      
      const response = await fetch(CONFIG.granjazo.apiUrl, {
        headers: {
          'User-Agent': 'DrAnimalitosBot/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) return null;
      const data = await response.json();
      
      const diaData = data.find(d => d.fecha === fechaStr);
      if (!diaData || !diaData.rsj) {
        console.log(`   ⚠️ No hay datos para ${fechaStr}`);
        return null;
      }
      
      const numeros = diaData.rsj
        .filter(item => item.nu)
        .map(item => parseInt(item.nu))
        .slice(0, 10);
      
      console.log(`   ✅ Encontrados ${numeros.length} números`);
      return numeros.length === 10 ? numeros : null;
    }
  },

  // 🌱 LA GRANJITA (12 números) - CON URL CORRECTA
  granjita: {
    apiUrl: 'https://lagranjita.com/api/results.json',
    numeros: 12,
    nombre: 'La Granjita',
    archivo: 'granjita.json',
    procesar: async (fecha) => {
      const fechaStr = formatearFechaGranjita(fecha);
      const url = `${CONFIG.granjita.apiUrl}?date=${fechaStr}&productId=1&t=${Date.now()}`;
      
      console.log(`   📡 URL: ${url}`);
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://lagranjita.com/',
            'Origin': 'https://lagranjita.com'
          }
        });
        
        if (!response.ok) {
          console.log(`   ⚠️ HTTP ${response.status}: ${response.statusText}`);
          return null;
        }
        
        const data = await response.json();
        
        // La API devuelve un objeto con resultados
        // Estructura esperada: { results: [ ... ] } o directamente un array
        let numeros = [];
        
        if (data && data.results && Array.isArray(data.results)) {
          numeros = data.results.map(item => {
            const num = item.result || item.number || item.nu || item;
            return num === "00" ? "00" : parseInt(num);
          }).filter(n => !isNaN(n) || n === "00");
        } else if (Array.isArray(data)) {
          numeros = data.map(item => {
            const num = item.result || item.number || item.nu || item;
            return num === "00" ? "00" : parseInt(num);
          }).filter(n => !isNaN(n) || n === "00");
        }
        
        if (numeros.length === 12) {
          console.log(`   ✅ Encontrados ${numeros.length} números`);
          return numeros;
        } else {
          console.log(`   ⚠️ Solo ${numeros.length} números, esperando 12`);
          return null;
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return null;
      }
    }
  },

  // 🐆 SELVA PLUS (12 números)
  selva: {
    apiUrl: 'https://api.lotterly.co/v1/results/selva-plus/',
    numeros: 12,
    nombre: 'Selva Plus',
    archivo: 'selva.json',
    procesar: async (fecha) => {
      const fechaStr = formatearFechaAPI(fecha);
      const url = `${CONFIG.selva.apiUrl}?exact_date=${fechaStr}&extended=true&_t=${Date.now()}`;
      
      console.log(`   📡 URL: ${url}`);
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Origin': 'https://www.selvaplus.com',
            'Referer': 'https://www.selvaplus.com/'
          }
        });
        
        if (!response.ok) {
          console.log(`   ⚠️ HTTP ${response.status}: ${response.statusText}`);
          return null;
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length === 12) {
          return data.map(sorteo => {
            const resultado = sorteo.results?.[0]?.result;
            return resultado === "00" ? "00" : parseInt(resultado);
          });
        }
        
        return null;
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return null;
      }
    }
  },

  // 🎲 LOTTO ACTIVO (12 números)
  lotto: {
    apiUrl: 'https://lottoactivo.com/core/process.php',
    numeros: 12,
    nombre: 'Lotto Activo',
    archivo: 'lotto.json',
    procesar: async (fecha) => {
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const formData = new URLSearchParams();
      formData.append('option', 'WDNxcnFwcnNPb1lrd3VTSXEyYll0USRMNFJSNm50dzBHbTZxd1d3VjI4b0ZvVEY4djEyNElpNWpIenpsTWlqY1pKdENLT2E4dlZpaWV1SXk3WThTMkZmMVl6WUZudXNFMTcrUzJYMmhiL0xOQT09');
      formData.append('loteria', 'lotto_activo');
      formData.append('fecha', fechaStr);
      
      console.log(`   📡 Enviando petición a process.php para ${fechaStr}`);
      
      const response = await fetch('https://lottoactivo.com/core/process.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'DrAnimalitosBot/1.0'
        },
        body: formData
      });
      
      if (!response.ok) return null;
      const data = await response.json();
      
      if (!data.datos || !Array.isArray(data.datos)) return null;
      
      console.log(`   ✅ Recibidos ${data.datos.length} sorteos`);
      
      const ordenHoras = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
      ];
      
      const normalizarHora = (horaStr) => {
        return horaStr.replace('am', '').replace('pm', '').trim();
      };
      
      const ordenados = data.datos.sort((a, b) => {
        const horaA = normalizarHora(a.time_s);
        const horaB = normalizarHora(b.time_s);
        return ordenHoras.indexOf(horaA) - ordenHoras.indexOf(horaB);
      });
      
      const numeros = ordenados.map(item => {
        const num = item.number_animal;
        return num === "00" ? "00" : parseInt(num);
      });
      
      if (numeros.length === 12) {
        console.log(`   ✅ Números obtenidos: ${numeros.join(', ')}`);
        return numeros;
      } else {
        console.log(`   ⚠️ Solo se obtuvieron ${numeros.length} de 12 números`);
        return null;
      }
    }
  }
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

async function obtenerResultadosPorFecha(loteria, fecha) {
  const config = CONFIG[loteria];
  if (!config) return null;

  try {
    console.log(`📡 Consultando ${config.nombre}...`);
    return await config.procesar(fecha);
  } catch (error) {
    console.error(`❌ Error en ${config.nombre}:`, error.message);
    return null;
  }
}

async function obtenerResultadosHoy(loteria) {
  const hoy = new Date();
  const fechaLocal = new Date(hoy.getTime() - (4 * 60 * 60 * 1000));
  return await obtenerResultadosPorFecha(loteria, fechaLocal);
}

async function obtenerResultadosPasados(loteria, diasAtras = 1) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - diasAtras);
  const fechaLocal = new Date(fecha.getTime() - (4 * 60 * 60 * 1000));
  return await obtenerResultadosPorFecha(loteria, fechaLocal);
}

// ============================================
// ACTUALIZACIÓN DE ARCHIVOS JSON
// ============================================

function actualizarJSON(loteria, nuevosNumeros) {
  const config = CONFIG[loteria];
  const ruta = path.join(__dirname, `../data/${config.archivo}`);
  
  if (!fs.existsSync(ruta)) {
    console.error(`❌ No existe ${ruta}`);
    return false;
  }

  try {
    const actual = JSON.parse(fs.readFileSync(ruta, 'utf8'));
    
    const [diaViejo, diaMedio, diaReciente] = actual.resultados;
    
    actual.resultados = [diaMedio, diaReciente, nuevosNumeros];
    actual.fecha_actualizacion = new Date().toISOString();
    
    fs.writeFileSync(ruta, JSON.stringify(actual, null, 2));
    console.log(`✅ ${config.archivo} actualizado (rotación correcta)`);
    return true;
  } catch (error) {
    console.error(`❌ Error actualizando ${config.archivo}:`, error.message);
    return false;
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🎯 INICIANDO AUTOMATIZACIÓN DE RESULTADOS');
  console.log('==========================================');
  console.log('📅 Fecha:', new Date().toLocaleString('es-VE'));
  console.log('');

  const resultados = {};
  const loterias = ['guacharo', 'granja', 'granjazo', 'granjita', 'selva', 'lotto'];
  const numerosEsperados = { guacharo: 12, granja: 10, granjazo: 10, granjita: 12, selva: 12, lotto: 12 };

  for (const loteria of loterias) {
    console.log(`\n🔍 Buscando ${CONFIG[loteria].nombre}...`);
    
    let numeros = await obtenerResultadosHoy(loteria);
    
    if (!numeros || numeros.length !== numerosEsperados[loteria]) {
      console.log(`⚠️ No hay datos de hoy, buscando ayer...`);
      numeros = await obtenerResultadosPasados(loteria, 1);
    }
    
    if (!numeros || numeros.length !== numerosEsperados[loteria]) {
      console.log(`⚠️ Tampoco ayer, buscando anteayer...`);
      numeros = await obtenerResultadosPasados(loteria, 2);
    }

    if (numeros && numeros.length === numerosEsperados[loteria]) {
      resultados[loteria] = numeros;
      console.log(`✅ ${CONFIG[loteria].nombre}: ${numeros.length} números obtenidos`);
      console.log('   Números:', numeros.join(', '));
    } else {
      console.log(`❌ No se pudieron obtener resultados para ${CONFIG[loteria].nombre}`);
    }
  }

  console.log('\n📦 ACTUALIZANDO ARCHIVOS JSON...');
  console.log('==========================================');
  
  let actualizados = 0;
  for (const loteria of loterias) {
    if (resultados[loteria]) {
      if (actualizarJSON(loteria, resultados[loteria])) {
        actualizados++;
      }
    }
  }

  console.log('\n🎉 RESUMEN FINAL');
  console.log('==========================================');
  console.log(`✅ Loterías actualizadas: ${actualizados} de ${loterias.length}`);
  console.log(`📊 Detalle:`);
  for (const loteria of loterias) {
    const estado = resultados[loteria] ? '✅' : '❌';
    console.log(`   ${estado} ${CONFIG[loteria].nombre}`);
  }
  console.log('');
  console.log('⏰ Próxima ejecución: Esta noche a las 11:00 PM');
  console.log('==========================================');
}

main().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});