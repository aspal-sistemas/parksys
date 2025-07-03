/**
 * Script para agregar 100 activos ficticios distribuidos entre categorías y parques
 */

import { db } from './db';
import { assets, assetCategories, parks } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Datos de muestra por categoría
const assetData = {
  // Mobiliario Urbano (ID: 1)
  'Bancas': [
    { name: 'Banca de Madera Tipo Oslo', brand: 'UrbanDesign', model: 'UB-200', price: 3500 },
    { name: 'Banca Metálica con Respaldo', brand: 'MetalPark', model: 'MP-150', price: 2800 },
    { name: 'Banca Ecológica de Plástico Reciclado', brand: 'EcoMob', model: 'EM-300', price: 4200 },
    { name: 'Banca Infantil Colorida', brand: 'KidsZone', model: 'KZ-100', price: 2200 },
  ],
  'Basureros': [
    { name: 'Basurero Separador de 3 Compartimentos', brand: 'EcoClean', model: 'EC-3C', price: 1800 },
    { name: 'Papelera Metálica Antivandálica', brand: 'SecureWaste', model: 'SW-500', price: 2100 },
    { name: 'Contenedor Orgánico Compostero', brand: 'GreenWaste', model: 'GW-250', price: 3200 },
    { name: 'Basurero Solar Compactador', brand: 'SolarTech', model: 'ST-1000', price: 15000 },
  ],
  'Mesas': [
    { name: 'Mesa Picnic Familiar de Madera', brand: 'WoodCraft', model: 'WC-PIC8', price: 4500 },
    { name: 'Mesa de Ajedrez con Bancos', brand: 'GameFurn', model: 'GF-CHE', price: 3800 },
    { name: 'Mesa Metálica Circular', brand: 'MetalPark', model: 'MP-CIR150', price: 3200 },
    { name: 'Mesa de Concreto Reforzado', brand: 'ConcretePro', model: 'CP-HEA200', price: 5500 },
  ],

  // Equipamiento Deportivo (ID: 2)
  'Aparatos de Ejercicio': [
    { name: 'Elíptica al Aire Libre', brand: 'FitOutdoor', model: 'FO-ELI300', price: 12000 },
    { name: 'Barras Paralelas Fitness', brand: 'StreetGym', model: 'SG-PAR200', price: 8500 },
    { name: 'Máquina de Remo Exterior', brand: 'AquaFit', model: 'AF-ROW150', price: 15000 },
    { name: 'Bicicleta Estática Exterior', brand: 'CyclePark', model: 'CP-STA250', price: 18000 },
  ],
  'Canchas y Campos': [
    { name: 'Cancha de Básquetbol Profesional', brand: 'SportCourt', model: 'SC-BAS500', price: 180000 },
    { name: 'Campo de Fútbol 7 Sintético', brand: 'SyntheticFields', model: 'SF-FUT700', price: 350000 },
    { name: 'Cancha de Tenis de Polvo de Ladrillo', brand: 'ClayTennis', model: 'CT-PRO400', price: 280000 },
    { name: 'Área de Voleibol de Playa', brand: 'BeachSports', model: 'BS-VOL300', price: 85000 },
  ],
  'Equipo de Atletismo': [
    { name: 'Pista de Tartán 400m', brand: 'TrackMaster', model: 'TM-400PRO', price: 950000 },
    { name: 'Saltómetro de Altura Profesional', brand: 'JumpTech', model: 'JT-HIG200', price: 25000 },
    { name: 'Área de Lanzamiento de Peso', brand: 'ThrowZone', model: 'TZ-SHO150', price: 45000 },
    { name: 'Vallas de Atletismo Set 10 Piezas', brand: 'HurdlePro', model: 'HP-SET10', price: 18000 },
  ],

  // Juegos Infantiles (ID: 3)
  'Juegos Infantiles': [
    { name: 'Resbaladilla Gigante Multicolor', brand: 'PlayZone', model: 'PZ-SLI500', price: 45000 },
    { name: 'Columpio Doble con Cadenas', brand: 'SwingTime', model: 'ST-DOU200', price: 12000 },
    { name: 'Casa de Juegos Temática Pirata', brand: 'AdventurePlay', model: 'AP-PIR300', price: 85000 },
    { name: 'Sube y Baja Balanceado', brand: 'TeeterTot', model: 'TT-BAL150', price: 8500 },
    { name: 'Juego Integrado Multifuncional', brand: 'MultiPlay', model: 'MP-INT1000', price: 125000 },
    { name: 'Arenero con Banca Perimetral', brand: 'SandBox', model: 'SB-PER250', price: 15000 },
  ],

  // Infraestructura (ID: 4)
  'Caminos y Senderos': [
    { name: 'Sendero Adoquinado 100m', brand: 'PathWay', model: 'PW-ADO100', price: 85000 },
    { name: 'Camino de Grava Decorativa', brand: 'GravelPro', model: 'GP-DEC200', price: 35000 },
    { name: 'Andador de Concreto Estampado', brand: 'StampCrete', model: 'SC-WAL300', price: 120000 },
    { name: 'Sendero Ecológico de Madera', brand: 'EcoWalk', model: 'EW-WOO150', price: 95000 },
  ],
  'Edificaciones': [
    { name: 'Kiosco Informativo Central', brand: 'InfoStruct', model: 'IS-KIO500', price: 180000 },
    { name: 'Baños Públicos Modernos', brand: 'PublicFacil', model: 'PF-BAT300', price: 350000 },
    { name: 'Cafetería Modular', brand: 'ModuCafe', model: 'MC-CAF200', price: 450000 },
    { name: 'Oficina Administrativa', brand: 'AdminBuild', model: 'AB-OFF400', price: 280000 },
  ],
  'Puentes y Pasos': [
    { name: 'Puente Peatonal de Madera', brand: 'BridgeWood', model: 'BW-PED100', price: 125000 },
    { name: 'Paso Elevado Metálico', brand: 'MetalBridge', model: 'MB-ELE200', price: 380000 },
    { name: 'Puente Colgante Decorativo', brand: 'SuspendBridge', model: 'SB-DEC150', price: 650000 },
  ],

  // Tecnología (ID: 5)
  'Conectividad': [
    { name: 'Punto WiFi Exterior 300Mbps', brand: 'ConnectPark', model: 'CP-WIF300', price: 8500 },
    { name: 'Estación de Carga USB Solar', brand: 'SolarCharge', model: 'SC-USB4', price: 15000 },
    { name: 'Torre de Comunicaciones 5G', brand: 'CommTower', model: 'CT-5G200', price: 850000 },
  ],
  'Sistemas de Seguridad': [
    { name: 'Cámara de Vigilancia 4K', brand: 'SecureCam', model: 'SC-4K360', price: 12000 },
    { name: 'Sistema de Alarmas Perimetral', brand: 'AlarmPro', model: 'AP-PER500', price: 45000 },
    { name: 'Botón de Emergencia SOS', brand: 'EmergencyTech', model: 'ET-SOS100', price: 8500 },
  ],
  'Iluminación Inteligente': [
    { name: 'Poste LED Solar Inteligente', brand: 'SmartLight', model: 'SL-SOL200', price: 25000 },
    { name: 'Reflector LED con Sensor', brand: 'AutoLight', model: 'AL-SEN300', price: 8500 },
    { name: 'Sistema de Iluminación RGB', brand: 'ColorLight', model: 'CL-RGB150', price: 35000 },
  ],

  // Herramientas (ID: 6)
  'Herramientas': [
    { name: 'Podadora de Césped Profesional', brand: 'GrassCut', model: 'GC-PRO500', price: 25000 },
    { name: 'Sopladora de Hojas Industrial', brand: 'LeafBlower', model: 'LB-IND300', price: 18000 },
    { name: 'Cortasetos Eléctrico', brand: 'HedgeTrim', model: 'HT-ELE200', price: 8500 },
    { name: 'Motosierra de Poda', brand: 'TreeCut', model: 'TC-PRU150', price: 15000 },
  ],

  // Vehículos (ID: 7)
  'Vehículos': [
    { name: 'Carrito de Golf Eléctrico', brand: 'GolfMobile', model: 'GM-ELE400', price: 180000 },
    { name: 'Bicicleta de Patrullaje', brand: 'PatrolBike', model: 'PB-MOU200', price: 12000 },
    { name: 'Motocicleta de Seguridad', brand: 'SecurityMoto', model: 'SM-PAT500', price: 85000 },
    { name: 'Camioneta de Mantenimiento', brand: 'WorkTruck', model: 'WT-MAN300', price: 350000 },
  ],

  // Iluminación (ID: 8)
  'Bolardo Iluminado': [
    { name: 'Bolardo LED Cilíndrico', brand: 'LightBollard', model: 'LB-CIL100', price: 4500 },
    { name: 'Bolardo Solar Decorativo', brand: 'SolarBollard', model: 'SB-DEC150', price: 6500 },
    { name: 'Bolardo Inteligente con Sensor', brand: 'SmartBollard', model: 'SB-SEN200', price: 8500 },
  ],
  'Iluminación': [
    { name: 'Poste de Luz Clásico 4m', brand: 'ClassicLight', model: 'CL-CLA400', price: 15000 },
    { name: 'Farola Vintage de Hierro', brand: 'VintageIron', model: 'VI-FAR300', price: 18000 },
    { name: 'Luminaria Deportiva LED', brand: 'SportLight', model: 'SL-SPO1000', price: 35000 },
  ],

  // Señalización (ID: 9)
  'Señalización': [
    { name: 'Señal Informativa Grande', brand: 'InfoSign', model: 'IS-GRA200', price: 4500 },
    { name: 'Placa Conmemorativa Bronce', brand: 'Memorial', model: 'ME-BRO150', price: 8500 },
    { name: 'Directorio Interactivo Digital', brand: 'DigitalDir', model: 'DD-INT500', price: 45000 },
    { name: 'Señal de Seguridad Reflectiva', brand: 'SafeSign', model: 'SS-REF100', price: 2800 },
  ],

  // Sistemas de Riego (ID: 10)
  'Sistemas de Riego': [
    { name: 'Aspersor Rotativo de Alta Presión', brand: 'SprayTech', model: 'ST-ROT500', price: 8500 },
    { name: 'Sistema de Riego por Goteo', brand: 'DripSystem', model: 'DS-GOT300', price: 15000 },
    { name: 'Controlador de Riego Inteligente', brand: 'SmartIrrigation', model: 'SI-CON200', price: 25000 },
    { name: 'Bomba de Agua Sumergible', brand: 'AquaPump', model: 'AP-SUM1000', price: 35000 },
  ]
};

