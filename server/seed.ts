import { db } from "./db";
import { 
  users, municipalities, parks, amenities, parkAmenities, activities, parkImages, documents,
  DEFAULT_AMENITIES, type InsertPark, type InsertParkImage, type InsertActivity, type InsertDocument
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * Carga datos específicos para Guadalajara, Jalisco
 */
async function seedGuadalajaraData() {
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
    } else {
      guadalajara = existingGuadalajara[0];
      console.log('El municipio de Guadalajara ya existe en la base de datos.');
    }
    
    console.log(`Municipio: ${guadalajara.name}, ID: ${guadalajara.id}`);
    
    // 2. Crear usuario administrador para Guadalajara si no existe
    const existingUsers = await db.select().from(users).where(eq(users.username, "guadalajara"));
    
    if (existingUsers.length === 0) {
      console.log("Creando usuario administrador para Guadalajara...");
      
      await db.insert(users).values({
        username: "guadalajara",
        password: "parks123", // En producción usar bcrypt
        email: "admin@guadalajara.gob.mx",
        role: "admin",
        municipalityId: guadalajara.id,
        fullName: "Admin Guadalajara"
      });
      
      console.log("Usuario administrador para Guadalajara creado correctamente.");
    }
    
    // 3. Verificar si ya existen parques en Guadalajara
    const existingParks = await db.select().from(parks).where(eq(parks.municipalityId, guadalajara.id));
    
    if (existingParks.length >= 15) {
      console.log(`Ya existen ${existingParks.length} parques para Guadalajara en la base de datos.`);
      return { success: true, message: 'Los datos de Guadalajara ya estaban cargados', municipalityId: guadalajara.id };
    }
    
    // 4. Definir los 15 parques para Guadalajara
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
        amenities: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15],
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
        activities: [
          {
            title: 'Yoga al Aire Libre',
            description: 'Sesiones gratuitas de yoga para todos los niveles',
            startDate: new Date('2023-05-30T08:00:00'),
            endDate: new Date('2023-05-30T09:30:00'),
            category: 'Bienestar',
            location: 'Plaza central'
          },
          {
            title: 'Carrera 5K Metropolitana',
            description: 'Carrera recreativa para todas las edades',
            startDate: new Date('2023-06-15T07:00:00'),
            endDate: new Date('2023-06-15T10:00:00'),
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
        amenities: [1, 2, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Parque_Agua_Azul_GDL.jpg/1200px-Parque_Agua_Azul_GDL.jpg',
            caption: 'Casa de la cultura del Parque Agua Azul',
            isPrimary: true
          },
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/mariposarioAguaAzul.jpg',
            caption: 'Mariposario',
            isPrimary: false
          }
        ],
        activities: [
          {
            title: 'Exposición de Orquídeas',
            description: 'Exposición anual de orquídeas con ejemplares de todo México',
            startDate: new Date('2023-05-20T10:00:00'),
            endDate: new Date('2023-05-22T18:00:00'),
            category: 'Cultural',
            location: 'Orquideario'
          }
        ],
        documents: [
          {
            title: 'Historia del Parque Agua Azul',
            fileUrl: 'https://cultura.guadalajara.gob.mx/sites/default/files/historia_parque_agua_azul.pdf',
            fileSize: '3.1 MB',
            fileType: 'application/pdf'
          }
        ]
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
        regulationUrl: 'https://guadalajara.gob.mx/reglamentos/parques/alcalde.pdf',
        openingHours: 'Lunes a Domingo: 5:00 - 21:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3658 1234',
        amenities: [1, 2, 3, 6, 7, 8, 9, 12, 13],
        images: [
          {
            imageUrl: 'https://www.jalisco.gob.mx/sites/default/files/parque_alcalde.jpg',
            caption: 'Áreas verdes del Parque Alcalde',
            isPrimary: true
          }
        ],
        activities: [
          {
            title: 'Torneo de Basquetbol',
            description: 'Torneo de verano para jóvenes entre 15 y 18 años',
            startDate: new Date('2023-07-05T16:00:00'),
            endDate: new Date('2023-07-25T20:00:00'),
            category: 'Deportes',
            location: 'Canchas de baloncesto'
          }
        ],
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
        amenities: [1, 6, 7, 8, 9, 10, 12, 13],
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Jardin_Japones_Colomos.jpg',
            caption: 'Jardín Japonés en Colomos',
            isPrimary: true
          },
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/cascadaColomos.jpg',
            caption: 'Cascada en Bosque Colomos',
            isPrimary: false
          }
        ],
        activities: [
          {
            title: 'Recorrido Ecológico Guiado',
            description: 'Recorrido educativo sobre flora y fauna del bosque',
            startDate: new Date('2023-06-04T09:00:00'),
            endDate: new Date('2023-06-04T11:00:00'),
            category: 'Educativo',
            location: 'Entrada principal'
          }
        ],
        documents: [
          {
            title: 'Guía de Flora y Fauna',
            fileUrl: 'https://bosqueloscolomos.org/docs/guia_flora_fauna.pdf',
            fileSize: '5.2 MB',
            fileType: 'application/pdf'
          }
        ]
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
        regulationUrl: 'https://guadalajara.gob.mx/reglamentos/mirador.pdf',
        openingHours: 'Lunes a Domingo: 8:00 - 19:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3668 5599',
        amenities: [6, 7, 8, 9, 12, 13],
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Barranca_de_Huentitan.jpg/1200px-Barranca_de_Huentitan.jpg',
            caption: 'Vista panorámica desde el Mirador',
            isPrimary: true
          }
        ],
        activities: [
          {
            title: 'Observación de Aves',
            description: 'Actividad guiada para identificar especies locales de aves',
            startDate: new Date('2023-06-10T07:00:00'),
            endDate: new Date('2023-06-10T10:00:00'),
            category: 'Naturaleza',
            location: 'Mirador principal'
          }
        ],
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
        regulationUrl: 'https://guadalajara.gob.mx/reglamentos/parque_gonzalez_gallo.pdf',
        openingHours: 'Lunes a Domingo: 6:00 - 20:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3619 0909',
        amenities: [1, 2, 3, 6, 7, 8, 9, 10, 12, 13, 14],
        images: [
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/parque_gonzalez_gallo.jpg',
            caption: 'Panorámica del Parque González Gallo',
            isPrimary: true
          }
        ],
        activities: [
          {
            title: 'Festival Deportivo Familiar',
            description: 'Actividades deportivas para todas las edades',
            startDate: new Date('2023-07-15T10:00:00'),
            endDate: new Date('2023-07-15T16:00:00'),
            category: 'Deportes',
            location: 'Áreas deportivas'
          }
        ],
        documents: []
      },
      {
        name: 'Parque San Rafael',
        description: 'Parque urbano con amplias áreas verdes, juegos infantiles y espacios para actividades recreativas. Es un importante espacio verde en esta zona de la ciudad.',
        parkType: 'barrial',
        address: 'Sierra Nevada, San Rafael, Guadalajara, Jal.',
        postalCode: '44760',
        latitude: '20.6775',
        longitude: '-103.3961',
        area: '5.8',
        foundationYear: 1980,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Regular',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 6:00 - 20:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3654 8877',
        amenities: [1, 2, 3, 6, 12, 13],
        images: [
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/parque_san_rafael.jpg',
            caption: 'Juegos infantiles Parque San Rafael',
            isPrimary: true
          }
        ],
        activities: [],
        documents: []
      },
      {
        name: 'Parque Arboledas del Sur',
        description: 'Parque vecinal con áreas verdes, juegos infantiles, canchas deportivas y senderos para caminar. Es un importante espacio recreativo para los habitantes de la zona sur de Guadalajara.',
        parkType: 'vecinal',
        address: 'Av. Cruz del Sur y Av. Arboledas, Arboledas del Sur, Guadalajara, Jal.',
        postalCode: '44980',
        latitude: '20.6189',
        longitude: '-103.4022',
        area: '4.2',
        foundationYear: 1985,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Bueno',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 7:00 - 19:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3145 6789',
        amenities: [1, 2, 3, 6, 7, 12, 13],
        images: [
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/parque_arboledas_sur.jpg',
            caption: 'Canchas deportivas del Parque Arboledas',
            isPrimary: true
          }
        ],
        activities: [],
        documents: []
      },
      {
        name: 'Parque de la Liberación',
        description: 'Parque urbano moderno que cuenta con áreas verdes, juegos infantiles, canchas de baloncesto y zonas para actividades recreativas.',
        parkType: 'barrial',
        address: 'Av. Patria y Av. Acueducto, Providencia, Guadalajara, Jal.',
        postalCode: '44670',
        latitude: '20.6933',
        longitude: '-103.3817',
        area: '7.5',
        foundationYear: 1995,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Bueno',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 6:00 - 20:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3641 7788',
        amenities: [1, 2, 3, 6, 7, 12, 13, 14],
        images: [
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/parque_liberacion.jpg',
            caption: 'Áreas verdes del Parque de la Liberación',
            isPrimary: true
          }
        ],
        activities: [],
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
        regulationUrl: 'https://guadalajara.gob.mx/reglamentos/parque_morelos.pdf',
        openingHours: 'Lunes a Domingo: 6:00 - 20:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3613 7744',
        amenities: [1, 2, 6, 7, 9, 10, 12, 13],
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Parque_Morelos_GDL.jpg/1200px-Parque_Morelos_GDL.jpg',
            caption: 'Kiosco del Parque Morelos',
            isPrimary: true
          }
        ],
        activities: [
          {
            title: 'Concierto Dominical',
            description: 'Presentación de la Banda Municipal de Guadalajara',
            startDate: new Date('2023-05-28T18:00:00'),
            endDate: new Date('2023-05-28T20:00:00'),
            category: 'Cultural',
            location: 'Kiosco central'
          }
        ],
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
        regulationUrl: 'https://jalisco.gob.mx/reglamentos/parque_natural_huentitan.pdf',
        openingHours: 'Martes a Domingo: 8:00 - 18:00',
        contactEmail: 'parquenatural@jalisco.gob.mx',
        contactPhone: '33 3669 7845',
        amenities: [6, 7, 12, 13],
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Barranca_de_Huentitan_2.jpg/1200px-Barranca_de_Huentitan_2.jpg',
            caption: 'Senderos de la Barranca de Huentitán',
            isPrimary: true
          }
        ],
        activities: [
          {
            title: 'Caminata Ecológica',
            description: 'Recorrido guiado por los senderos naturales',
            startDate: new Date('2023-06-17T09:00:00'),
            endDate: new Date('2023-06-17T12:00:00'),
            category: 'Naturaleza',
            location: 'Entrada principal'
          }
        ],
        documents: [
          {
            title: 'Mapa de Senderos',
            fileUrl: 'https://jalisco.gob.mx/docs/mapa_senderos_huentitan.pdf',
            fileSize: '1.8 MB',
            fileType: 'application/pdf'
          }
        ]
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
        amenities: [1, 2, 6, 7, 9, 12, 13, 14],
        images: [
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/parque_revolucion.jpg',
            caption: 'Monumento en el Parque Revolución',
            isPrimary: true
          }
        ],
        activities: [],
        documents: []
      },
      {
        name: 'Parque San Jacinto',
        description: 'Parque vecinal con áreas verdes, juegos infantiles y canchas deportivas. Es un importante punto de encuentro para los habitantes de la zona.',
        parkType: 'vecinal',
        address: 'Av. San Jacinto y Santa Eduwiges, San Andrés, Guadalajara, Jal.',
        postalCode: '44440',
        latitude: '20.6982',
        longitude: '-103.3027',
        area: '3.4',
        foundationYear: 1978,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Regular',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 7:00 - 19:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3603 4411',
        amenities: [1, 2, 3, 6, 12, 13],
        images: [
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/parque_san_jacinto.jpg',
            caption: 'Juegos infantiles Parque San Jacinto',
            isPrimary: true
          }
        ],
        activities: [],
        documents: []
      },
      {
        name: 'Parque Montenegro',
        description: 'Parque urbano con áreas verdes, juegos infantiles y amplios espacios para actividades recreativas. Ubicado en una zona residencial de la ciudad.',
        parkType: 'barrial',
        address: 'Montenegro y Lapizlázuli, Independencia, Guadalajara, Jal.',
        postalCode: '44240',
        latitude: '20.6975',
        longitude: '-103.3181',
        area: '4.1',
        foundationYear: 1982,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Regular',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 7:00 - 19:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3603 5544',
        amenities: [1, 2, 3, 6, 12, 13],
        images: [
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/parque_montenegro.jpg',
            caption: 'Áreas verdes del Parque Montenegro',
            isPrimary: true
          }
        ],
        activities: [],
        documents: []
      },
      {
        name: 'Parque El Dean',
        description: 'Parque vecinal con juegos infantiles, canchas deportivas y áreas verdes. Un espacio importante para la recreación de los habitantes de la colonia El Dean.',
        parkType: 'vecinal',
        address: 'Av. Río Nilo y Javier Mina, El Dean, Guadalajara, Jal.',
        postalCode: '44410',
        latitude: '20.6497',
        longitude: '-103.3095',
        area: '2.6',
        foundationYear: 1975,
        administrator: 'Ayuntamiento de Guadalajara',
        conservationStatus: 'Regular',
        regulationUrl: '',
        openingHours: 'Lunes a Domingo: 7:00 - 19:00',
        contactEmail: 'parques@guadalajara.gob.mx',
        contactPhone: '33 3619 6633',
        amenities: [1, 2, 3, 6, 12, 13],
        images: [
          {
            imageUrl: 'https://www.guadalajara.gob.mx/sites/default/files/styles/sliderviewmode/public/parque_el_dean.jpg',
            caption: 'Canchas deportivas Parque El Dean',
            isPrimary: true
          }
        ],
        activities: [],
        documents: []
      },
      {
        name: 'Parque Solidaridad',
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
        regulationUrl: 'https://jalisco.gob.mx/reglamentos/parque_solidaridad.pdf',
        openingHours: 'Lunes a Domingo: 6:00 - 20:00',
        contactEmail: 'parquesolidaridad@jalisco.gob.mx',
        contactPhone: '33 3603 7741',
        amenities: [1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15],
        images: [
          {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Parque_Solidaridad_GDL.jpg/1200px-Parque_Solidaridad_GDL.jpg',
            caption: 'Lago artificial del Parque Solidaridad',
            isPrimary: true
          }
        ],
        activities: [
          {
            title: 'Feria Artesanal',
            description: 'Exposición y venta de productos artesanales de Jalisco',
            startDate: new Date('2023-08-12T10:00:00'),
            endDate: new Date('2023-08-13T19:00:00'),
            category: 'Cultural',
            location: 'Explanada principal'
          }
        ],
        documents: []
      }
    ];
    
    // 5. Iterar para crear cada parque con sus relaciones
    for (const parkData of guadalajaraParks) {
      const { amenities: parkAmenities, images, activities, documents, ...parkInfo } = parkData;
      
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
        
        console.log(`Parque creado: ${park.name}, ID: ${park.id}`);
      } else {
        park = existingPark[0];
        console.log(`El parque ${park.name} ya existe en la base de datos.`);
      }
      
      // Agregar imágenes
      if (images && images.length > 0) {
        // Verificar si ya existen imágenes para este parque
        const existingImages = await db.select().from(parkImages).where(eq(parkImages.parkId, park.id));
        
        if (existingImages.length === 0) {
          for (const imageData of images) {
            await db.insert(parkImages).values({
              parkId: park.id,
              imageUrl: imageData.imageUrl,
              caption: imageData.caption || null,
              isPrimary: imageData.isPrimary
            });
          }
          console.log(`Se agregaron ${images.length} imágenes al parque ${park.name}`);
        } else {
          console.log(`El parque ${park.name} ya tiene imágenes asociadas.`);
        }
      }
      
      // Agregar amenidades
      if (parkAmenities && parkAmenities.length > 0) {
        // Verificar si ya existen amenidades asociadas a este parque
        const existingAmenities = await db.select().from(parkAmenities).where(eq(parkAmenities.parkId, park.id));
        
        if (existingAmenities.length === 0) {
          for (const amenityId of parkAmenities) {
            await db.insert(parkAmenities).values({
              parkId: park.id,
              amenityId
            });
          }
          console.log(`Se agregaron ${parkAmenities.length} amenidades al parque ${park.name}`);
        } else {
          console.log(`El parque ${park.name} ya tiene amenidades asociadas.`);
        }
      }
      
      // Agregar actividades
      if (activities && activities.length > 0) {
        // Verificar si ya existen actividades para este parque
        const existingActivities = await db.select().from(activities).where(eq(activities.parkId, park.id));
        
        if (existingActivities.length === 0) {
          for (const activityData of activities) {
            await db.insert(activities).values({
              parkId: park.id,
              title: activityData.title,
              description: activityData.description || null,
              startDate: activityData.startDate,
              endDate: activityData.endDate || null,
              category: activityData.category || null,
              location: activityData.location || null
            });
          }
          console.log(`Se agregaron ${activities.length} actividades al parque ${park.name}`);
        } else {
          console.log(`El parque ${park.name} ya tiene actividades asociadas.`);
        }
      }
      
      // Agregar documentos
      if (documents && documents.length > 0) {
        // Verificar si ya existen documentos para este parque
        const existingDocuments = await db.select().from(documents).where(eq(documents.parkId, park.id));
        
        if (existingDocuments.length === 0) {
          for (const documentData of documents) {
            await db.insert(documents).values({
              parkId: park.id,
              title: documentData.title,
              fileUrl: documentData.fileUrl,
              fileSize: documentData.fileSize || null,
              fileType: documentData.fileType || null
            });
          }
          console.log(`Se agregaron ${documents.length} documentos al parque ${park.name}`);
        } else {
          console.log(`El parque ${park.name} ya tiene documentos asociados.`);
        }
      }
    }
    
    console.log('¡Datos de Guadalajara cargados exitosamente!');
    return { success: true, message: 'Datos de Guadalajara cargados exitosamente', municipalityId: guadalajara.id };
  } catch (error) {
    console.error('Error al cargar datos de Guadalajara:', error);
    return { success: false, message: `Error al cargar datos: ${error.message}`, error };
  }
}

