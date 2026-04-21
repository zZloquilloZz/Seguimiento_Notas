import * as pdfjsLib from 'pdfjs-dist';
import type { EstadoCurso, TipoCurso } from '../models';

// Configurar worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface CursoParsed {
  codigo: string;
  nombre: string;
  creditos: number;
  ciclo: number;
  estado: EstadoCurso;
  tipo: TipoCurso;
}

export interface ParseResult {
  cursos: CursoParsed[];
  nombre?: string;
  programa?: string;
}

const PATRONES_CICLO = [
  /(\d+)(?:er|do|ro|to|mo|vo|no)\s+ciclo/i,
  /semestre\s+(\d+)/i,
  /ciclo\s+([ivxl]+)/i,
  /([ivxl]+)\s+ciclo/i,
];

const IGNORAR = /nivelaci[oó]n|complementario|proped[eé]utico/i;

const ESTADOS: Record<string, 'aprobado' | 'convalidado' | 'en-curso' | 'pendiente'> = {
  aprobado: 'aprobado',
  aprobada: 'aprobado',
  apr: 'aprobado',
  convalidado: 'convalidado',
  convalidada: 'convalidado',
  conv: 'convalidado',
  conval: 'convalidado',
  'en curso': 'en-curso',
  encurso: 'en-curso',
  cursando: 'en-curso',
  matriculado: 'en-curso',
  pendiente: 'pendiente',
  pend: 'pendiente',
  'por llevar': 'pendiente',
  'no llevado': 'pendiente',
};

function romanoADecimal(romano: string): number {
  const valores: Record<string, number> = {
    i: 1,
    v: 5,
    x: 10,
    l: 50,
  };

  let total = 0;
  let anterior = 0;

  for (let i = romano.length - 1; i >= 0; i--) {
    const valor = valores[romano[i].toLowerCase()];
    if (valor < anterior) {
      total -= valor;
    } else {
      total += valor;
    }
    anterior = valor;
  }

  return total;
}

function detectarCiclo(linea: string): number | null {
  for (const patron of PATRONES_CICLO) {
    const match = linea.match(patron);
    if (match) {
      const valor = match[1];
      // Si es romano
      if (/^[ivxl]+$/i.test(valor)) {
        return romanoADecimal(valor);
      }
      return parseInt(valor);
    }
  }
  return null;
}

function detectarEstado(linea: string): 'aprobado' | 'convalidado' | 'en-curso' | 'pendiente' {
  const lineaLower = linea.toLowerCase();
  for (const [key, value] of Object.entries(ESTADOS)) {
    if (lineaLower.includes(key)) {
      return value;
    }
  }
  return 'pendiente';
}

function detectarTipo(linea: string): 'obligatorio' | 'electivo' {
  const lineaLower = linea.toLowerCase();
  if (lineaLower.includes('electivo') || lineaLower.includes('e ')) {
    return 'electivo';
  }
  return 'obligatorio';
}

function extraerCreditos(linea: string): number | null {
  const match = linea.match(/\b(\d+(?:\.\d+)?)\b/g);
  if (!match) return null;

  for (const num of match) {
    const valor = parseFloat(num);
    if (valor >= 0.1 && valor <= 10) {
      return valor;
    }
  }
  return null;
}

function extraerCurso(linea: string, ciclo: number): CursoParsed | null {
  // Ignorar líneas con palabras clave
  if (IGNORAR.test(linea)) return null;

  // Detectar código (4-12 caracteres alfanuméricos al inicio)
  const codigoMatch = linea.match(/^([A-Z0-9]{4,12})\b/i);
  if (!codigoMatch) return null;

  const codigo = codigoMatch[1];
  const resto = linea.substring(codigo.length).trim();

  // Extraer créditos
  const creditos = extraerCreditos(resto);
  if (!creditos) return null;

  // Extraer nombre (texto más largo que no sea número)
  const palabras = resto.split(/\s+/).filter(p => !/^\d+(\.\d+)?$/.test(p));
  const nombre = palabras.slice(0, -2).join(' ').trim() || palabras.join(' ').trim();

  if (!nombre || nombre.length < 3) return null;

  return {
    codigo,
    nombre,
    creditos,
    ciclo,
    estado: detectarEstado(linea),
    tipo: detectarTipo(linea),
  };
}

