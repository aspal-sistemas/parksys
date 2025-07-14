import { db } from './db';
import { 
  sponsorshipContracts, 
  sponsorEvents, 
  sponsorshipMetrics, 
  sponsorAssets, 
  sponsorshipEvaluations,
  sponsorshipRenewals,
  sponsorEventBenefits
} from '../shared/schema';

// Ejecutar el script si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdvancedSponsorshipTables().then(() => {
    console.log('✅ Script ejecutado exitosamente');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

/**
 * Script para crear las tablas avanzadas del sistema de patrocinios
 */
export async function createAdvancedSponsorshipTables() {
  try {
    console.log('🚀 Creando tablas avanzadas del sistema de patrocinios...');
    
    // Crear datos iniciales para contratos
    const initialContracts = [
      {
        sponsorId: 1,
        packageId: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 500000,
        status: 'active',
        terms: 'Contrato de patrocinio platino con beneficios completos',
        renewalNoticeDate: new Date('2024-10-01'),
        autoRenewal: true,
        contactPerson: 'María González',
        contactEmail: 'maria@empresa.com',
        contactPhone: '+52 33 1234-5678'
      },
      {
        sponsorId: 2,
        packageId: 2,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
        totalValue: 300000,
        status: 'active',
        terms: 'Contrato de patrocinio oro con activaciones especiales',
        renewalNoticeDate: new Date('2025-03-01'),
        autoRenewal: false,
        contactPerson: 'Carlos Mendoza',
        contactEmail: 'carlos@sponsor.com',
        contactPhone: '+52 33 2345-6789'
      }
    ];

    // Crear datos iniciales para eventos patrocinados
    const initialSponsorEvents = [
      {
        sponsorId: 1,
        eventId: 1,
        contractId: 1,
        sponsorshipLevel: 'principal',
        logoPlacement: 'primary',
        exposureMinutes: 30,
        standSize: 'premium',
        activationBudget: 50000,
        specialRequirements: 'Sonido profesional, iluminación LED',
        status: 'confirmed'
      },
      {
        sponsorId: 2,
        eventId: 2,
        contractId: 2,
        sponsorshipLevel: 'secundario',
        logoPlacement: 'secondary',
        exposureMinutes: 15,
        standSize: 'standard',
        activationBudget: 25000,
        specialRequirements: 'Material promocional, degustaciones',
        status: 'confirmed'
      }
    ];

    // Crear datos de métricas
    const initialMetrics = [
      {
        sponsorId: 1,
        eventId: 1,
        impressions: 25000,
        reach: 18000,
        engagement: 2500,
        leadsGenerated: 45,
        conversions: 12,
        brandMentions: 85,
        socialMediaReach: 12000,
        websiteClicks: 180,
        emailSignups: 35,
        measurementPeriod: 'monthly',
        reportDate: new Date('2024-01-31')
      },
      {
        sponsorId: 2,
        eventId: 2,
        impressions: 15000,
        reach: 11000,
        engagement: 1800,
        leadsGenerated: 28,
        conversions: 8,
        brandMentions: 52,
        socialMediaReach: 8500,
        websiteClicks: 120,
        emailSignups: 22,
        measurementPeriod: 'monthly',
        reportDate: new Date('2024-06-30')
      }
    ];

    // Crear datos de activos
    const initialAssets = [
      {
        sponsorId: 1,
        assetType: 'logo',
        assetName: 'Logo Principal',
        fileName: 'logo-principal.png',
        fileUrl: '/uploads/sponsor-assets/logo-principal.png',
        fileSize: 245760,
        specifications: 'PNG, 1200x400px, fondo transparente',
        approvalStatus: 'approved',
        usageRights: 'Uso exclusivo en eventos patrocinados',
        expirationDate: new Date('2024-12-31')
      },
      {
        sponsorId: 2,
        assetType: 'banner',
        assetName: 'Banner Promocional',
        fileName: 'banner-promo.jpg',
        fileUrl: '/uploads/sponsor-assets/banner-promo.jpg',
        fileSize: 512000,
        specifications: 'JPG, 2000x800px, alta resolución',
        approvalStatus: 'approved',
        usageRights: 'Uso en material promocional',
        expirationDate: new Date('2025-05-31')
      }
    ];

    // Crear datos de evaluaciones
    const initialEvaluations = [
      {
        sponsorId: 1,
        eventId: 1,
        overallSatisfaction: 9,
        valueForMoney: 8,
        organizationQuality: 9,
        audienceQuality: 8,
        communicationRating: 9,
        logisticsRating: 8,
        recommendationScore: 9,
        feedback: 'Excelente organización y gran alcance de audiencia. Muy satisfechos con los resultados.',
        improvements: 'Mejorar la señalización del stand',
        wouldRenew: true,
        evaluationDate: new Date('2024-02-15')
      },
      {
        sponsorId: 2,
        eventId: 2,
        overallSatisfaction: 7,
        valueForMoney: 7,
        organizationQuality: 8,
        audienceQuality: 7,
        communicationRating: 8,
        logisticsRating: 7,
        recommendationScore: 8,
        feedback: 'Buena experiencia general, audiencia comprometida.',
        improvements: 'Más tiempo de exposición, mejor ubicación del stand',
        wouldRenew: true,
        evaluationDate: new Date('2024-07-20')
      }
    ];

    // Insertar contratos
    for (const contract of initialContracts) {
      try {
        await db.insert(sponsorshipContracts).values(contract);
        console.log(`✅ Contrato creado para sponsor ID: ${contract.sponsorId}`);
      } catch (error) {
        console.log(`ℹ️  Contrato ya existe para sponsor ID: ${contract.sponsorId}`);
      }
    }

    // Insertar eventos patrocinados
    for (const sponsorEvent of initialSponsorEvents) {
      try {
        await db.insert(sponsorEvents).values(sponsorEvent);
        console.log(`✅ Evento patrocinado creado: Sponsor ${sponsorEvent.sponsorId} - Event ${sponsorEvent.eventId}`);
      } catch (error) {
        console.log(`ℹ️  Evento patrocinado ya existe`);
      }
    }

    // Insertar métricas
    for (const metric of initialMetrics) {
      try {
        await db.insert(sponsorshipMetrics).values(metric);
        console.log(`✅ Métricas creadas para sponsor ID: ${metric.sponsorId}`);
      } catch (error) {
        console.log(`ℹ️  Métricas ya existen para sponsor ID: ${metric.sponsorId}`);
      }
    }

    // Insertar activos
    for (const asset of initialAssets) {
      try {
        await db.insert(sponsorAssets).values(asset);
        console.log(`✅ Activo creado: ${asset.assetName} para sponsor ID: ${asset.sponsorId}`);
      } catch (error) {
        console.log(`ℹ️  Activo ya existe: ${asset.assetName}`);
      }
    }

    // Insertar evaluaciones
    for (const evaluation of initialEvaluations) {
      try {
        await db.insert(sponsorshipEvaluations).values(evaluation);
        console.log(`✅ Evaluación creada para sponsor ID: ${evaluation.sponsorId}`);
      } catch (error) {
        console.log(`ℹ️  Evaluación ya existe para sponsor ID: ${evaluation.sponsorId}`);
      }
    }

    console.log('✅ Tablas avanzadas del sistema de patrocinios creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error al crear tablas avanzadas de patrocinios:', error);
    throw error;
  }
}