/**
 * Inicializa datos por defecto en la base de datos
 */
export async function seedDatabase() {
  console.log("Inicializando datos en la base de datos...");
  
  try {
    // Check if database is already seeded to prevent duplicates
    const existingUsers = await db.select().from(users).limit(1);
    const existingMunicipalities = await db.select().from(municipalities).limit(1);
    
    if (existingUsers.length > 0 && existingMunicipalities.length > 0) {
      console.log("La base de datos ya contiene datos. Saltando inicialización para evitar duplicados.");
      return { success: true, message: "Base de datos ya inicializada" };
    }
    // Verificar si la tabla amenities existe
    const tableExists = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'amenities'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log("La tabla amenities no existe. Creándola...");
      await db.execute(`
        CREATE TABLE IF NOT EXISTS amenities (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          icon VARCHAR(255),
          category VARCHAR(100)
        );
      `);
    }
    
    // Verificar si ya existen amenidades usando una consulta SQL directa
    const existingAmenitiesCount = await db.execute(`
      SELECT COUNT(*) FROM amenities;
    `);
    
    // Si no hay amenidades, insertar las predeterminadas
    if (parseInt(existingAmenitiesCount.rows[0].count) === 0) {
      console.log("Insertando amenidades predeterminadas...");
      
      // Insertar cada amenidad una por una para evitar problemas con el esquema
      for (const amenity of DEFAULT_AMENITIES) {
        await db.execute(`
          INSERT INTO amenities (id, name, icon, category)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO NOTHING;
        `, [amenity.id, amenity.name, amenity.icon, amenity.category]);
      }
      
      console.log(`${DEFAULT_AMENITIES.length} amenidades insertadas correctamente.`);
    } else {
      console.log(`Ya existen ${existingAmenitiesCount.rows[0].count} amenidades en la base de datos.`);
    }
  } catch (error) {
    console.error("Error al verificar o insertar amenidades:", error);
    throw error;
  }
  
  // Cargar datos específicos para Guadalajara
  const guadalajaraResult = await seedGuadalajaraData();
  
  // Verificar si ya existen usuarios administradores
  const existingAdminUsers = await db.select().from(users).where(eq(users.role, "admin"));
  
  if (existingAdminUsers.length === 0) {
    console.log("Creando usuario administrador general...");
    
    await db.insert(users).values({
      username: "admin",
      password: "admin123", // En producción usar bcrypt
      email: "admin@parquesmx.com",
      role: "admin",
      fullName: "Admin System"
    });
    
    console.log("Usuario administrador general creado correctamente.");
  }
  
  console.log("Base de datos inicializada correctamente.");
}