function esFormatoUTP(textoCompleto: string): boolean {
  const textoLower = textoCompleto.toLowerCase();
  return (
    textoLower.includes('plan de estudio') ||
    textoLower.includes('universidad tecnológica del perú') ||
    textoLower.includes('universidad tecnologica del peru')
  );
}

function parsearFormatoUTP(todasLasLineas: string[]): ParseResult {
  const cursos: CursoParsed[] = [];
  let nombre: string | undefined;
  let programa: string | undefined;
  let cicloActual = 1;
  let cicloDetectado = false; // Para ignorar todo antes del primer ciclo

  console.log('=== PARSER UTP: Iniciando análisis ===');
  console.log('Total de líneas:', todasLasLineas.length);

  // Encabezados de tabla a ignorar
  const encabezados = [
    'código curso',
    'codigo curso',
    'nombre curso',
    'horas',
    'semanales',
    'créditos',
    'creditos',
    'tipo',
    'pre-requisito',
    'pre requisito',
    'estado',
    '(*)',
    '(***)',
  ];

  // Buscar nombre y programa en las primeras 50 líneas
  for (let i = 0; i < Math.min(50, todasLasLineas.length); i++) {
    const linea = todasLasLineas[i].trim();
    const lineaLower = linea.toLowerCase();

    // Detectar programa (en la misma línea)
    if (lineaLower.startsWith('programa:')) {
      programa = linea.substring(linea.indexOf(':') + 1).trim();
      console.log('Programa detectado:', programa);
    }

    // Detectar alumno (en la misma línea)
    if (lineaLower.startsWith('alumno:')) {
      nombre = linea.substring(linea.indexOf(':') + 1).trim();
      console.log('Nombre detectado:', nombre);
    }
  }

  // Procesar cursos línea por línea
  let i = 0;
  while (i < todasLasLineas.length) {
    const linea = todasLasLineas[i].trim();
    const lineaLower = linea.toLowerCase();

    // Ignorar líneas vacías
    if (!linea) {
      i++;
      continue;
    }

    // Ignorar encabezados de tabla
    const esEncabezado = encabezados.some(enc => lineaLower === enc);
    if (esEncabezado) {
      console.log('Ignorando encabezado:', linea);
      i++;
      continue;
    }

    // Detectar ciclo
    const nuevoCiclo = detectarCiclo(linea);
    if (nuevoCiclo !== null) {
      cicloActual = nuevoCiclo;
      cicloDetectado = true;
      console.log(`--- Detectado ciclo ${cicloActual} ---`);
      i++;
      continue;
    }

    // Ignorar todo hasta detectar el primer ciclo (incluye nivelación)
    if (!cicloDetectado) {
      i++;
      continue;
    }

    // Detectar código de curso UTP (empieza con "1" y tiene 8-11 caracteres alfanuméricos)
    // Ejemplos: 100000I0N2, 100000X101, 10000096SI
    const esCodigoUTP = /^1[0-9A-Z]{7,10}$/i.test(linea);

    if (esCodigoUTP) {
      const codigo = linea;
      console.log(`\n→ Detectando curso con código: ${codigo}`);

      // Recolectar datos del curso en las siguientes líneas
      let j = i + 1;

      // 1. Nombre del curso (puede ser 1 o 2 líneas)
      let nombreCurso = '';
      while (j < todasLasLineas.length) {
        const lineaNombre = todasLasLineas[j].trim();
        if (!lineaNombre) {
          j++;
          continue;
        }

        // Si es un número, ya terminó el nombre
        if (/^\d+(\.\d+)?$/.test(lineaNombre)) {
          break;
        }

        // Si es "O" o "E" solo, ya terminó el nombre
        if (lineaNombre === 'O' || lineaNombre === 'E') {
          break;
        }

        // Si es un estado, ya terminó
        if (
          ['APROBADO', 'CONVALIDADO', 'EN CURSO', 'PENDIENTE'].includes(
            lineaNombre.toUpperCase()
          )
        ) {
          break;
        }

        // Si es otro código, ya terminó
        if (/^1[0-9A-Z]{7,10}$/i.test(lineaNombre)) {
          break;
        }

        // Agregar al nombre
        nombreCurso += (nombreCurso ? ' ' : '') + lineaNombre;
        console.log(`  Nombre: "${lineaNombre}"`);
        j++;
      }

      if (!nombreCurso || nombreCurso.length < 3) {
        console.log('  ✗ Nombre inválido, saltando curso');
        i = j;
        continue;
      }

      // 2. Horas semanales y créditos (dos números consecutivos)
      const numeros: number[] = [];
      while (j < todasLasLineas.length && numeros.length < 2) {
        const lineaNum = todasLasLineas[j].trim();
        if (!lineaNum) {
          j++;
          continue;
        }

        const num = parseFloat(lineaNum);
        if (!isNaN(num) && num >= 0 && num <= 20) {
          numeros.push(num);
          console.log(`  Número detectado: ${num}`);
          j++;
        } else {
          break;
        }
      }

      if (numeros.length < 2) {
        console.log('  ✗ No se encontraron 2 números (horas y créditos), saltando curso');
        i = j;
        continue;
      }

      const creditos = numeros[1]; // El segundo número es los créditos

      // 3. Tipo (O o E)
      let tipo: 'obligatorio' | 'electivo' = 'obligatorio';
      while (j < todasLasLineas.length) {
        const lineaTipo = todasLasLineas[j].trim();
        if (!lineaTipo) {
          j++;
          continue;
        }

        if (lineaTipo === 'O') {
          tipo = 'obligatorio';
          console.log(`  Tipo: Obligatorio`);
          j++;
          break;
        } else if (lineaTipo === 'E') {
          tipo = 'electivo';
          console.log(`  Tipo: Electivo`);
          j++;
          break;
        } else {
          break;
        }
      }

      // 4. Pre-requisito (opcional, puede ser un código o múltiples códigos separados por coma)
      // Saltamos líneas que parecen pre-requisitos
      while (j < todasLasLineas.length) {
        const lineaPrereq = todasLasLineas[j].trim();
        if (!lineaPrereq) {
          j++;
          continue;
        }

        // Si es un estado, salir
        if (
          ['APROBADO', 'CONVALIDADO', 'EN CURSO', 'PENDIENTE'].includes(
            lineaPrereq.toUpperCase()
          )
        ) {
          break;
        }

        // Si parece un código de pre-requisito (simple o múltiple), saltarlo
        const esPrerequisito =
          /^1[0-9A-Z]{7,10}$/i.test(lineaPrereq) || // código simple
          lineaPrereq === 'NINGUNO' ||
          /^(1[0-9A-Z]{7,10}[,;]\s*)+/i.test(lineaPrereq) || // múltiples códigos con separador
          (lineaPrereq.includes(',') && lineaPrereq.match(/1[0-9A-Z]{4,}/i)); // tiene coma y código

        if (esPrerequisito) {
          console.log(`  Pre-requisito: ${lineaPrereq}`);
          j++;
          continue;
        }

        // Si es otra cosa, puede ser el estado
        break;
      }

      // 5. Estado (APROBADO, CONVALIDADO, EN CURSO, PENDIENTE)
      let estado: 'aprobado' | 'convalidado' | 'en-curso' | 'pendiente' = 'pendiente';
      let estadoDetectado = false;

      while (j < todasLasLineas.length && !estadoDetectado) {
        const lineaEstado = todasLasLineas[j].trim();
        if (!lineaEstado) {
          j++;
          continue;
        }

        const estadoUpper = lineaEstado.toUpperCase();

        if (estadoUpper === 'APROBADO') {
          estado = 'aprobado';
          console.log(`  Estado: Aprobado`);
          estadoDetectado = true;
          j++;
        } else if (estadoUpper === 'CONVALIDADO') {
          estado = 'convalidado';
          console.log(`  Estado: Convalidado`);
          estadoDetectado = true;
          j++;
        } else if (estadoUpper === 'EN CURSO') {
          estado = 'en-curso';
          console.log(`  Estado: En curso`);
          estadoDetectado = true;
          j++;
        } else if (estadoUpper === 'PENDIENTE') {
          estado = 'pendiente';
          console.log(`  Estado: Pendiente`);
          estadoDetectado = true;
          j++;
        } else {
          // No encontramos estado, usar pendiente por defecto
          console.log(`  Estado: Pendiente (por defecto)`);
          break;
        }
      }

      // Crear el curso
      const cursoNuevo: CursoParsed = {
        codigo,
        nombre: nombreCurso,
        creditos,
        ciclo: cicloActual,
        estado,
        tipo,
      };

      console.log('✓ Curso detectado:', cursoNuevo);
      cursos.push(cursoNuevo);

      // Continuar desde donde quedamos
      i = j;
    } else {
      i++;
    }
  }

  console.log(`=== PARSER UTP: ${cursos.length} cursos detectados ===`);

  return {
    cursos,
    nombre,
    programa,
  };
}

