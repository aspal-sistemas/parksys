const fs = require('fs');
const path = require('path');

// Leer el archivo PDF extraído
const pdfPath = path.join(__dirname, '../attached_assets/codigo_agrupador_1752537341125.pdf');
const content = fs.readFileSync(pdfPath, 'utf8');

// Procesar líneas para extraer códigos SAT
const lines = content.split('\n');
const satCodes = [];

let currentSection = '';
let currentLevel = 0;

lines.forEach((line, index) => {
  // Limpiar espacios y caracteres especiales
  line = line.trim();
  
  // Detectar secciones principales (100, 200, 300, etc.)
  if (line.match(/^\d{3}\s+/)) {
    const match = line.match(/^(\d{3})\s+(.+)/);
    if (match) {
      currentSection = match[1];
      const name = match[2].trim();
      satCodes.push({
        code: match[1],
        name: name,
        level: 1,
        parent_code: null,
        account_nature: getAccountNature(match[1]),
        section: getSectionName(match[1])
      });
    }
  }
  
  // Detectar subsecciones (100.01, 200.01, etc.)
  else if (line.match(/^\d{3}\.\d{2}\s+/)) {
    const match = line.match(/^(\d{3}\.\d{2})\s+(.+)/);
    if (match) {
      const name = match[2].trim();
      satCodes.push({
        code: match[1],
        name: name,
        level: 2,
        parent_code: currentSection,
        account_nature: getAccountNature(match[1]),
        section: getSectionName(match[1])
      });
    }
  }
  
  // Detectar cuentas específicas con nivel y código
  else if (line.match(/^\d\s+\d{3}\s+/)) {
    const match = line.match(/^(\d)\s+(\d{3})\s+(.+)/);
    if (match) {
      const level = parseInt(match[1]);
      const code = match[2];
      const name = match[3].trim();
      satCodes.push({
        code: code,
        name: name,
        level: level + 2, // Ajustar niveles para coincidir con nuestro sistema
        parent_code: getParentCode(code, level),
        account_nature: getAccountNature(code),
        section: getSectionName(code)
      });
    }
  }
  
  // Detectar subcuentas con formato específico
  else if (line.match(/^\d\s+\d{3}\.\d{2}\s+/)) {
    const match = line.match(/^(\d)\s+(\d{3}\.\d{2})\s+(.+)/);
    if (match) {
      const level = parseInt(match[1]);
      const code = match[2];
      const name = match[3].trim();
      satCodes.push({
        code: code,
        name: name,
        level: level + 2,
        parent_code: getParentCode(code, level),
        account_nature: getAccountNature(code),
        section: getSectionName(code)
      });
    }
  }
});

// Función para determinar la naturaleza de la cuenta
function getAccountNature(code) {
  const numericCode = parseInt(code.toString().substring(0, 1));
  if (numericCode === 1) return 'debit';  // Activo
  if (numericCode === 2) return 'credit'; // Pasivo
  if (numericCode === 3) return 'credit'; // Capital
  if (numericCode === 4) return 'credit'; // Ingresos
  if (numericCode === 5) return 'debit';  // Gastos
  if (numericCode === 6) return 'debit';  // Costos
  if (numericCode === 7) return 'debit';  // Otros gastos
  return 'debit';
}

// Función para obtener el nombre de la sección
function getSectionName(code) {
  const numericCode = parseInt(code.toString().substring(0, 1));
  const sections = {
    1: 'Activo',
    2: 'Pasivo', 
    3: 'Capital',
    4: 'Ingresos',
    5: 'Gastos',
    6: 'Costos',
    7: 'Otros'
  };
  return sections[numericCode] || 'Otros';
}

// Función para obtener el código padre
function getParentCode(code, level) {
  if (level === 1) return null;
  
  const codeStr = code.toString();
  if (codeStr.includes('.')) {
    const basecode = codeStr.split('.')[0];
    return basecode;
  }
  
  // Para códigos de 3 dígitos, el padre es la centena
  if (codeStr.length === 3) {
    return codeStr.substring(0, 1) + '00';
  }
  
  return null;
}

// Filtrar códigos válidos y eliminar duplicados
const validSatCodes = satCodes.filter(code => 
  code.code && 
  code.name && 
  code.name.length > 3 &&
  !code.name.includes('Código') &&
  !code.name.includes('Nivel') &&
  !code.name.includes('agrupador')
);

// Eliminar duplicados por código
const uniqueSatCodes = validSatCodes.filter((code, index, self) => 
  index === self.findIndex(c => c.code === code.code)
);

console.log(`📊 Procesados ${uniqueSatCodes.length} códigos SAT únicos`);

// Generar script SQL para insertar en la base de datos
const sqlInserts = uniqueSatCodes.map(code => `
  INSERT INTO accounting_categories (code, name, level, parent_id, sat_code, account_nature, is_active, description, created_at, updated_at)
  VALUES (
    '${code.code}',
    '${code.name.replace(/'/g, "''")}',
    ${code.level},
    ${code.parent_code ? `(SELECT id FROM accounting_categories WHERE code = '${code.parent_code}' LIMIT 1)` : 'NULL'},
    '${code.code}',
    '${code.account_nature}',
    true,
    'Código SAT oficial - ${code.section}',
    NOW(),
    NOW()
  ) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    sat_code = EXCLUDED.sat_code,
    account_nature = EXCLUDED.account_nature,
    updated_at = NOW();
`).join('\n');

// Escribir archivo SQL
fs.writeFileSync(path.join(__dirname, '../server/sat-codes-import.sql'), sqlInserts);

// Generar archivo JSON para referencia
fs.writeFileSync(
  path.join(__dirname, '../server/sat-codes-processed.json'), 
  JSON.stringify(uniqueSatCodes, null, 2)
);

console.log('✅ Archivos generados:');
console.log('- server/sat-codes-import.sql (para importar a BD)');
console.log('- server/sat-codes-processed.json (para referencia)');
console.log(`📈 Total de códigos procesados: ${uniqueSatCodes.length}`);

// Mostrar estadísticas por sección
const stats = uniqueSatCodes.reduce((acc, code) => {
  acc[code.section] = (acc[code.section] || 0) + 1;
  return acc;
}, {});

console.log('\n📊 Estadísticas por sección:');
Object.entries(stats).forEach(([section, count]) => {
  console.log(`${section}: ${count} códigos`);
});