import { db } from './db';
import { adCampaigns, adSpaces, advertisements, adPlacements } from '../shared/advertising-schema';

export async function initializeAdvertisingTables() {
  try {
    console.log('🎯 Inicializando sistema de publicidad...');
    
    // Crear espacios publicitarios predefinidos
    const defaultSpaces = [
      {
        spaceKey: 'header_banner',
        name: 'Banner Superior',
        description: 'Banner horizontal en la parte superior de todas las páginas',
        dimensions: '1200x90',
        locationType: 'header',
        pageTypes: ['home', 'parks', 'species', 'activities', 'concessions', 'instructors'],
        maxAds: 1
      },
      {
        spaceKey: 'sidebar_primary',
        name: 'Sidebar Principal',
        description: 'Espacio publicitario principal en el sidebar derecho',
        dimensions: '300x250',
        locationType: 'sidebar',
        pageTypes: ['parks', 'species', 'activities', 'concessions'],
        maxAds: 1
      },
      {
        spaceKey: 'sidebar_secondary',
        name: 'Sidebar Secundario',
        description: 'Espacio publicitario secundario en el sidebar',
        dimensions: '300x100',
        locationType: 'sidebar',
        pageTypes: ['parks', 'species', 'activities', 'concessions'],
        maxAds: 1
      },
      {
        spaceKey: 'content_inline',
        name: 'Contenido Inline',
        description: 'Anuncio integrado dentro del contenido principal',
        dimensions: '728x90',
        locationType: 'content',
        pageTypes: ['parks', 'species', 'activities', 'concessions'],
        maxAds: 1
      },
      {
        spaceKey: 'footer_banner',
        name: 'Banner Inferior',
        description: 'Banner horizontal en el pie de página',
        dimensions: '728x90',
        locationType: 'footer',
        pageTypes: ['home', 'parks', 'species', 'activities', 'concessions'],
        maxAds: 1
      },
      {
        spaceKey: 'modal_interstitial',
        name: 'Modal Interstitial',
        description: 'Anuncio modal que aparece entre páginas',
        dimensions: '400x300',
        locationType: 'modal',
        pageTypes: ['all'],
        maxAds: 1
      },
      {
        spaceKey: 'home_carousel',
        name: 'Carousel Principal',
        description: 'Carousel de banners en la página principal',
        dimensions: '1200x400',
        locationType: 'carousel',
        pageTypes: ['home'],
        maxAds: 5
      },
      {
        spaceKey: 'species_detail_top',
        name: 'Detalle Especies - Superior',
        description: 'Espacio publicitario en páginas de especies arbóreas',
        dimensions: '728x90',
        locationType: 'content',
        pageTypes: ['species'],
        maxAds: 1
      },
      {
        spaceKey: 'species_detail_bottom',
        name: 'Detalle Especies - Inferior',
        description: 'Espacio publicitario inferior en páginas de especies',
        dimensions: '728x90',
        locationType: 'content',
        pageTypes: ['species'],
        maxAds: 1
      },
      {
        spaceKey: 'parks_listing_top',
        name: 'Listado Parques - Superior',
        description: 'Banner en la parte superior del listado de parques',
        dimensions: '1200x90',
        locationType: 'content',
        pageTypes: ['parks'],
        maxAds: 1
      }
    ];

    // Insertar espacios publicitarios
    for (const space of defaultSpaces) {
      try {
        await db.insert(adSpaces).values(space).onConflictDoNothing();
        console.log(`✅ Espacio publicitario creado: ${space.name}`);
      } catch (error) {
        console.log(`⚠️ Espacio publicitario ya existe: ${space.name}`);
      }
    }

    // Crear campañas de ejemplo
    const sampleCampaigns = [
      {
        name: 'Campaña Eco-Turismo 2025',
        client: 'Secretaría de Turismo Jalisco',
        description: 'Promoción del turismo ecológico en parques urbanos',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        budget: 50000,
        priority: 5,
        status: 'active'
      },
      {
        name: 'Vida Saludable',
        client: 'Secretaría de Salud',
        description: 'Promoción de actividades físicas y vida saludable',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
        budget: 30000,
        priority: 4,
        status: 'active'
      },
      {
        name: 'Conservación Ambiental',
        client: 'SEMARNAT',
        description: 'Concientización sobre conservación del medio ambiente',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-11-30'),
        budget: 40000,
        priority: 5,
        status: 'active'
      },
      {
        name: 'Educación Ambiental',
        client: 'SEJ - Secretaría de Educación',
        description: 'Programas educativos sobre medio ambiente',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-08-31'),
        budget: 25000,
        priority: 3,
        status: 'active'
      }
    ];

    const createdCampaigns = [];
    for (const campaign of sampleCampaigns) {
      try {
        const [created] = await db.insert(adCampaigns).values(campaign).returning();
        createdCampaigns.push(created);
        console.log(`✅ Campaña creada: ${campaign.name}`);
      } catch (error) {
        console.log(`⚠️ Error creando campaña: ${campaign.name}`);
      }
    }

    // Crear anuncios de ejemplo
    if (createdCampaigns.length > 0) {
      const sampleAds = [
        {
          campaignId: createdCampaigns[0].id,
          title: 'Descubre la Naturaleza Urbana',
          content: 'Explora los hermosos parques de Guadalajara y conecta con la naturaleza',
          imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
          linkUrl: '/parks',
          type: 'banner',
          priority: 5,
          status: 'active'
        },
        {
          campaignId: createdCampaigns[1].id,
          title: 'Actividades Saludables',
          content: 'Únete a nuestras actividades físicas y mejora tu calidad de vida',
          imageUrl: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=800&h=400&fit=crop',
          linkUrl: '/activities',
          type: 'banner',
          priority: 4,
          status: 'active'
        },
        {
          campaignId: createdCampaigns[2].id,
          title: 'Cuida el Medio Ambiente',
          content: 'Aprende sobre nuestras especies arbóreas y su importancia',
          imageUrl: 'https://images.unsplash.com/photo-1574430424543-b5cce6e8e1a8?w=800&h=400&fit=crop',
          linkUrl: '/tree-species',
          type: 'banner',
          priority: 5,
          status: 'active'
        },
        {
          campaignId: createdCampaigns[3].id,
          title: 'Educación para Todos',
          content: 'Programas educativos sobre conservación y sustentabilidad',
          imageUrl: 'https://images.unsplash.com/photo-1560439513-74b037a25d84?w=800&h=400&fit=crop',
          linkUrl: '/education',
          type: 'banner',
          priority: 3,
          status: 'active'
        }
      ];

      const createdAds = [];
      for (const ad of sampleAds) {
        try {
          const [created] = await db.insert(advertisements).values(ad).returning();
          createdAds.push(created);
          console.log(`✅ Anuncio creado: ${ad.title}`);
        } catch (error) {
          console.log(`⚠️ Error creando anuncio: ${ad.title}`);
        }
      }

      // Crear asignaciones de ejemplo
      if (createdAds.length > 0) {
        const spaces = await db.select().from(adSpaces);
        const spacesMap = spaces.reduce((acc, space) => {
          acc[space.spaceKey] = space;
          return acc;
        }, {} as Record<string, any>);

        const samplePlacements = [
          {
            adId: createdAds[0].id,
            spaceId: spacesMap['header_banner']?.id,
            pageType: 'home',
            pageId: null,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31')
          },
          {
            adId: createdAds[1].id,
            spaceId: spacesMap['sidebar_primary']?.id,
            pageType: 'parks',
            pageId: null,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-06-30')
          },
          {
            adId: createdAds[2].id,
            spaceId: spacesMap['species_detail_top']?.id,
            pageType: 'species',
            pageId: null,
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-11-30')
          },
          {
            adId: createdAds[3].id,
            spaceId: spacesMap['content_inline']?.id,
            pageType: 'activities',
            pageId: null,
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-08-31')
          }
        ];

        for (const placement of samplePlacements) {
          if (placement.spaceId) {
            try {
              await db.insert(adPlacements).values(placement);
              console.log(`✅ Asignación creada para anuncio ID: ${placement.adId}`);
            } catch (error) {
              console.log(`⚠️ Error creando asignación para anuncio ID: ${placement.adId}`);
            }
          }
        }
      }
    }

    console.log('✅ Sistema de publicidad inicializado correctamente');
    
  } catch (error) {
    console.error('Error inicializando sistema de publicidad:', error);
  }
}