function parsearFormatoGenerico(todasLasLineas: string[]): ParseResult {
  const cursos: CursoParsed[] = [];
  let nombre: string | undefined;
  let programa: string | undefined;
  let cicloActual = 1;

  console.log('=== PARSER GENÉRICO: Iniciando análisis ===');

  // Buscar nombre y programa en las primeras 20 líneas
  for (let j = 0; j < Math.min(20, todasLasLineas.length); j++) {
    const linea = todasLasLineas[j].toLowerCase();
    if (
      (linea.includes('alumno:') ||
        linea.includes('estudiante:') ||
        linea.includes('nombre:')) &&
      j + 1 < todasLasLineas.length
    ) {
      nombre = todasLasLineas[j + 1].trim();
    }
    if (
      (linea.includes('programa:') || linea.includes('carrera:')) &&
      j + 1 < todasLasLineas.length
    ) {
      programa = todasLasLineas[j + 1].trim();
    }
  }

  // Procesar líneas
  for (const linea of todasLasLineas) {
    // Detectar cambio de ciclo
    const nuevoCiclo = detectarCiclo(linea);
    if (nuevoCiclo !== null) {
      cicloActual = nuevoCiclo;
      continue;
    }

    // Intentar extraer curso
    const curso = extraerCurso(linea, cicloActual);
    if (curso) {
      cursos.push(curso);
    }
  }

  console.log(`=== PARSER GENÉRICO: ${cursos.length} cursos detectados ===`);

  return {
    cursos,
    nombre,
    programa,
  };
}

export async function parsearPDF(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const todasLasLineas: string[] = [];

    // Extraer todo el texto del PDF
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const lineas = textContent.items
        .map((item: any) => item.str)
        .filter((str: string) => str.trim());

      todasLasLineas.push(...lineas);
    }

    // Log del texto completo para debugging
    console.log('==========================================');
    console.log('TEXTO COMPLETO EXTRAÍDO DEL PDF:');
    console.log('==========================================');
    console.log(todasLasLineas.join('\n'));
    console.log('==========================================');
    console.log('Total de líneas extraídas:', todasLasLineas.length);
    console.log('==========================================');

    // Detectar formato
    const textoCompleto = todasLasLineas.join(' ');
    const esUTP = esFormatoUTP(textoCompleto);

    console.log('Formato detectado:', esUTP ? 'UTP' : 'GENÉRICO');

    // Parsear según formato
    if (esUTP) {
      return parsearFormatoUTP(todasLasLineas);
    } else {
      return parsearFormatoGenerico(todasLasLineas);
    }
  } catch (error) {
    console.error('Error parseando PDF:', error);
    throw new Error('Error al analizar el PDF. Verifica que sea un archivo válido.');
  }
}
