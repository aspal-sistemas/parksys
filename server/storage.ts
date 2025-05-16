import {
  users, municipalities, parks, parkImages, amenities, parkAmenities, documents, activities, comments, incidents,
  type User, type InsertUser, type Municipality, type InsertMunicipality, type Park, type InsertPark, 
  type ParkImage, type InsertParkImage, type Amenity, type InsertAmenity, type ParkAmenity, type InsertParkAmenity,
  type Document, type InsertDocument, type Activity, type InsertActivity, type Comment, type InsertComment, 
  type Incident, type InsertIncident, type ExtendedPark, PARK_TYPES, DEFAULT_AMENITIES
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
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
  }>): Promise<Park[]>;
  getExtendedParks(filters?: Partial<{
    municipalityId: number;
    parkType: string;
    postalCode: string;
    amenities: number[];
    search: string;
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
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncidentStatus(id: number, status: string): Promise<Incident | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
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
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default municipalities
    const guadalajara = this.createMunicipality({
      name: "Guadalajara",
      state: "Jalisco",
      active: true
    });
    
    const zapopan = this.createMunicipality({
      name: "Zapopan",
      state: "Jalisco",
      active: true
    });
    
    // Create default amenities
    DEFAULT_AMENITIES.forEach(amenity => {
      this.createAmenity({
        name: amenity.name,
        icon: amenity.icon,
        category: amenity.category
      });
    });
    
    // Create default users
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      fullName: "Admin User",
      email: "admin@parquesmx.com",
      role: "admin",
      municipalityId: undefined
    });
    
    this.createUser({
      username: "guadalajara",
      password: "parks123", // In a real app, this would be hashed
      fullName: "Municipio de Guadalajara",
      email: "parques@guadalajara.gob.mx",
      role: "municipality",
      municipalityId: guadalajara.id
    });

    // Create sample parks
    const parqueMetropolitano = this.createPark({
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
      openingHours: "6:00 - 20:00 hrs",
      contactEmail: "contacto@parquemetropolitano.com",
      contactPhone: "(33) 3633-4550"
    });
    
    const bosqueColomos = this.createPark({
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
      openingHours: "6:00 - 18:00 hrs",
      contactEmail: "info@bosquecolomos.org",
      contactPhone: "(33) 3641-3804"
    });
    
    const parqueIndependencia = this.createPark({
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
      openingHours: "6:00 - 21:00 hrs",
      contactEmail: "deportes@guadalajara.gob.mx",
      contactPhone: "(33) 3614-7538"
    });
    
    // Add images to parks
    this.createParkImage({
      parkId: parqueMetropolitano.id,
      imageUrl: "https://pixabay.com/get/g991fbf8f2f31bcb25f227ef704adbd6ac218ce6e6a98f2364dc571ffab2b0b5e9ffdac41cf017ce0e188fb28b0fe621a03fe5e901395ecc5aab10f3989175463_1280.jpg",
      caption: "Vista principal",
      isPrimary: true
    });
    
    this.createParkImage({
      parkId: parqueMetropolitano.id,
      imageUrl: "https://pixabay.com/get/g28bcc1617b2aee45fa695f3f39350cfc44e733b3b321023d0eb7a5fcffab38049a3ae2eca3f9a0843a7c7ac35b7a25be22402e2f880e3bef638106b0413b83bc_1280.jpg",
      caption: "Lago del parque",
      isPrimary: false
    });
    
    this.createParkImage({
      parkId: parqueMetropolitano.id,
      imageUrl: "https://pixabay.com/get/g102b9fdfd7907a95a67da8932558d5d27f04d1e028446121be7f0a1268ea6defa582513b03d8aec2b9f7fd06abd09b330baeb6f150375aa52eacc72ceef523ee_1280.jpg",
      caption: "Sendero para correr",
      isPrimary: false
    });
    
    this.createParkImage({
      parkId: bosqueColomos.id,
      imageUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      caption: "Vista principal",
      isPrimary: true
    });
    
    this.createParkImage({
      parkId: parqueIndependencia.id,
      imageUrl: "https://images.unsplash.com/photo-1573155993874-d5d48af862ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      caption: "Vista principal",
      isPrimary: true
    });
    
    // Add amenities to parks
    this.addAmenityToPark({ parkId: parqueMetropolitano.id, amenityId: 1 }); // Juegos infantiles
    this.addAmenityToPark({ parkId: parqueMetropolitano.id, amenityId: 2 }); // Baños públicos
    this.addAmenityToPark({ parkId: parqueMetropolitano.id, amenityId: 3 }); // Canchas deportivas
    this.addAmenityToPark({ parkId: parqueMetropolitano.id, amenityId: 4 }); // Ciclovías
    this.addAmenityToPark({ parkId: parqueMetropolitano.id, amenityId: 7 }); // Senderos para caminar
    this.addAmenityToPark({ parkId: parqueMetropolitano.id, amenityId: 8 }); // Estacionamiento
    this.addAmenityToPark({ parkId: parqueMetropolitano.id, amenityId: 9 }); // Áreas de picnic
    
    this.addAmenityToPark({ parkId: bosqueColomos.id, amenityId: 2 }); // Baños públicos
    this.addAmenityToPark({ parkId: bosqueColomos.id, amenityId: 5 }); // Zona para mascotas
    this.addAmenityToPark({ parkId: bosqueColomos.id, amenityId: 7 }); // Senderos para caminar
    
    this.addAmenityToPark({ parkId: parqueIndependencia.id, amenityId: 3 }); // Canchas deportivas
    this.addAmenityToPark({ parkId: parqueIndependencia.id, amenityId: 8 }); // Estacionamiento
    this.addAmenityToPark({ parkId: parqueIndependencia.id, amenityId: 12 }); // Iluminación
    
    // Add documents to parks
    this.createDocument({
      parkId: parqueMetropolitano.id,
      title: "Reglamento interno.pdf",
      fileUrl: "/documents/reglamento-metropolitano.pdf",
      fileSize: "356 KB",
      fileType: "application/pdf"
    });
    
    this.createDocument({
      parkId: parqueMetropolitano.id,
      title: "Plan maestro.pdf",
      fileUrl: "/documents/plan-maestro-metropolitano.pdf",
      fileSize: "2.4 MB",
      fileType: "application/pdf"
    });
    
    // Add activities to parks
    const now = new Date();
    const futureDate1 = new Date();
    futureDate1.setDate(now.getDate() + 15);
    const futureDate2 = new Date();
    futureDate2.setDate(now.getDate() + 7);
    
    this.createActivity({
      parkId: parqueMetropolitano.id,
      title: "Maratón Verde 10K",
      description: "Carrera anual por los senderos del parque. Inscripciones abiertas.",
      startDate: futureDate1,
      category: "Deportivo"
    });
    
    this.createActivity({
      parkId: parqueMetropolitano.id,
      title: "Taller de Huertos Urbanos",
      description: "Aprende a crear tu propio huerto en casa. Cupo limitado.",
      startDate: futureDate2,
      category: "Educativo"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
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

  async getParks(filters?: Partial<{
    municipalityId: number;
    parkType: string;
    postalCode: string;
    amenities: number[];
    search: string;
  }>): Promise<Park[]> {
    let parks = Array.from(this.parks.values());
    
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
    return this.parks.delete(id);
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
    if (!incident) return undefined;
    
    const updatedAt = new Date();
    const updatedIncident = { ...incident, status, updatedAt };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }
}

export const storage = new MemStorage();
