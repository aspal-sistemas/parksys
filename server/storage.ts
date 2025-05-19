import {
  users, municipalities, parks, parkImages, amenities, parkAmenities, documents, activities, comments, incidents,
  type User, type InsertUser, type Municipality, type InsertMunicipality, type Park, type InsertPark, 
  type ParkImage, type InsertParkImage, type Amenity, type InsertAmenity, type ParkAmenity, type InsertParkAmenity,
  type Document, type InsertDocument, type Activity, type InsertActivity, type Comment, type InsertComment, 
  type Incident, type InsertIncident, type ExtendedPark, PARK_TYPES, DEFAULT_AMENITIES
} from "@shared/schema";
import { db } from "./db";
import { and, eq, like, inArray, or, desc, isNull, lte, gte } from "drizzle-orm";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByExternalId(externalId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  upsertUser(userData: Partial<InsertUser> & { externalId: string }): Promise<User>;
  
  // Municipality operations
  getMunicipality(id: number): Promise<Municipality | undefined>;
  getMunicipalities(): Promise<Municipality[]>;
  createMunicipality(municipality: InsertMunicipality): Promise<Municipality>;
  updateMunicipality(id: number, municipality: Partial<InsertMunicipality>): Promise<Municipality | undefined>;
  deleteMunicipality(id: number): Promise<boolean>;
  
  // Park operations
  getPark(id: number): Promise<Park | undefined>;
  getExtendedPark(id: number): Promise<ExtendedPark | undefined>;
  getParks(filters?: Partial<{
    municipalityId: number;
    parkType: string;
    postalCode: string;
    amenities: number[];
    search: string;
    minArea?: number;
    maxArea?: number;
    hasAccessibility?: boolean;
    hasActivities?: boolean;
    foundedBefore?: number;
    foundedAfter?: number;
    conservationStatus?: string;
    nearLocation?: {latitude: string, longitude: string, maxDistance: number};
  }>): Promise<Park[]>;
  getExtendedParks(filters?: Partial<{
    municipalityId: number;
    parkType: string;
    postalCode: string;
    amenities: number[];
    search: string;
    minArea?: number;
    maxArea?: number;
    hasAccessibility?: boolean;
    hasActivities?: boolean;
    foundedBefore?: number;
    foundedAfter?: number;
    conservationStatus?: string;
    nearLocation?: {latitude: string, longitude: string, maxDistance: number};
  }>): Promise<ExtendedPark[]>;
  createPark(park: InsertPark): Promise<Park>;
  updatePark(id: number, park: Partial<InsertPark>): Promise<Park | undefined>;
  deletePark(id: number): Promise<boolean>;
  
  // Park Image operations
  getParkImage(id: number): Promise<ParkImage | undefined>;
  getParkImages(parkId: number): Promise<ParkImage[]>;
  createParkImage(parkImage: InsertParkImage): Promise<ParkImage>;
  updateParkImage(id: number, parkImage: Partial<InsertParkImage>): Promise<ParkImage | undefined>;
  deleteParkImage(id: number): Promise<boolean>;
  
  // Amenity operations
  getAmenity(id: number): Promise<Amenity | undefined>;
  getAmenities(): Promise<Amenity[]>;
  createAmenity(amenity: InsertAmenity): Promise<Amenity>;
  
  // Park Amenity operations
  getParkAmenities(parkId: number): Promise<Amenity[]>;
  addAmenityToPark(parkAmenity: InsertParkAmenity): Promise<ParkAmenity>;
  removeAmenityFromPark(parkId: number, amenityId: number): Promise<boolean>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getParkDocuments(parkId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getAllActivities(): Promise<Activity[]>;
  getParkActivities(parkId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  getParkComments(parkId: number, approvedOnly?: boolean): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  approveComment(id: number): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  
  // Incident operations
  getIncident(id: number): Promise<Incident | undefined>;
  getParkIncidents(parkId: number): Promise<Incident[]>;
  getAllIncidents(): Promise<Incident[]>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncidentStatus(id: number, status: string): Promise<Incident | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private externalIdToUserId: Map<string, number>; // Mapeo de ID externo a ID de usuario
  private municipalities: Map<number, Municipality>;
  private parks: Map<number, Park>;
  private parkImages: Map<number, ParkImage>;
  private amenities: Map<number, Amenity>;
  private parkAmenities: Map<number, ParkAmenity>;
  private documents: Map<number, Document>;
  private activities: Map<number, Activity>;
  private comments: Map<number, Comment>;
  private incidents: Map<number, Incident>;
  
  private userIdCounter: number;
  private municipalityIdCounter: number;
  private parkIdCounter: number;
  private parkImageIdCounter: number;
  private amenityIdCounter: number;
  private parkAmenityIdCounter: number;
  private documentIdCounter: number;
  private activityIdCounter: number;
  private commentIdCounter: number;
  private incidentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.externalIdToUserId = new Map();
    this.municipalities = new Map();
    this.parks = new Map();
    this.parkImages = new Map();
    this.amenities = new Map();
    this.parkAmenities = new Map();
    this.documents = new Map();
    this.activities = new Map();
    this.comments = new Map();
    this.incidents = new Map();
    
    this.userIdCounter = 1;
    this.municipalityIdCounter = 1;
    this.parkIdCounter = 1;
    this.parkImageIdCounter = 1;
    this.amenityIdCounter = 1;
    this.parkAmenityIdCounter = 1;
    this.documentIdCounter = 1;
    this.activityIdCounter = 1;
    this.commentIdCounter = 1;
    this.incidentIdCounter = 1;
    
    // Inicializar los datos por defecto de forma sincrónica
    this.initializeDefaultDataSync();
  }

  private initializeDefaultDataSync() {
    // Crear municipios por defecto directamente
    const guadalajara = {
      id: this.municipalityIdCounter++,
      name: "Guadalajara",
      state: "Jalisco",
      active: true,
      createdAt: new Date(),
      logoUrl: null
    };
    this.municipalities.set(guadalajara.id, guadalajara);
    
    const zapopan = {
      id: this.municipalityIdCounter++,
      name: "Zapopan",
      state: "Jalisco",
      active: true,
      createdAt: new Date(),
      logoUrl: null
    };
    this.municipalities.set(zapopan.id, zapopan);
    
    // Crear amenidades por defecto directamente
    DEFAULT_AMENITIES.forEach(amenity => {
      const newAmenity = {
        id: this.amenityIdCounter++,
        name: amenity.name,
        icon: amenity.icon,
        category: amenity.category
      };
      this.amenities.set(newAmenity.id, newAmenity);
    });
    
    // Crear usuarios por defecto directamente
    const adminUser = {
      id: this.userIdCounter++,
      username: "admin",
      password: "admin123", // En una app real, esto estaría hasheado
      firstName: "Admin",
      lastName: "User",
      email: "admin@parquesmx.com",
      role: "admin",
      municipalityId: null,
      externalId: null,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(adminUser.id, adminUser);
    
    const guadalajaraUser = {
      id: this.userIdCounter++,
      username: "guadalajara",
      password: "parks123", // En una app real, esto estaría hasheado
      firstName: "Municipio",
      lastName: "de Guadalajara",
      email: "parques@guadalajara.gob.mx",
      role: "municipality",
      municipalityId: guadalajara.id,
      externalId: null,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(guadalajaraUser.id, guadalajaraUser);

    // Crear parques de muestra directamente
    const parqueMetropolitano = {
      id: this.parkIdCounter++,
      name: "Parque Metropolitano",
      municipalityId: zapopan.id,
      parkType: "metropolitano",
      description: "El Parque Metropolitano de Guadalajara es un espacio público localizado en la ciudad de Zapopan, Jalisco, México. Es el pulmón verde más importante del área metropolitana de Guadalajara.",
      address: "Av. Beethoven 5800, La Estancia, 45030 Zapopan, Jal.",
      postalCode: "45030",
      latitude: "20.677369",
      longitude: "-103.458704",
      area: "686 hectáreas",
      foundationYear: 1997,
      administrator: "Dirección de Parques y Jardines",
      conservationStatus: "Bueno",
      regulationUrl: "https://transparencia.zapopan.gob.mx/normatividad/reglamento-parque-metropolitano.pdf",
      openingHours: "6:00 - 20:00 hrs",
      contactEmail: "contacto@parquemetropolitano.com",
      contactPhone: "(33) 3633-4550",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.parks.set(parqueMetropolitano.id, parqueMetropolitano);
    
    const bosqueColomos = {
      id: this.parkIdCounter++,
      name: "Bosque Los Colomos",
      municipalityId: guadalajara.id,
      parkType: "botanico",
      description: "Bosque Los Colomos es un área natural urbana protegida de 92 hectáreas, ubicada al nor-poniente de la zona metropolitana de Guadalajara.",
      address: "Paseo del Torreón s/n, Colonia Colomos Providencia, Guadalajara, Jalisco",
      postalCode: "44660",
      latitude: "20.7026",
      longitude: "-103.3908",
      area: "92 hectáreas",
      foundationYear: 1967,
      administrator: "Patronato Bosque Los Colomos",
      conservationStatus: "Excelente",
      regulationUrl: "https://transparencia.guadalajara.gob.mx/normatividad/reglamento-bosque-colomos.pdf",
      openingHours: "6:00 - 18:00 hrs",
      contactEmail: "info@bosquecolomos.org",
      contactPhone: "(33) 3641-3804",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.parks.set(bosqueColomos.id, bosqueColomos);
    
    const parqueIndependencia = {
      id: this.parkIdCounter++,
      name: "Parque Deportivo Independencia",
      municipalityId: guadalajara.id,
      parkType: "deportivo",
      description: "Parque con áreas deportivas y recreativas en la zona centro de Guadalajara.",
      address: "Calle Independencia 700, Centro, Guadalajara, Jalisco",
      postalCode: "44100",
      latitude: "20.6758",
      longitude: "-103.3448",
      area: "3.5 hectáreas",
      foundationYear: 1978,
      administrator: "Dirección de Deportes",
      conservationStatus: "Regular",
      regulationUrl: "https://transparencia.guadalajara.gob.mx/normatividad/reglamento-parques-municipales.pdf",
      openingHours: "6:00 - 21:00 hrs",
      contactEmail: "deportes@guadalajara.gob.mx",
      contactPhone: "(33) 3614-7538",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.parks.set(parqueIndependencia.id, parqueIndependencia);
    
    // Agregar imágenes a los parques directamente
    const parkImage1 = {
      id: this.parkImageIdCounter++,
      parkId: parqueMetropolitano.id,
      imageUrl: "https://pixabay.com/get/g991fbf8f2f31bcb25f227ef704adbd6ac218ce6e6a98f2364dc571ffab2b0b5e9ffdac41cf017ce0e188fb28b0fe621a03fe5e901395ecc5aab10f3989175463_1280.jpg",
      caption: "Vista principal",
      isPrimary: true,
      createdAt: new Date()
    };
    this.parkImages.set(parkImage1.id, parkImage1);
    
    const parkImage2 = {
      id: this.parkImageIdCounter++,
      parkId: parqueMetropolitano.id,
      imageUrl: "https://pixabay.com/get/g28bcc1617b2aee45fa695f3f39350cfc44e733b3b321023d0eb7a5fcffab38049a3ae2eca3f9a0843a7c7ac35b7a25be22402e2f880e3bef638106b0413b83bc_1280.jpg",
      caption: "Lago del parque",
      isPrimary: false,
      createdAt: new Date()
    };
    this.parkImages.set(parkImage2.id, parkImage2);
    
    const parkImage3 = {
      id: this.parkImageIdCounter++,
      parkId: parqueMetropolitano.id,
      imageUrl: "https://pixabay.com/get/g102b9fdfd7907a95a67da8932558d5d27f04d1e028446121be7f0a1268ea6defa582513b03d8aec2b9f7fd06abd09b330baeb6f150375aa52eacc72ceef523ee_1280.jpg",
      caption: "Sendero para correr",
      isPrimary: false,
      createdAt: new Date()
    };
    this.parkImages.set(parkImage3.id, parkImage3);
    
    const parkImage4 = {
      id: this.parkImageIdCounter++,
      parkId: bosqueColomos.id,
      imageUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      caption: "Vista principal",
      isPrimary: true,
      createdAt: new Date()
    };
    this.parkImages.set(parkImage4.id, parkImage4);
    
    const parkImage5 = {
      id: this.parkImageIdCounter++,
      parkId: parqueIndependencia.id,
      imageUrl: "https://images.unsplash.com/photo-1573155993874-d5d48af862ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      caption: "Vista principal",
      isPrimary: true,
      createdAt: new Date()
    };
    this.parkImages.set(parkImage5.id, parkImage5);
    
    // Agregar amenidades a parques directamente
    const parkAmenity1 = {
      id: this.parkAmenityIdCounter++,
      parkId: parqueMetropolitano.id,
      amenityId: 1 // Juegos infantiles
    };
    this.parkAmenities.set(parkAmenity1.id, parkAmenity1);
    
    const parkAmenity2 = {
      id: this.parkAmenityIdCounter++,
      parkId: parqueMetropolitano.id,
      amenityId: 2 // Baños públicos
    };
    this.parkAmenities.set(parkAmenity2.id, parkAmenity2);
    
    const parkAmenity3 = {
      id: this.parkAmenityIdCounter++,
      parkId: parqueMetropolitano.id,
      amenityId: 3 // Canchas deportivas
    };
    this.parkAmenities.set(parkAmenity3.id, parkAmenity3);
    
    const parkAmenity4 = {
      id: this.parkAmenityIdCounter++,
      parkId: parqueMetropolitano.id,
      amenityId: 4 // Ciclovías
    };
    this.parkAmenities.set(parkAmenity4.id, parkAmenity4);
    
    const parkAmenity5 = {
      id: this.parkAmenityIdCounter++,
      parkId: parqueMetropolitano.id,
      amenityId: 7 // Senderos para caminar
    };
    this.parkAmenities.set(parkAmenity5.id, parkAmenity5);
    
    const parkAmenity6 = {
      id: this.parkAmenityIdCounter++,
      parkId: parqueMetropolitano.id,
      amenityId: 8 // Estacionamiento
    };
    this.parkAmenities.set(parkAmenity6.id, parkAmenity6);
    
    const parkAmenity7 = {
      id: this.parkAmenityIdCounter++,
      parkId: parqueMetropolitano.id,
      amenityId: 9 // Áreas de picnic
    };
    this.parkAmenities.set(parkAmenity7.id, parkAmenity7);
    
    const parkAmenity8 = {
      id: this.parkAmenityIdCounter++,
      parkId: bosqueColomos.id,
      amenityId: 2 // Baños públicos
    };
    this.parkAmenities.set(parkAmenity8.id, parkAmenity8);
    
    const parkAmenity9 = {
      id: this.parkAmenityIdCounter++,
      parkId: bosqueColomos.id,
      amenityId: 5 // Zona para mascotas
    };
    this.parkAmenities.set(parkAmenity9.id, parkAmenity9);
    
    const parkAmenity10 = {
      id: this.parkAmenityIdCounter++,
      parkId: bosqueColomos.id,
      amenityId: 7 // Senderos para caminar
    };
    this.parkAmenities.set(parkAmenity10.id, parkAmenity10);
    
    const parkAmenity11 = {
      id: this.parkAmenityIdCounter++,
      parkId: parqueIndependencia.id,
      amenityId: 3 // Canchas deportivas
    };
    this.parkAmenities.set(parkAmenity11.id, parkAmenity11);
    
    const parkAmenity12 = {
      id: this.parkAmenityIdCounter++,
      parkId: parqueIndependencia.id,
      amenityId: 8 // Estacionamiento
    };
    this.parkAmenities.set(parkAmenity12.id, parkAmenity12);
    
    const parkAmenity13 = {
      id: this.parkAmenityIdCounter++,
      parkId: parqueIndependencia.id,
      amenityId: 12 // Iluminación
    };
    this.parkAmenities.set(parkAmenity13.id, parkAmenity13);
    
    // Agregar documentos a parques directamente
    const document1 = {
      id: this.documentIdCounter++,
      parkId: parqueMetropolitano.id,
      title: "Reglamento interno.pdf",
      fileUrl: "/documents/reglamento-metropolitano.pdf",
      fileSize: "356 KB",
      fileType: "application/pdf",
      createdAt: new Date()
    };
    this.documents.set(document1.id, document1);
    
    const document2 = {
      id: this.documentIdCounter++,
      parkId: parqueMetropolitano.id,
      title: "Plan maestro.pdf",
      fileUrl: "/documents/plan-maestro-metropolitano.pdf",
      fileSize: "2.4 MB",
      fileType: "application/pdf",
      createdAt: new Date()
    };
    this.documents.set(document2.id, document2);
    
    // Agregar actividades a parques directamente
    const now = new Date();
    const futureDate1 = new Date();
    futureDate1.setDate(now.getDate() + 15);
    const futureDate2 = new Date();
    futureDate2.setDate(now.getDate() + 7);
    
    const activity1 = {
      id: this.activityIdCounter++,
      parkId: parqueMetropolitano.id,
      title: "Maratón Verde 10K",
      description: "Carrera anual por los senderos del parque. Inscripciones abiertas.",
      startDate: futureDate1,
      endDate: null,
      category: "Deportivo",
      location: null,
      createdAt: new Date()
    };
    this.activities.set(activity1.id, activity1);
    
    const activity2 = {
      id: this.activityIdCounter++,
      parkId: parqueMetropolitano.id,
      title: "Taller de Huertos Urbanos",
      description: "Aprende a crear tu propio huerto en casa. Cupo limitado.",
      startDate: futureDate2,
      endDate: null,
      category: "Educativo",
      location: null,
      createdAt: new Date()
    };
    this.activities.set(activity2.id, activity2);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByExternalId(externalId: string): Promise<User | undefined> {
    const userId = this.externalIdToUserId.get(externalId);
    if (userId) {
      return this.users.get(userId);
    }
    return undefined;
  }
  
  async upsertUser(userData: Partial<InsertUser> & { externalId: string }): Promise<User> {
    // Verificar si el usuario ya existe por su ID externo
    const existingUser = await this.getUserByExternalId(userData.externalId);
    
    if (existingUser) {
      // Actualizar usuario existente
      const { externalId, ...updateData } = userData;
      const updatedUser = await this.updateUser(existingUser.id, updateData);
      return updatedUser!;
    } else {
      // Crear nuevo usuario
      const newUserData = {
        externalId: userData.externalId,
        username: userData.username || `user-${userData.externalId.substring(0, 8)}`,
        email: userData.email || null,
        password: userData.password || '',
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        role: userData.role || 'user',
        municipalityId: userData.municipalityId || null
      };
      
      return await this.createUser(newUserData as InsertUser);
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser = { 
      ...user, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, newUser);
    
    // Si tiene ID externo, mantener el mapeo
    if (user.externalId) {
      this.externalIdToUserId.set(user.externalId, id);
    }
    
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Municipality operations
  async getMunicipality(id: number): Promise<Municipality | undefined> {
    return this.municipalities.get(id);
  }

  async getMunicipalities(): Promise<Municipality[]> {
    return Array.from(this.municipalities.values());
  }

  async createMunicipality(municipalityData: InsertMunicipality): Promise<Municipality> {
    const id = this.municipalityIdCounter++;
    const createdAt = new Date();
    const municipality = { ...municipalityData, id, createdAt };
    this.municipalities.set(id, municipality);
    return municipality;
  }

  async updateMunicipality(id: number, municipalityData: Partial<InsertMunicipality>): Promise<Municipality | undefined> {
    const municipality = this.municipalities.get(id);
    if (!municipality) return undefined;
    
    const updatedMunicipality = { ...municipality, ...municipalityData };
    this.municipalities.set(id, updatedMunicipality);
    return updatedMunicipality;
  }

  async deleteMunicipality(id: number): Promise<boolean> {
    return this.municipalities.delete(id);
  }

  // Park operations
  async getPark(id: number): Promise<Park | undefined> {
    return this.parks.get(id);
  }

  async getExtendedPark(id: number): Promise<ExtendedPark | undefined> {
    const park = this.parks.get(id);
    if (!park) return undefined;
    
    const amenities = await this.getParkAmenities(id);
    const images = await this.getParkImages(id);
    const documents = await this.getParkDocuments(id);
    const activities = await this.getParkActivities(id);
    const comments = await this.getParkComments(id, true);
    const municipality = await this.getMunicipality(park.municipalityId);
    
    const primaryImage = images.find(img => img.isPrimary)?.imageUrl || images[0]?.imageUrl;
    
    return {
      ...park,
      amenities,
      images,
      primaryImage,
      documents,
      activities,
      comments,
      municipality
    };
  }

  async getMunicipalityParks(municipalityId: number): Promise<Park[]> {
    return Array.from(this.parks.values()).filter(park => park.municipalityId === municipalityId);
  }
  
  async getParks(filters?: Partial<{
    municipalityId: number;
    parkType: string;
    postalCode: string;
    amenities: number[];
    search: string;
    includeDeleted?: boolean; // Añadimos soporte para este filtro también en memoria
  }>): Promise<Park[]> {
    let parks = Array.from(this.parks.values());
    
    // Por defecto, excluimos parques eliminados
    if (!filters?.includeDeleted) {
      parks = parks.filter(park => !park.isDeleted);
    }
    
    if (filters) {
      // Apply municipal filter
      if (filters.municipalityId !== undefined) {
        parks = parks.filter(park => park.municipalityId === filters.municipalityId);
      }
      
      // Apply park type filter
      if (filters.parkType) {
        parks = parks.filter(park => park.parkType === filters.parkType);
      }
      
      // Apply postal code filter
      if (filters.postalCode) {
        parks = parks.filter(park => park.postalCode?.includes(filters.postalCode!));
      }
      
      // Apply amenity filter
      if (filters.amenities && filters.amenities.length > 0) {
        const parksWithAmenityIds = Array.from(this.parkAmenities.values())
          .filter(pa => filters.amenities!.includes(pa.amenityId))
          .map(pa => pa.parkId);
        
        // Create a set for faster lookups
        const parkIdsWithAmenities = new Set(parksWithAmenityIds);
        
        parks = parks.filter(park => parkIdsWithAmenities.has(park.id));
      }
      
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        parks = parks.filter(park => 
          park.name.toLowerCase().includes(searchLower) || 
          park.description?.toLowerCase().includes(searchLower) || 
          park.address.toLowerCase().includes(searchLower)
        );
      }
    }
    
    return parks;
  }

  async getExtendedParks(filters?: Partial<{
    municipalityId: number;
    parkType: string;
    postalCode: string;
    amenities: number[];
    search: string;
    includeDeleted?: boolean; // Añadimos soporte para este filtro en memoria también aquí
  }>): Promise<ExtendedPark[]> {
    const parks = await this.getParks(filters);
    
    // Map all parks to extended parks
    const extendedParks = await Promise.all(
      parks.map(async (park) => {
        const amenities = await this.getParkAmenities(park.id);
        const images = await this.getParkImages(park.id);
        const municipality = await this.getMunicipality(park.municipalityId);
        
        const primaryImage = images.find(img => img.isPrimary)?.imageUrl || images[0]?.imageUrl;
        
        return {
          ...park,
          amenities,
          images,
          primaryImage,
          municipality
        };
      })
    );
    
    return extendedParks;
  }

  async createPark(parkData: InsertPark): Promise<Park> {
    const id = this.parkIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const park = { ...parkData, id, createdAt, updatedAt };
    this.parks.set(id, park);
    return park;
  }

  async updatePark(id: number, parkData: Partial<InsertPark>): Promise<Park | undefined> {
    const park = this.parks.get(id);
    if (!park) return undefined;
    
    const updatedAt = new Date();
    const updatedPark = { ...park, ...parkData, updatedAt };
    this.parks.set(id, updatedPark);
    return updatedPark;
  }

  async deletePark(id: number): Promise<boolean> {
    // Implementamos borrado lógico en lugar de borrado físico para MemStorage también
    const park = this.parks.get(id);
    if (!park) return false;
    
    const updatedPark = { 
      ...park, 
      isDeleted: true, 
      updatedAt: new Date() 
    };
    this.parks.set(id, updatedPark);
    return true;
  }

  // Park Image operations
  async getParkImage(id: number): Promise<ParkImage | undefined> {
    return this.parkImages.get(id);
  }

  async getParkImages(parkId: number): Promise<ParkImage[]> {
    return Array.from(this.parkImages.values()).filter(image => image.parkId === parkId);
  }

  async createParkImage(imageData: InsertParkImage): Promise<ParkImage> {
    const id = this.parkImageIdCounter++;
    const createdAt = new Date();
    const image = { ...imageData, id, createdAt };
    this.parkImages.set(id, image);
    return image;
  }

  async updateParkImage(id: number, imageData: Partial<InsertParkImage>): Promise<ParkImage | undefined> {
    const image = this.parkImages.get(id);
    if (!image) return undefined;
    
    const updatedImage = { ...image, ...imageData };
    this.parkImages.set(id, updatedImage);
    return updatedImage;
  }

  async deleteParkImage(id: number): Promise<boolean> {
    return this.parkImages.delete(id);
  }

  // Amenity operations
  async getAmenity(id: number): Promise<Amenity | undefined> {
    return this.amenities.get(id);
  }

  async getAmenities(): Promise<Amenity[]> {
    return Array.from(this.amenities.values());
  }

  async createAmenity(amenityData: InsertAmenity): Promise<Amenity> {
    const id = this.amenityIdCounter++;
    const amenity = { ...amenityData, id };
    this.amenities.set(id, amenity);
    return amenity;
  }

  // Park Amenity operations
  async getParkAmenities(parkId: number): Promise<Amenity[]> {
    const parkAmenityList = Array.from(this.parkAmenities.values())
      .filter(pa => pa.parkId === parkId);
    
    const amenityIds = parkAmenityList.map(pa => pa.amenityId);
    
    return Array.from(this.amenities.values())
      .filter(amenity => amenityIds.includes(amenity.id));
  }

  async addAmenityToPark(parkAmenityData: InsertParkAmenity): Promise<ParkAmenity> {
    // Check if already exists
    const exists = Array.from(this.parkAmenities.values())
      .some(pa => pa.parkId === parkAmenityData.parkId && pa.amenityId === parkAmenityData.amenityId);
    
    if (exists) {
      // Return the existing relation
      const existing = Array.from(this.parkAmenities.values())
        .find(pa => pa.parkId === parkAmenityData.parkId && pa.amenityId === parkAmenityData.amenityId);
      
      return existing!;
    }
    
    const id = this.parkAmenityIdCounter++;
    const parkAmenity = { ...parkAmenityData, id };
    this.parkAmenities.set(id, parkAmenity);
    return parkAmenity;
  }

  async removeAmenityFromPark(parkId: number, amenityId: number): Promise<boolean> {
    const parkAmenityToRemove = Array.from(this.parkAmenities.values())
      .find(pa => pa.parkId === parkId && pa.amenityId === amenityId);
    
    if (parkAmenityToRemove) {
      return this.parkAmenities.delete(parkAmenityToRemove.id);
    }
    
    return false;
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getParkDocuments(parkId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.parkId === parkId);
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const createdAt = new Date();
    const document = { ...documentData, id, createdAt };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  async getParkActivities(parkId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.parkId === parkId)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const createdAt = new Date();
    const activity = { ...activityData, id, createdAt };
    this.activities.set(id, activity);
    return activity;
  }

  async updateActivity(id: number, activityData: Partial<InsertActivity>): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;
    
    const updatedActivity = { ...activity, ...activityData };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteActivity(id: number): Promise<boolean> {
    return this.activities.delete(id);
  }

  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getParkComments(parkId: number, approvedOnly: boolean = false): Promise<Comment[]> {
    let comments = Array.from(this.comments.values()).filter(comment => comment.parkId === parkId);
    
    if (approvedOnly) {
      comments = comments.filter(comment => comment.isApproved);
    }
    
    return comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const createdAt = new Date();
    const comment = { ...commentData, id, createdAt, isApproved: false };
    this.comments.set(id, comment);
    return comment;
  }

  async approveComment(id: number): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    const updatedComment = { ...comment, isApproved: true };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Incident operations
  async getIncident(id: number): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }

  async getParkIncidents(parkId: number): Promise<Incident[]> {
    return Array.from(this.incidents.values())
      .filter(incident => incident.parkId === parkId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getAllIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createIncident(incidentData: InsertIncident): Promise<Incident> {
    const id = this.incidentIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const incident = { ...incidentData, id, createdAt, updatedAt, status: "pending" };
    this.incidents.set(id, incident);
    return incident;
  }
  
  async updateIncidentStatus(id: number, status: string): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) {
      return undefined;
    }
    
    const updatedIncident = { 
      ...incident, 
      status, 
      updatedAt: new Date() 
    };
    
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }
}



// Implementation using PostgreSQL with Drizzle
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log("Buscando usuario con username:", username);
      // Una consulta más simple, evitando posibles referencias internas a external_id
      const result = await db.execute(sql`SELECT * FROM users WHERE username = ${username}`);
      console.log("Resultado de consulta:", result.rows);
      
      if (result.rows.length > 0) {
        return result.rows[0] as User;
      }
      return undefined;
    } catch (error) {
      console.error("Error en getUserByUsername:", error);
      return undefined;
    }
  }
  
  async getUserByExternalId(externalId: string): Promise<User | undefined> {
    // Como no existe la columna externalId en la base de datos, usamos SQL directo
    try {
      console.log("Buscando usuario con externalId:", externalId);
      const result = await db.execute(sql`SELECT * FROM users WHERE username LIKE ${`%${externalId}%`}`);
      
      if (result.rows.length > 0) {
        // Convertimos a nuestro formato esperado
        const userData = result.rows[0];
        return {
          id: userData.id,
          username: userData.username,
          password: userData.password,
          email: userData.email,
          role: userData.role,
          fullName: userData.full_name,
          municipalityId: userData.municipality_id
        };
      }
      return undefined;
    } catch (error) {
      console.error("Error en getUserByExternalId:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  async upsertUser(userData: Partial<InsertUser> & { externalId?: string, firstName?: string, lastName?: string }): Promise<User> {
    // Como no tenemos externalId en la tabla, verificamos por username o email
    let existingUser: User | undefined;
    
    if (userData.username) {
      existingUser = await this.getUserByUsername(userData.username);
    }
    
    if (!existingUser && userData.email) {
      const [userByEmail] = await db.select().from(users).where(eq(users.email, userData.email));
      existingUser = userByEmail;
    }
    
    // Adaptamos el nombre completo basado en firstName y lastName si están presentes
    let fullName = userData.fullName;
    if (!fullName && userData.firstName && userData.lastName) {
      fullName = `${userData.firstName} ${userData.lastName}`;
    } else if (!fullName && userData.firstName) {
      fullName = userData.firstName;
    } else if (!fullName && userData.lastName) {
      fullName = userData.lastName;
    }
    
    // Extraer solo los campos que existen en la tabla actual
    const { 
      externalId, firstName, lastName, profileImageUrl, ...validFields 
    } = userData;
    
    const dataToUse = {
      ...validFields,
      fullName: fullName || null
    };
    
    if (existingUser) {
      // Actualizar usuario existente
      const updatedUser = await this.updateUser(existingUser.id, dataToUse);
      return updatedUser!;
    } else {
      // Crear nuevo usuario
      const newUserData = {
        ...dataToUse,
        username: dataToUse.username || (externalId ? `user-${externalId}` : `user_${Date.now()}`),
        email: dataToUse.email || null,
        password: dataToUse.password || '',
        role: dataToUse.role || 'user',
        municipalityId: dataToUse.municipalityId || null
      };
      
      const newUser = await this.createUser(newUserData as InsertUser);
      return newUser;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getMunicipality(id: number): Promise<Municipality | undefined> {
    const [municipality] = await db.select().from(municipalities).where(eq(municipalities.id, id));
    return municipality || undefined;
  }

  async getMunicipalities(): Promise<Municipality[]> {
    return await db.select().from(municipalities).orderBy(municipalities.name);
  }

  async createMunicipality(municipalityData: InsertMunicipality): Promise<Municipality> {
    const [newMunicipality] = await db.insert(municipalities).values(municipalityData).returning();
    return newMunicipality;
  }

  async updateMunicipality(id: number, municipalityData: Partial<InsertMunicipality>): Promise<Municipality | undefined> {
    const [updatedMunicipality] = await db.update(municipalities)
      .set(municipalityData)
      .where(eq(municipalities.id, id))
      .returning();
    return updatedMunicipality || undefined;
  }

  async deleteMunicipality(id: number): Promise<boolean> {
    const result = await db.delete(municipalities).where(eq(municipalities.id, id));
    return result.rowCount > 0;
  }

  async getPark(id: number): Promise<Park | undefined> {
    const [park] = await db.select().from(parks).where(
      and(
        eq(parks.id, id),
        eq(parks.isDeleted, false) // Solo incluir parques no eliminados
      )
    );
    return park || undefined;
  }

  async getExtendedPark(id: number): Promise<ExtendedPark | undefined> {
    const park = await this.getPark(id);
    // No devolver el parque si no existe o si está marcado como eliminado
    if (!park || park.isDeleted) return undefined;

    const parkAmenities = await this.getParkAmenities(id);
    const parkImages = await this.getParkImages(id);
    const parkDocuments = await this.getParkDocuments(id);
    const parkActivities = await this.getParkActivities(id);
    const parkComments = await this.getParkComments(id, true); // Only approved comments
    
    const [municipality] = await db.select().from(municipalities).where(eq(municipalities.id, park.municipalityId));
    
    // Find primary image URL
    let primaryImage = undefined;
    const primaryImgRecord = parkImages.find(img => img.isPrimary);
    if (primaryImgRecord) {
      primaryImage = primaryImgRecord.imageUrl;
    } else if (parkImages.length > 0) {
      primaryImage = parkImages[0].imageUrl;
    }

    return {
      ...park,
      amenities: parkAmenities,
      images: parkImages,
      primaryImage,
      documents: parkDocuments,
      activities: parkActivities,
      comments: parkComments,
      municipality: municipality
    };
  }

  async getParks(filters?: Partial<{
    municipalityId: number;
    parkType: string;
    postalCode: string;
    amenities: number[];
    search: string;
    minArea?: number;
    maxArea?: number;
    hasAccessibility?: boolean;
    hasActivities?: boolean;
    foundedBefore?: number;
    foundedAfter?: number;
    conservationStatus?: string;
    nearLocation?: {latitude: string, longitude: string, maxDistance: number};
    includeDeleted?: boolean; // Añadimos este nuevo filtro opcional
  }>): Promise<Park[]> {
    let query = db.select().from(parks);
    
    if (filters) {
      const whereConditions = [];
      
      // Por defecto, excluimos los parques marcados como eliminados
      if (filters.includeDeleted !== true) {
        whereConditions.push(eq(parks.isDeleted, false));
      }
      
      if (filters.municipalityId !== undefined) {
        whereConditions.push(eq(parks.municipalityId, filters.municipalityId));
      }
      
      if (filters.parkType) {
        whereConditions.push(eq(parks.parkType, filters.parkType));
      }
      
      if (filters.postalCode) {
        whereConditions.push(eq(parks.postalCode, filters.postalCode));
      }
      
      if (filters.search) {
        whereConditions.push(
          or(
            like(parks.name, `%${filters.search}%`),
            like(parks.description || '', `%${filters.search}%`),
            like(parks.address, `%${filters.search}%`)
          )
        );
      }
      
      if (filters.conservationStatus) {
        whereConditions.push(eq(parks.conservationStatus, filters.conservationStatus));
      }
      
      if (filters.foundedBefore) {
        whereConditions.push(lte(parks.foundationYear, filters.foundedBefore));
      }
      
      if (filters.foundedAfter) {
        whereConditions.push(gte(parks.foundationYear, filters.foundedAfter));
      }
      
      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }
    }
    
    let result = await query.orderBy(parks.name);
    
    // Post-database filtering for complex conditions
    
    // Filter by amenities if specified
    if (filters?.amenities && filters.amenities.length > 0) {
      const parksWithAmenities = [];
      
      for (const park of result) {
        const parkAmenityRecords = await db.select()
          .from(parkAmenities)
          .where(
            and(
              eq(parkAmenities.parkId, park.id),
              inArray(parkAmenities.amenityId, filters.amenities)
            )
          );
          
        if (parkAmenityRecords.length === filters.amenities.length) {
          parksWithAmenities.push(park);
        }
      }
      
      result = parksWithAmenities;
    }
    
    // Filter by area
    if ((filters?.minArea !== undefined) || (filters?.maxArea !== undefined)) {
      result = result.filter(park => {
        // Parse area string to number
        const areaPart = park.area?.split(' ')[0]; // Extract the numeric part
        if (!areaPart) return false;
        
        const areaValue = parseFloat(areaPart);
        if (isNaN(areaValue)) return false;
        
        const hasHectares = park.area?.includes('hectárea') || park.area?.includes('hectareas');
        // Convert to square meters if in hectares
        const areaInM2 = hasHectares ? areaValue * 10000 : areaValue;
        
        if (filters.minArea !== undefined && areaInM2 < filters.minArea) return false;
        if (filters.maxArea !== undefined && areaInM2 > filters.maxArea) return false;
        
        return true;
      });
    }
    
    // Filter by accessibility features
    if (filters?.hasAccessibility) {
      const accessibilityParks = [];
      
      for (const park of result) {
        // Check for amenities related to accessibility
        const accessibilityAmenities = await db
          .select()
          .from(parkAmenities)
          .innerJoin(amenities, eq(parkAmenities.amenityId, amenities.id))
          .where(
            and(
              eq(parkAmenities.parkId, park.id),
              eq(amenities.category, 'accesibilidad')
            )
          );
          
        if (accessibilityAmenities.length > 0) {
          accessibilityParks.push(park);
        }
      }
      
      result = accessibilityParks;
    }
    
    // Filter by parks with activities
    if (filters?.hasActivities) {
      const parksWithActivities = [];
      
      for (const park of result) {
        const parkActivities = await db
          .select()
          .from(activities)
          .where(eq(activities.parkId, park.id))
          .limit(1);
          
        if (parkActivities.length > 0) {
          parksWithActivities.push(park);
        }
      }
      
      result = parksWithActivities;
    }
    
    // Filter by location proximity (simple distance calculation)
    if (filters?.nearLocation) {
      result = result.filter(park => {
        // Simple distance calculation using latitude and longitude
        const lat1 = parseFloat(park.latitude);
        const lon1 = parseFloat(park.longitude);
        const lat2 = parseFloat(filters.nearLocation!.latitude);
        const lon2 = parseFloat(filters.nearLocation!.longitude);
        
        if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return false;
        
        // Calculate distance using haversine formula
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c; // Distance in km
        
        return distance <= filters.nearLocation!.maxDistance;
      });
    }
    
    return result;
  }

  async getExtendedParks(filters?: Partial<{
    municipalityId: number;
    parkType: string;
    postalCode: string;
    amenities: number[];
    search: string;
    minArea?: number;
    maxArea?: number;
    hasAccessibility?: boolean;
    hasActivities?: boolean;
    foundedBefore?: number;
    foundedAfter?: number;
    conservationStatus?: string;
    nearLocation?: {latitude: string, longitude: string, maxDistance: number};
  }>): Promise<ExtendedPark[]> {
    const parksList = await this.getParks(filters);
    const extendedParks: ExtendedPark[] = [];
    
    for (const park of parksList) {
      const extendedPark = await this.getExtendedPark(park.id);
      if (extendedPark) {
        extendedParks.push(extendedPark);
      }
    }
    
    return extendedParks;
  }

  async createPark(parkData: InsertPark): Promise<Park> {
    const [newPark] = await db.insert(parks).values(parkData).returning();
    return newPark;
  }

  async updatePark(id: number, parkData: Partial<InsertPark>): Promise<Park | undefined> {
    const [updatedPark] = await db.update(parks)
      .set({
        ...parkData,
        updatedAt: new Date()
      })
      .where(eq(parks.id, id))
      .returning();
    return updatedPark || undefined;
  }

  async deletePark(id: number): Promise<boolean> {
    // Implementamos borrado lógico en lugar de borrado físico
    const result = await db.update(parks)
      .set({ 
        isDeleted: true,
        updatedAt: new Date() 
      })
      .where(eq(parks.id, id))
      .returning();
    return result.length > 0;
  }

  async getParkImage(id: number): Promise<ParkImage | undefined> {
    const [image] = await db.select().from(parkImages).where(eq(parkImages.id, id));
    return image || undefined;
  }

  async getParkImages(parkId: number): Promise<ParkImage[]> {
    return await db.select()
      .from(parkImages)
      .where(eq(parkImages.parkId, parkId))
      .orderBy(desc(parkImages.isPrimary));
  }

  async createParkImage(imageData: InsertParkImage): Promise<ParkImage> {
    // If this is a primary image, make sure no other images for this park are primary
    if (imageData.isPrimary) {
      await db.update(parkImages)
        .set({ isPrimary: false })
        .where(eq(parkImages.parkId, imageData.parkId));
    }
    
    const [newImage] = await db.insert(parkImages).values(imageData).returning();
    return newImage;
  }

  async updateParkImage(id: number, imageData: Partial<InsertParkImage>): Promise<ParkImage | undefined> {
    const image = await this.getParkImage(id);
    if (!image) return undefined;
    
    // If setting this as primary, unset others
    if (imageData.isPrimary) {
      await db.update(parkImages)
        .set({ isPrimary: false })
        .where(eq(parkImages.parkId, image.parkId));
    }
    
    const [updatedImage] = await db.update(parkImages)
      .set(imageData)
      .where(eq(parkImages.id, id))
      .returning();
    return updatedImage || undefined;
  }

  async deleteParkImage(id: number): Promise<boolean> {
    const result = await db.delete(parkImages).where(eq(parkImages.id, id));
    return result.rowCount > 0;
  }

  async getAmenity(id: number): Promise<Amenity | undefined> {
    const [amenity] = await db.select().from(amenities).where(eq(amenities.id, id));
    return amenity || undefined;
  }

  async getAmenities(): Promise<Amenity[]> {
    return await db.select().from(amenities).orderBy(amenities.name);
  }

  async createAmenity(amenityData: InsertAmenity): Promise<Amenity> {
    const [newAmenity] = await db.insert(amenities).values(amenityData).returning();
    return newAmenity;
  }

  async getParkAmenities(parkId: number): Promise<Amenity[]> {
    const parkAmenitiesData = await db.select()
      .from(parkAmenities)
      .where(eq(parkAmenities.parkId, parkId));
      
    if (parkAmenitiesData.length === 0) return [];
    
    const amenityIds = parkAmenitiesData.map(pa => pa.amenityId);
    return await db.select()
      .from(amenities)
      .where(inArray(amenities.id, amenityIds))
      .orderBy(amenities.name);
  }

  async addAmenityToPark(parkAmenityData: InsertParkAmenity): Promise<ParkAmenity> {
    // Check if the relation already exists
    const [existing] = await db.select()
      .from(parkAmenities)
      .where(
        and(
          eq(parkAmenities.parkId, parkAmenityData.parkId),
          eq(parkAmenities.amenityId, parkAmenityData.amenityId)
        )
      );
      
    if (existing) return existing;
    
    const [newParkAmenity] = await db.insert(parkAmenities)
      .values(parkAmenityData)
      .returning();
    return newParkAmenity;
  }

  async removeAmenityFromPark(parkId: number, amenityId: number): Promise<boolean> {
    const result = await db.delete(parkAmenities)
      .where(
        and(
          eq(parkAmenities.parkId, parkId),
          eq(parkAmenities.amenityId, amenityId)
        )
      );
    return result.rowCount > 0;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.select()
      .from(documents)
      .orderBy(documents.title);
  }

  async getParkDocuments(parkId: number): Promise<Document[]> {
    return await db.select()
      .from(documents)
      .where(eq(documents.parkId, parkId))
      .orderBy(documents.title);
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(documentData).returning();
    return newDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount > 0;
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity || undefined;
  }

  async getAllActivities(): Promise<Activity[]> {
    return await db.select()
      .from(activities)
      .orderBy(activities.startDate);
  }

  async getParkActivities(parkId: number): Promise<Activity[]> {
    return await db.select()
      .from(activities)
      .where(eq(activities.parkId, parkId))
      .orderBy(activities.startDate);
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activityData).returning();
    return newActivity;
  }

  async updateActivity(id: number, activityData: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [updatedActivity] = await db.update(activities)
      .set(activityData)
      .where(eq(activities.id, id))
      .returning();
    return updatedActivity || undefined;
  }

  async deleteActivity(id: number): Promise<boolean> {
    const result = await db.delete(activities).where(eq(activities.id, id));
    return result.rowCount > 0;
  }

  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async getParkComments(parkId: number, approvedOnly: boolean = false): Promise<Comment[]> {
    let query = db.select().from(comments).where(eq(comments.parkId, parkId));
    
    if (approvedOnly) {
      query = query.where(eq(comments.isApproved, true));
    }
    
    return await query.orderBy(desc(comments.createdAt));
  }
  
  async getAllComments(approvedFilter?: boolean): Promise<Comment[]> {
    // Hacemos una consulta más simple para evitar errores con la estructura
    let query = db.select().from(comments);
    
    // Si se proporciona un filtro de aprobación, lo aplicamos
    if (approvedFilter !== undefined) {
      query = query.where(eq(comments.isApproved, approvedFilter));
    }
    
    // Ejecutamos la consulta y ordenamos por fecha
    const commentsData = await query.orderBy(desc(comments.createdAt));
    
    // Devolvemos los resultados directamente
    return commentsData;
  }
  
  async getParkCommentsByIds(parkIds: number[], approvedFilter?: boolean): Promise<Comment[]> {
    if (!parkIds.length) return [];
    
    let query = db.select().from(comments)
      .where(inArray(comments.parkId, parkIds));
    
    // Si se proporciona un filtro de aprobación, lo aplicamos
    if (approvedFilter !== undefined) {
      query = query.where(eq(comments.isApproved, approvedFilter));
    }
    
    // Obtenemos los comentarios con orden por fecha
    const commentsData = await query.orderBy(desc(comments.createdAt));
    
    // Si no hay comentarios, devolvemos array vacío
    if (!commentsData.length) return [];
    
    // Obtenemos la información de los parques para estos comentarios
    const parksInfo = await db.select({
      id: parks.id,
      name: parks.name,
      municipalityId: parks.municipalityId
    }).from(parks).where(inArray(parks.id, parkIds));
    
    // Mapeamos la información del parque a cada comentario
    return commentsData.map(comment => {
      const park = parksInfo.find(p => p.id === comment.parkId);
      return {
        ...comment,
        park: park || null
      };
    });
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments)
      .values({
        ...commentData,
        isApproved: false
      })
      .returning();
    return newComment;
  }

  async approveComment(id: number): Promise<Comment | undefined> {
    const [approvedComment] = await db.update(comments)
      .set({ isApproved: true })
      .where(eq(comments.id, id))
      .returning();
    return approvedComment || undefined;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return result.rowCount > 0;
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident || undefined;
  }

  async getParkIncidents(parkId: number): Promise<Incident[]> {
    return await db.select()
      .from(incidents)
      .where(eq(incidents.parkId, parkId))
      .orderBy(desc(incidents.createdAt));
  }
  
  async getAllIncidents(): Promise<Incident[]> {
    return await db.select()
      .from(incidents)
      .orderBy(desc(incidents.createdAt));
  }

  async createIncident(incidentData: InsertIncident): Promise<Incident> {
    const [newIncident] = await db.insert(incidents)
      .values({
        ...incidentData,
        status: 'pending',
        updatedAt: new Date()
      })
      .returning();
    return newIncident;
  }

  async updateIncidentStatus(id: number, status: string): Promise<Incident | undefined> {
    const [updatedIncident] = await db.update(incidents)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(incidents.id, id))
      .returning();
    return updatedIncident || undefined;
  }
}

// Use database storage


export const storage = new DatabaseStorage();
