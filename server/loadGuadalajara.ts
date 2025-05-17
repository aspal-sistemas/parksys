import { db } from "./db";
import { 
  municipalities, parks, parkImages, amenities, parkAmenities, activities, documents,
  DEFAULT_AMENITIES
} from "@shared/schema";
import { and, eq } from "drizzle-orm";

async function loadGuadalajaraData() {
  try {
    console.log('Iniciando carga de datos para Guadalajara, Jalisco...');
    
    // 1. Crear municipio de Guadalajara si no existe
    let guadalajara;
    const existingGuadalajara = await db.select().from(municipalities).where(eq(municipalities.name, 'Guadalajara'));
    
    if (existingGuadalajara.length === 0) {
      [guadalajara] = await db.insert(municipalities).values({
        name: 'Guadalajara',
        state: 'Jalisco',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Coat_of_arms_of_Guadalajara.svg/1200px-Coat_of_arms_of_Guadalajara.svg.png',
        active: true
      }).returning();
      console.log('Municipio de Guadalajara creado:', guadalajara);
    } else {
      guadalajara = existingGuadalajara[0];
      console.log('El municipio de Guadalajara ya existe en la base de datos:', guadalajara);
    }
    
    // 2. Verificar si ya existen parques en Guadalajara
    const existingParks = await db.select().from(parks).where(eq(parks.municipalityId, guadalajara.id));
    console.log(`Parques existentes en Guadalajara: ${existingParks.length}`);
    
    // 3. Definir parques para cargar
    const guadalajaraParks = [
      {
        name: 'Parque Metropolitano de Guadalajara',
        description: 'El Parque Metropolitano de Guadalajara es el pulmón verde más importante de la ciudad, con más de 186 hectáreas de extensión. Ofrece amplias áreas verdes, senderos para caminar y correr, instalaciones deportivas, lagos artificiales y zonas de picnic.',
        parkType: 'metropolitano',
        address: 'Av. Beethoven 5800, La Estancia, 45030 Zapopan, Jal.',
        postalCode: '45030',
        latitude: '20.7128',
        longitude: '-103.4011',
        area: '186.0',
        foundationYear: 1992,
        administrator: 'Gobierno del Estado de Jalisco',
        conservationStatus: 'Bueno',
        regulationUrl: 'https://www.jalisco.gob.mx/sites/default/files/reglamento_parque_metropolitano.pdf',
        openingHours: 'Lunes a Domingo: 6:00 - 20:00',
        contactEmail: 'contacto@parquemetropolitano.com.mx',
        contactPhone: '33 3673 5252',
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Parque_Metropolitano_Guadalajara_2.jpg',
            caption: 'Vista panorámica del Parque Metropolitano',
            isPrimary: true
          },
          {
            imageUrl: 'https://www.jalisco.gob.mx/sites/default/files/noticias/metropolitan_park.jpg',
            caption: 'Lago artificial del parque',
            isPrimary: false
          }
        ],
        amenityIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        activities: [
          {
            title: 'Yoga al Aire Libre',
            description: 'Sesiones gratuitas de yoga para todos los niveles',
            startDate: new Date('2025-05-30T08:00:00'),
            endDate: new Date('2025-05-30T09:30:00'),
            category: 'Bienestar',
            location: 'Plaza central'
          },
          {
            title: 'Carrera 5K Metropolitana',
            description: 'Carrera recreativa para todas las edades',
            startDate: new Date('2025-06-15T07:00:00'),
            endDate: new Date('2025-06-15T10:00:00'),
            category: 'Deportes',
            location: 'Circuito principal'
          }
        ],
        documents: [
          {
            title: 'Mapa de Instalaciones',
            fileUrl: 'https://www.parquemetropolitano.com.mx/docs/mapa.pdf',
            fileSize: '2.5 MB',
            fileType: 'application/pdf'
          }
        ]
      },
      {
        name: 'Parque Agua Azul',
        description: 'Parque histórico de Guadalajara con jardines botánicos, una mariposario, una orquideario, un aviario y diversos espacios culturales. Es uno de los parques más antiguos y emblemáticos de la ciudad.',
        parkType: 'metropolitano',
        address: 'Calz. Independencia Sur 973, Centro, 44100 Guadalajara, Jal.',
        postalCode: '44100',
        latitude: '20.6653',
        longitude: '-103.3507',
        area: '16.8',
        foundationYear: 1952,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Bueno',
        regulationUrl: 'https://guadalajara.gob.mx/reglamentos/parqueaguaazul.pdf',
        openingHours: 'Martes a Domingo: 10:00 - 18:00',
        contactEmail: 'parqueaguaazul@guadalajara.gob.mx',
        contactPhone: '33 3619 0328',
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Parque_Agua_Azul_GDL.jpg/1200px-Parque_Agua_Azul_GDL.jpg',
            caption: 'Casa de la cultura del Parque Agua Azul',
            isPrimary: true
          }
        ],
        amenityIds: [1, 2, 6, 7, 8, 9],
        activities: [
          {
            title: 'Exposición de Orquídeas',
            description: 'Exposición anual de orquídeas con ejemplares de todo México',
            startDate: new Date('2025-05-20T10:00:00'),
            endDate: new Date('2025-05-22T18:00:00'),
            category: 'Cultural',
            location: 'Orquideario'
          }
        ],
        documents: []
      },
      {
        name: 'Parque Alcalde',
        description: 'Parque tradicional de Guadalajara con canchas deportivas, juegos infantiles y abundante vegetación. Popular entre familias y deportistas.',
        parkType: 'barrial',
        address: 'Av. Alcalde y Av. Ávila Camacho, Alcalde Barranquitas, Guadalajara, Jal.',
        postalCode: '44270',
        latitude: '20.7030',
        longitude: '-103.3440',
        area: '25.5',
        foundationYear: 1959,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Regular',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 5:00 - 21:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3658 1234',
        images: [
          {
            imageUrl: 'https://www.jalisco.gob.mx/sites/default/files/parque_alcalde.jpg',
            caption: 'Áreas verdes del Parque Alcalde',
            isPrimary: true
          }
        ],
        amenityIds: [1, 2, 3, 6],
        activities: [],
        documents: []
      },
      {
        name: 'Parque Colomos',
        description: 'El Bosque Los Colomos es un área natural protegida y uno de los pulmones más importantes de la zona metropolitana de Guadalajara. Cuenta con extensas áreas boscosas, senderos, un jardín japonés, cascadas y áreas de descanso.',
        parkType: 'ecologico',
        address: 'Av. Patria y Av. Acueducto, Colonia Colomos, Guadalajara, Jal.',
        postalCode: '44660',
        latitude: '20.7036',
        longitude: '-103.3978',
        area: '92.0',
        foundationYear: 1967,
        administrator: 'Patronato Bosque Los Colomos',
        conservationStatus: 'Bueno',
        regulationUrl: 'https://bosqueloscolomos.org/reglamento.pdf',
        openingHours: 'Martes a Domingo: 6:00 - 19:00',
        contactEmail: 'contacto@bosqueloscolomos.org',
        contactPhone: '33 3641 3804',
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Jardin_Japones_Colomos.jpg',
            caption: 'Jardín Japonés en Colomos',
            isPrimary: true
          }
        ],
        amenityIds: [1, 6, 7, 8],
        activities: [
          {
            title: 'Recorrido Ecológico Guiado',
            description: 'Recorrido educativo sobre flora y fauna del bosque',
            startDate: new Date('2025-06-04T09:00:00'),
            endDate: new Date('2025-06-04T11:00:00'),
            category: 'Educativo',
            location: 'Entrada principal'
          }
        ],
        documents: []
      },
      {
        name: 'Parque Mirador Independencia',
        description: 'También conocido como Parque Mirador Huentitán, ofrece vistas espectaculares de la Barranca de Huentitán y el Río Santiago. Es ideal para observar atardeceres y realizar actividades al aire libre.',
        parkType: 'ecologico',
        address: 'Calzada Independencia Norte, Huentitán El Alto, Guadalajara, Jal.',
        postalCode: '44390',
        latitude: '20.7529',
        longitude: '-103.3126',
        area: '28.0',
        foundationYear: 1964,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Regular',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 8:00 - 19:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3668 5599',
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Barranca_de_Huentitan.jpg/1200px-Barranca_de_Huentitan.jpg',
            caption: 'Vista panorámica desde el Mirador',
            isPrimary: true
          }
        ],
        amenityIds: [6, 7, 8, 9],
        activities: [],
        documents: []
      },
      {
        name: 'Parque Gonzalez Gallo',
        description: 'Parque urbano ubicado donde anteriormente estaba el Aeropuerto Internacional de Guadalajara. Cuenta con un lago, extensas áreas verdes, canchas deportivas y juegos infantiles.',
        parkType: 'metropolitano',
        address: 'Av. de la Solidaridad Iberoamericana, El Dean, Guadalajara, Jal.',
        postalCode: '44170',
        latitude: '20.6435',
        longitude: '-103.3197',
        area: '35.0',
        foundationYear: 1992,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Bueno',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 6:00 - 20:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3619 0909',
        images: [
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/parque_gonzalez_gallo.jpg',
            caption: 'Panorámica del Parque González Gallo',
            isPrimary: true
          }
        ],
        amenityIds: [1, 2, 3, 6, 7, 8, 9],
        activities: [],
        documents: []
      },
      {
        name: 'Parque de la Solidaridad',
        description: 'Uno de los parques más grandes de la zona metropolitana, con áreas recreativas, culturales y deportivas. Cuenta con un lago artificial, zonas de picnic y juegos infantiles.',
        parkType: 'metropolitano',
        address: 'Av. Malecón y Av. Patria, Infonavit Estadio, Guadalajara, Jal.',
        postalCode: '44220',
        latitude: '20.6825',
        longitude: '-103.2812',
        area: '110.0',
        foundationYear: 1989,
        administrator: 'Gobierno del Estado de Jalisco',
        conservationStatus: 'Regular',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 6:00 - 20:00',
        contactEmail: 'parquesolidaridad@jalisco.gob.mx',
        contactPhone: '33 3603 7741',
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Parque_Solidaridad_GDL.jpg/1200px-Parque_Solidaridad_GDL.jpg',
            caption: 'Lago artificial del Parque Solidaridad',
            isPrimary: true
          }
        ],
        amenityIds: [1, 2, 3, 4, 6, 7, 8, 9],
        activities: [
          {
            title: 'Feria Artesanal',
            description: 'Exposición y venta de productos artesanales de Jalisco',
            startDate: new Date('2025-08-12T10:00:00'),
            endDate: new Date('2025-08-13T19:00:00'),
            category: 'Cultural',
            location: 'Explanada principal'
          }
        ],
        documents: []
      },
      {
        name: 'Parque Morelos',
        description: 'Parque histórico en el centro de Guadalajara, remodelado recientemente. Cuenta con áreas verdes, fuentes, monumentos y espacios recreativos.',
        parkType: 'barrial',
        address: 'Calz. Independencia Sur y San Diego, Centro, Guadalajara, Jal.',
        postalCode: '44100',
        latitude: '20.6798',
        longitude: '-103.3398',
        area: '3.7',
        foundationYear: 1910,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Bueno',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 6:00 - 20:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3613 7744',
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Parque_Morelos_GDL.jpg/1200px-Parque_Morelos_GDL.jpg',
            caption: 'Kiosco del Parque Morelos',
            isPrimary: true
          }
        ],
        amenityIds: [1, 2, 6, 7],
        activities: [],
        documents: []
      },
      {
        name: 'Parque Natural Huentitán',
        description: 'Extenso parque natural que forma parte de la Barranca de Huentitán. Ofrece impresionantes vistas, senderos para caminata y ciclismo de montaña, y áreas de descanso.',
        parkType: 'ecologico',
        address: 'Calzada Independencia Norte, Huentitán El Alto, Guadalajara, Jal.',
        postalCode: '44390',
        latitude: '20.7475',
        longitude: '-103.3051',
        area: '156.0',
        foundationYear: 1975,
        administrator: 'Gobierno del Estado de Jalisco',
        conservationStatus: 'Regular',
        regulationUrl: '',
        openingHours: 'Martes a Domingo: 8:00 - 18:00',
        contactEmail: 'parquenatural@jalisco.gob.mx',
        contactPhone: '33 3669 7845',
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Barranca_de_Huentitan_2.jpg/1200px-Barranca_de_Huentitan_2.jpg',
            caption: 'Senderos de la Barranca de Huentitán',
            isPrimary: true
          }
        ],
        amenityIds: [6, 7],
        activities: [],
        documents: []
      },
      {
        name: 'Parque Revolución',
        description: 'Parque urbano con áreas verdes, monumentos históricos y espacios recreativos. Se encuentra en una de las zonas más tradicionales de la ciudad.',
        parkType: 'barrial',
        address: 'Av. Juárez y Enrique Díaz de León, Americana, Guadalajara, Jal.',
        postalCode: '44160',
        latitude: '20.6747',
        longitude: '-103.3562',
        area: '2.9',
        foundationYear: 1910,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Bueno',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 6:00 - 20:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3613 5522',
        images: [
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/parque_revolucion.jpg',
            caption: 'Monumento en el Parque Revolución',
            isPrimary: true
          }
        ],
        amenityIds: [1, 2, 6],
        activities: [],
        documents: []
      }
    ];
    
    // 4. Asegurar que las amenidades existan
    const existingAmenities = await db.select().from(amenities);
    if (existingAmenities.length === 0) {
      console.log('Creando amenidades...');
      await db.insert(amenities).values(DEFAULT_AMENITIES);
    }
    
    // 5. Iterar a través de los parques y crearlos
    let createdCount = 0;
    
    for (const parkData of guadalajaraParks) {
      const { images, amenityIds, activities: parkActivities, documents: parkDocuments, ...parkInfo } = parkData;
      
      // Verificar si el parque ya existe
      const existingPark = await db.select().from(parks).where(
        and(
          eq(parks.name, parkInfo.name),
          eq(parks.municipalityId, guadalajara.id)
        )
      );
      
      let park;
      if (existingPark.length === 0) {
        // Crear el parque
        [park] = await db.insert(parks).values({
          ...parkInfo,
          municipalityId: guadalajara.id
        }).returning();
        
        console.log(`Parque creado: ${park.name}`);
        createdCount++;
        
        // Agregar imágenes
        if (images && images.length > 0) {
          for (const imageData of images) {
            await db.insert(parkImages).values({
              parkId: park.id,
              imageUrl: imageData.imageUrl,
              caption: imageData.caption || null,
              isPrimary: imageData.isPrimary
            });
          }
          console.log(`Agregadas ${images.length} imágenes a ${park.name}`);
        }
        
        // Agregar amenidades
        if (amenityIds && amenityIds.length > 0) {
          for (const amenityId of amenityIds) {
            await db.insert(parkAmenities).values({
              parkId: park.id,
              amenityId
            });
          }
          console.log(`Agregadas ${amenityIds.length} amenidades a ${park.name}`);
        }
        
        // Agregar actividades
        if (parkActivities && parkActivities.length > 0) {
          for (const activity of parkActivities) {
            await db.insert(activities).values({
              parkId: park.id,
              title: activity.title,
              description: activity.description || null,
              startDate: activity.startDate,
              endDate: activity.endDate || null,
              category: activity.category || null,
              location: activity.location || null
            });
          }
          console.log(`Agregadas ${parkActivities.length} actividades a ${park.name}`);
        }
        
        // Agregar documentos
        if (parkDocuments && parkDocuments.length > 0) {
          for (const document of parkDocuments) {
            await db.insert(documents).values({
              parkId: park.id,
              title: document.title,
              fileUrl: document.fileUrl,
              fileSize: document.fileSize || null,
              fileType: document.fileType || null
            });
          }
          console.log(`Agregados ${parkDocuments.length} documentos a ${park.name}`);
        }
      } else {
        console.log(`El parque ${parkInfo.name} ya existe`);
      }
    }
    
    console.log(`Carga finalizada: ${createdCount} parques nuevos creados para Guadalajara`);
    return { success: true, message: `Datos cargados: ${createdCount} parques nuevos para Guadalajara` };
  } catch (error) {
    console.error('Error al cargar datos:', error);
    return { success: false, error };
  }
}

// Ejecutar la función inmediatamente
loadGuadalajaraData()
  .then(result => {
    console.log('Resultado:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

export default loadGuadalajaraData;