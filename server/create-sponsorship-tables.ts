import { db } from './db';
import { sponsorshipPackages, sponsors, sponsorshipCampaigns } from '../shared/schema';

/**
 * Script para crear las tablas del sistema de patrocinios y agregar datos iniciales
 */
export async function createSponsorshipTables() {
  try {
    console.log('🎯 Inicializando tablas del sistema de patrocinios...');
    
    // Crear datos iniciales para paquetes de patrocinio
    const initialPackages = [
      {
        name: "Paquete Platino",
        level: "platino",
        price: "500000",
        duration: 12,
        benefits: [
          "Logo principal en todos los eventos",
          "Stand exclusivo premium",
          "Menciones en redes sociales",
          "Activaciones especiales",
          "Reportes mensuales detallados",
          "Acceso VIP a eventos"
        ],
        eventsIncluded: 15,
        exposureLevel: "premium",
        isActive: true
      },
      {
        name: "Paquete Oro",
        level: "oro",
        price: "300000",
        duration: 12,
        benefits: [
          "Logo destacado en eventos",
          "Stand premium",
          "Menciones en redes sociales",
          "Reportes trimestrales",
          "Activaciones comerciales"
        ],
        eventsIncluded: 10,
        exposureLevel: "alto",
        isActive: true
      },
      {
        name: "Paquete Plata",
        level: "plata",
        price: "150000",
        duration: 12,
        benefits: [
          "Logo en materiales promocionales",
          "Stand estándar",
          "Menciones ocasionales",
          "Reportes semestrales"
        ],
        eventsIncluded: 6,
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
    
    // Insertar patrocinadores iniciales
    for (const sponsor of initialSponsors) {
      try {
        await db.insert(sponsors).values(sponsor);
        console.log(`✅ Patrocinador creado: ${sponsor.name}`);
      } catch (error) {
        console.log(`ℹ️  Patrocinador ya existe: ${sponsor.name}`);
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