// Datos temporales mientras se resuelve la conectividad de la base de datos
export const fallbackParks = [
  {
    id: 1,
    name: "Parque Agua Azul",
    description: "Parque histórico en el corazón de Guadalajara con jardines botánicos, lago artificial y áreas recreativas familiares.",
    address: "Calzada Independencia Sur 973, Guadalajara, Jalisco",
    latitude: 20.6736,
    longitude: -103.3370,
    type: "urbano",
    size: 168000,
    municipalityId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    primaryImageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop", isPrimary: true }
    ],
    amenities: [
      { id: 1, name: "Lago artificial", icon: "🏊" },
      { id: 2, name: "Jardín botánico", icon: "🌸" },
      { id: 3, name: "Área de juegos", icon: "🎠" },
      { id: 4, name: "Senderos", icon: "🚶" }
    ],
    activities: []
  },
  {
    id: 2,
    name: "Parque Metropolitano",
    description: "Amplio parque metropolitano con instalaciones deportivas, teatro al aire libre y espacios para eventos masivos.",
    address: "Av. Patria 1891, Zapopan, Jalisco",
    latitude: 20.7114,
    longitude: -103.4203,
    type: "metropolitano",
    size: 320000,
    municipalityId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    primaryImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    images: [
      { id: 2, url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", isPrimary: true }
    ],
    amenities: [
      { id: 5, name: "Teatro al aire libre", icon: "🎭" },
      { id: 6, name: "Canchas deportivas", icon: "⚽" },
      { id: 7, name: "Ciclovía", icon: "🚴" },
      { id: 8, name: "Estacionamiento", icon: "🚗" }
    ],
    activities: []
  },
  {
    id: 3,
    name: "Parque Lineal Río Santiago",
    description: "Parque lineal a lo largo del río con senderos ecológicos, miradores y áreas de contemplación de la naturaleza.",
    address: "Río Santiago, Tonalá, Jalisco",
    latitude: 20.6211,
    longitude: -103.2441,
    type: "lineal",
    size: 45000,
    municipalityId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    primaryImageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop",
    images: [
      { id: 3, url: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop", isPrimary: true }
    ],
    amenities: [
      { id: 9, name: "Senderos ecológicos", icon: "🌿" },
      { id: 10, name: "Miradores", icon: "👁️" },
      { id: 11, name: "Puentes peatonales", icon: "🌉" },
      { id: 12, name: "Áreas de descanso", icon: "🪑" }
    ],
    activities: []
  },
  {
    id: 4,
    name: "Parque Vecinal Las Flores",
    description: "Parque comunitario con juegos infantiles, canchas de básquetbol y espacios verdes para la convivencia familiar.",
    address: "Calle Las Flores 234, Tlaquepaque, Jalisco",
    latitude: 20.6401,
    longitude: -103.3158,
    type: "vecinal",
    size: 8500,
    municipalityId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    primaryImageUrl: "https://images.unsplash.com/photo-1520637836862-4d197d17c17a?w=800&h=600&fit=crop",
    images: [
      { id: 4, url: "https://images.unsplash.com/photo-1520637836862-4d197d17c17a?w=800&h=600&fit=crop", isPrimary: true }
    ],
    amenities: [
      { id: 13, name: "Juegos infantiles", icon: "🎈" },
      { id: 14, name: "Cancha de básquetbol", icon: "🏀" },
      { id: 15, name: "Áreas verdes", icon: "🌱" },
      { id: 16, name: "Bancas", icon: "🪑" }
    ],
    activities: []
  },
  {
    id: 5,
    name: "Parque de Bolsillo Centro",
    description: "Pequeño oasis verde en el centro histórico con fuentes, jardines temáticos y espacios de lectura al aire libre.",
    address: "Calle Morelos 145, Centro, Guadalajara, Jalisco",
    latitude: 20.6736,
    longitude: -103.3448,
    type: "bolsillo",
    size: 1200,
    municipalityId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    primaryImageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
    images: [
      { id: 5, url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop", isPrimary: true }
    ],
    amenities: [
      { id: 17, name: "Fuentes", icon: "⛲" },
      { id: 18, name: "Jardines temáticos", icon: "🌺" },
      { id: 19, name: "Área de lectura", icon: "📚" },
      { id: 20, name: "WiFi gratuito", icon: "📶" }
    ],
    activities: []
  }
];

export const fallbackAmenities = [
  { id: 1, name: "Lago artificial", icon: "🏊", createdAt: new Date() },
  { id: 2, name: "Jardín botánico", icon: "🌸", createdAt: new Date() },
  { id: 3, name: "Área de juegos", icon: "🎠", createdAt: new Date() },
  { id: 4, name: "Senderos", icon: "🚶", createdAt: new Date() },
  { id: 5, name: "Teatro al aire libre", icon: "🎭", createdAt: new Date() },
  { id: 6, name: "Canchas deportivas", icon: "⚽", createdAt: new Date() },
  { id: 7, name: "Ciclovía", icon: "🚴", createdAt: new Date() },
  { id: 8, name: "Estacionamiento", icon: "🚗", createdAt: new Date() },
  { id: 9, name: "Senderos ecológicos", icon: "🌿", createdAt: new Date() },
  { id: 10, name: "Miradores", icon: "👁️", createdAt: new Date() },
  { id: 11, name: "Puentes peatonales", icon: "🌉", createdAt: new Date() },
  { id: 12, name: "Áreas de descanso", icon: "🪑", createdAt: new Date() },
  { id: 13, name: "Juegos infantiles", icon: "🎈", createdAt: new Date() },
  { id: 14, name: "Cancha de básquetbol", icon: "🏀", createdAt: new Date() },
  { id: 15, name: "Áreas verdes", icon: "🌱", createdAt: new Date() },
  { id: 16, name: "Bancas", icon: "🪑", createdAt: new Date() },
  { id: 17, name: "Fuentes", icon: "⛲", createdAt: new Date() },
  { id: 18, name: "Jardines temáticos", icon: "🌺", createdAt: new Date() },
  { id: 19, name: "Área de lectura", icon: "📚", createdAt: new Date() },
  { id: 20, name: "WiFi gratuito", icon: "📶", createdAt: new Date() }
];