// Estados de conservación
const conservationStates = ['Excelente', 'Bueno', 'Regular', 'Malo', 'Crítico'];

// Proveedores ficticios
const suppliers = [
  'Equipamiento Urbano SA de CV',
  'Mobiliario y Espacios México',
  'Tecnología para Parques',
  'Constructora Verde',
  'Suministros Municipales',
  'EcoEquipamiento',
  'Soluciones Urbanas Integrales',
  'Parques y Jardines Supply'
];

// Ubicaciones específicas dentro de parques
const parkLocations = [
  'Entrada Principal', 'Zona Central', 'Área de Juegos', 'Zona Deportiva',
  'Sendero Norte', 'Sendero Sur', 'Plaza Central', 'Jardín Botánico',
  'Área de Picnic', 'Zona de Descanso', 'Mirador', 'Estacionamiento',
  'Área Administrativa', 'Zona de Mantenimiento', 'Kiosco', 'Fuente'
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateAssetCode(categoryName: string, index: number): string {
  const prefix = categoryName.substring(0, 3).toUpperCase();
  return `${prefix}-${(index + 1).toString().padStart(4, '0')}`;
}

export async function addSampleAssets() {
  try {
    console.log('🏗️ Iniciando creación de 100 activos ficticios...');

    // Obtener categorías y parques existentes
    const categories = await db.select().from(assetCategories);
    const parksList = await db.select().from(parks);

    console.log(`📊 Encontradas ${categories.length} categorías y ${parksList.length} parques`);

    const assetsToInsert = [];
    let assetCounter = 0;

    // Generar activos para cada categoría
    for (const category of categories) {
      const categoryAssets = assetData[category.name as keyof typeof assetData];
      
      if (categoryAssets && assetCounter < 100) {
        for (const assetTemplate of categoryAssets) {
          if (assetCounter >= 100) break;

          // Seleccionar parque aleatorio
          const randomPark = getRandomItem(parksList);
          
          // Generar datos aleatorios
          const purchaseDate = getRandomDate(new Date(2020, 0, 1), new Date(2024, 11, 31));
          const warrantyMonths = Math.floor(Math.random() * 36) + 12; // 12-48 meses
          const warrantyEnd = new Date(purchaseDate);
          warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyMonths);

          const asset = {
            name: assetTemplate.name,
            description: `${assetTemplate.name} instalado en ${randomPark.name}. Equipo de alta calidad para uso en espacios públicos.`,
            serialNumber: `SN${Date.now()}${Math.floor(Math.random() * 1000)}`,
            categoryId: category.id,
            parkId: randomPark.id,
            locationDescription: `${randomPark.name} - ${getRandomItem(parkLocations)}`,
            latitude: (20.6736 + (Math.random() - 0.5) * 0.1).toString(),
            longitude: (-103.3440 + (Math.random() - 0.5) * 0.1).toString(),
            acquisitionDate: purchaseDate.toISOString().split('T')[0],
            acquisitionCost: (assetTemplate.price + (Math.random() * 1000 - 500)).toString(),
            currentValue: (assetTemplate.price * (0.6 + Math.random() * 0.3)).toString(),
            manufacturer: assetTemplate.brand,
            model: assetTemplate.model,
            status: getRandomItem(['active', 'maintenance']),
            condition: getRandomItem(['excellent', 'good', 'fair']),
            maintenanceFrequency: getRandomItem(['weekly', 'monthly', 'quarterly']),
            notes: `Activo adquirido para mejora de servicios en ${randomPark.name}. Material: ${getRandomItem(['Acero inoxidable', 'Aluminio', 'Madera tratada', 'Plástico reciclado'])}`
          };

          assetsToInsert.push(asset);
          assetCounter++;
        }
      }
    }

    // Completar hasta 100 activos si es necesario
    while (assetCounter < 100) {
      const randomCategory = getRandomItem(categories);
      const randomPark = getRandomItem(parksList);
      const purchaseDate = getRandomDate(new Date(2020, 0, 1), new Date(2024, 11, 31));

      const asset = {
        name: `Activo Genérico ${assetCounter + 1}`,
        description: `Activo de la categoría ${randomCategory.name} ubicado en ${randomPark.name}`,
        serialNumber: `SN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        categoryId: randomCategory.id,
        parkId: randomPark.id,
        locationDescription: `${randomPark.name} - ${getRandomItem(parkLocations)}`,
        latitude: (20.6736 + (Math.random() - 0.5) * 0.1).toString(),
        longitude: (-103.3440 + (Math.random() - 0.5) * 0.1).toString(),
        acquisitionDate: purchaseDate.toISOString().split('T')[0],
        acquisitionCost: (Math.floor(Math.random() * 50000) + 5000).toString(),
        currentValue: (Math.floor(Math.random() * 40000) + 3000).toString(),
        manufacturer: getRandomItem(['GenericBrand', 'StandardEquip', 'UrbanSolutions']),
        model: `GEN-${Math.floor(Math.random() * 1000)}`,
        status: getRandomItem(['active', 'maintenance', 'damaged']),
        condition: getRandomItem(['excellent', 'good', 'fair', 'poor']),
        maintenanceFrequency: getRandomItem(['monthly', 'quarterly', 'yearly']),
        notes: `Activo estándar para ${randomPark.name}. Material: ${getRandomItem(['Metal', 'Plástico', 'Madera', 'Concreto'])}`
      };

      assetsToInsert.push(asset);
      assetCounter++;
    }

    // Insertar todos los activos
    console.log(`💾 Insertando ${assetsToInsert.length} activos en la base de datos...`);
    
    for (const asset of assetsToInsert) {
      await db.insert(assets).values(asset);
    }

    console.log('✅ 100 activos ficticios creados exitosamente');
    console.log(`📊 Distribución por parques: ${parksList.length} parques`);
    console.log(`📊 Distribución por categorías: ${categories.length} categorías`);

    return { success: true, created: assetsToInsert.length };

  } catch (error) {
    console.error('❌ Error al crear activos ficticios:', error);
    throw error;
  }
}