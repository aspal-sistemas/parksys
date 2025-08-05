import { db } from './db';
import { sponsorshipPackages, sponsors, sponsorshipCampaigns } from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Script para crear las tablas del sistema de patrocinios y agregar datos iniciales
 */
export async function createSponsorshipTables() {
  try {
    console.log('🎯 Inicializando tablas del sistema de patrocinios...');
    
    // Crear datos iniciales para paquetes de patrocinio - Sistema de 10 niveles inspirado en fauna silvestre
    const initialPackages = [
      {
        name: "Paquete Jaguar",
        category: "jaguar",
        price: "1200000",
        duration: 12,
        benefits: [
          "Patrocinio principal exclusivo en todos los eventos",
          "Stand premium VIP con ubicación privilegiada",
          "Branding completo en materiales oficiales",
          "Campañas publicitarias personalizadas",
          "Reportes semanales y análisis detallados",
          "Acceso a eventos privados y networking exclusivo",
          "Reconocimiento como guardián supremo de los parques"
        ],
        isActive: true
      },
      {
        name: "Paquete León",
        category: "león",
        price: "900000",
        duration: 12,
        benefits: [
          "Patrocinio principal en eventos masivos",
          "Stand VIP premium",
          "Logo prominente en toda comunicación",
          "Activaciones especiales trimestrales",
          "Reportes mensuales ejecutivos",
          "Acceso VIP a inauguraciones",
          "Título de rey de la conservación"
        ],
        isActive: true
      },
      {
        name: "Paquete Águila",
        category: "águila",
        price: "650000",
        duration: 12,
        benefits: [
          "Patrocinio destacado en eventos principales",
          "Stand premium con vista privilegiada",
          "Presencia en campañas digitales",
          "Reportes mensuales detallados",
          "Acceso a eventos especiales",
          "Reconocimiento como visionario supremo"
        ],
        isActive: true
      },
      {
        name: "Paquete Lobo",
        category: "lobo",
        price: "450000",
        duration: 12,
        benefits: [
          "Patrocinio en eventos selectos",
          "Stand estratégico premium",
          "Menciones en redes sociales",
          "Reportes bimestrales",
          "Activaciones grupales",
          "Liderazgo de manada reconocido"
        ],
        isActive: true
      },
      {
        name: "Paquete Ciervo",
        category: "ciervo",
        price: "300000",
        duration: 12,
        benefits: [
          "Patrocinio en eventos comunitarios",
          "Stand destacado",
          "Presencia en material promocional",
          "Reportes trimestrales",
          "Participación en actividades especiales",
          "Estatus de benefactor destacado"
        ],
        isActive: true
      },
      {
        name: "Paquete Conejo",
        category: "conejo",
        price: "200000",
        duration: 12,
        benefits: [
          "Patrocinio en eventos familiares",
          "Stand estándar premium",
          "Logo en materiales selectos",
          "Reportes trimestrales",
          "Acceso a eventos comunitarios",
          "Reconocimiento como patrocinador comprometido"
        ],
        isActive: true
      },
      {
        name: "Paquete Ardilla",
        category: "ardilla", 
        price: "125000",
        duration: 12,
        benefits: [
          "Patrocinio en eventos locales",
          "Stand estándar",
          "Menciones en comunicaciones",
          "Reportes semestrales",
          "Participación en actividades educativas",
          "Estatus de socio estratégico"
        ],
        isActive: true
      },
      {
        name: "Paquete Colibrí",
        category: "colibrí",
        price: "75000",
        duration: 12,
        benefits: [
          "Patrocinio en eventos específicos",
          "Espacio de exhibición",
          "Logo en materiales básicos",
          "Reportes semestrales",
          "Acceso a eventos educativos",
          "Reconocimiento como aliado ágil"
        ],
        isActive: true
      },
      {
        name: "Paquete Abeja",
        category: "abeja",
        price: "50000",
        duration: 12,
        benefits: [
          "Patrocinio en actividades ambientales",
          "Espacio básico de exhibición",
          "Menciones ocasionales",
          "Reportes anuales",
          "Participación en programas de voluntariado",
          "Estatus de contribuidor activo"
        ],
        isActive: true
      },
      {
        name: "Paquete Hormiga",
        category: "hormiga",
        price: "25000",
        duration: 12,
        benefits: [
          "Patrocinio en eventos comunitarios básicos",
          "Reconocimiento en materiales impresos",
          "Reportes anuales básicos",
          "Acceso a eventos públicos",
          "Certificado de colaborador básico"
        ],
        isActive: true
      }: 6,
        exposureLevel: "medio",
        isActive: true
      },
      {
        name: "Paquete Bronce",
        level: "bronce",
        price: "75000",
        duration: 12,
        benefits: [
          "Logo en materiales básicos",
          "Espacio de exhibición",
          "Reportes anuales"
        ],
        eventsIncluded: 3,
        exposureLevel: "bajo",
        isActive: true
      }
    ];
    
    // Insertar paquetes iniciales
    for (const pkg of initialPackages) {
      try {
        await db.insert(sponsorshipPackages).values(pkg);
        console.log(`✅ Paquete creado: ${pkg.name}`);
      } catch (error) {
        // Si ya existe, continuar
        console.log(`ℹ️  Paquete ya existe: ${pkg.name}`);
      }
    }
    
    // Crear datos iniciales para patrocinadores
    const initialSponsors = [
      {
        name: "Coca-Cola FEMSA",
        category: "corporativo",
        logo: "/api/placeholder/100/50",
        representative: "María García",
        email: "maria.garcia@cocacola.com",
        phone: "+52 33 1234-5678",
        address: "Av. López Mateos 2375, Guadalajara",
        status: "activo",
        level: "platino",
        contractValue: "500000",
        contractStart: "2025-01-01",
        contractEnd: "2025-12-31",
        eventsSponsored: 12,
        renewalProbability: 95,
        notes: "Excelente relación, renovación casi segura"
      },
      {
        name: "Banco Santander",
        category: "corporativo",
        logo: "/api/placeholder/100/50",
        representative: "Carlos Mendoza",
        email: "carlos.mendoza@santander.com.mx",
        phone: "+52 33 2345-6789",
        address: "Av. Vallarta 1020, Guadalajara",
        status: "activo",
        level: "oro",
        contractValue: "300000",
        contractStart: "2025-01-01",
        contractEnd: "2025-12-31",
        eventsSponsored: 8,
        renewalProbability: 85,
        notes: "Interesados en aumentar presencia"
      },
      {
        name: "Farmacias Guadalajara",
        category: "local",
        logo: "/api/placeholder/100/50",
        representative: "Ana López",
        email: "ana.lopez@farmaciasguadalajara.com",
        phone: "+52 33 3456-7890",
        address: "Av. México 2847, Guadalajara",
        status: "activo",
        level: "plata",
        contractValue: "150000",
        contractStart: "2025-01-01",
        contractEnd: "2025-12-31",
        eventsSponsored: 6,
        renewalProbability: 78,
        notes: "Patrocinador local comprometido"
      },
      {
        name: "Universidad de Guadalajara",
        category: "institucional",
        logo: "/api/placeholder/100/50",
        representative: "Dr. Roberto Silva",
        email: "roberto.silva@udg.mx",
        phone: "+52 33 4567-8901",
        address: "Av. Juárez 976, Guadalajara",
        status: "renovacion",
        level: "oro",
        contractValue: "200000",
        contractStart: "2024-01-01",
        contractEnd: "2024-12-31",
        eventsSponsored: 10,
        renewalProbability: 70,
        notes: "En proceso de renovación para 2025"
      },
      {
        name: "Telmex",
        category: "corporativo",
        logo: "/api/placeholder/100/50",
        representative: "Patricia Ruiz",
        email: "patricia.ruiz@telmex.com",
        phone: "+52 33 5678-9012",
        address: "Av. Americas 1500, Guadalajara",
        status: "potencial",
        level: "plata",
        contractValue: "180000",
        contractStart: "2025-06-01",
        contractEnd: "2026-05-31",
        eventsSponsored: 0,
        renewalProbability: 60,
        notes: "Propuesta enviada, en evaluación"
      }
    ];
    
    // Insertar patrocinadores iniciales (solo si no existen)
    for (const sponsor of initialSponsors) {
      try {
        // Verificar si el patrocinador ya existe
        const existing = await db.select().from(sponsors).where(eq(sponsors.name, sponsor.name));
        
        if (existing.length === 0) {
          await db.insert(sponsors).values(sponsor);
          console.log(`✅ Patrocinador creado: ${sponsor.name}`);
        } else {
          console.log(`ℹ️  Patrocinador ya existe: ${sponsor.name}`);
        }
      } catch (error) {
        console.log(`⚠️  Error al crear/verificar patrocinador ${sponsor.name}:`, error);
      }
    }
    
    // Crear datos iniciales para campañas
    const initialCampaigns = [
      {
        name: "Temporada Primavera 2025",
        startDate: "2025-03-01",
        endDate: "2025-05-31",
        budget: "800000",
        sponsorsCount: 8,
        revenue: "950000",
        status: "activa",
        events: ["Festival de Primavera", "Día del Niño", "Concierto al Aire Libre"]
      },
      {
        name: "Verano en los Parques",
        startDate: "2025-06-01",
        endDate: "2025-08-31",
        budget: "1200000",
        sponsorsCount: 12,
        revenue: "1350000",
        status: "planificacion",
        events: ["Cine bajo las Estrellas", "Clases de Yoga", "Festival de Música"]
      }
    ];
    
    // Insertar campañas iniciales
    for (const campaign of initialCampaigns) {
      try {
        await db.insert(sponsorshipCampaigns).values(campaign);
        console.log(`✅ Campaña creada: ${campaign.name}`);
      } catch (error) {
        console.log(`ℹ️  Campaña ya existe: ${campaign.name}`);
      }
    }
    
    console.log('✅ Tablas del sistema de patrocinios inicializadas correctamente');
    
  } catch (error) {
    console.error('❌ Error al inicializar tablas del sistema de patrocinios:', error);
    throw error;
  }
}