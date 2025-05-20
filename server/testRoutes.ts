import express, { Request, Response } from 'express';

// Crear un router para las rutas de prueba
const testRouter = express.Router();

// Ruta de prueba para el dashboard de voluntarios
testRouter.get("/dashboard-voluntario/:id", async (req: Request, res: Response) => {
  try {
    const volunteerId = req.params.id;
    console.log("Endpoint de prueba - Dashboard para voluntario ID:", volunteerId);
    
    // Datos simulados para pruebas del dashboard
    const dashboardData = {
      volunteerInfo: {
        id: Number(volunteerId),
        fullName: "Ana García Martínez",
        email: "ana.garcia@example.com",
        status: "Activo",
        totalHours: 120,
        joinDate: new Date(2023, 3, 15).toISOString(),
        profileImage: null
      },
      stats: {
        participations: {
          count: 15,
          totalHours: 120,
          avgHoursPerActivity: 8
        },
        evaluations: {
          avgPunctuality: 4.5,
          avgAttitude: 4.8,
          avgResponsibility: 4.2,
          avgOverall: 4.5
        },
        recognitions: {
          count: 3
        }
      },
      recentActivity: {
        participations: [
          {
            id: 1,
            activityName: "Limpieza del parque",
            activityDate: new Date(2023, 5, 10).toISOString(),
            hoursContributed: 4,
            parkId: 1,
            parkName: "Parque Metropolitano",
            role: "Voluntario",
            status: "Completado"
          },
          {
            id: 2,
            activityName: "Plantación de árboles",
            activityDate: new Date(2023, 4, 20).toISOString(),
            hoursContributed: 6,
            parkId: 2,
            parkName: "Parque Colomos",
            role: "Voluntario",
            status: "Completado"
          }
        ],
        evaluations: [
          {
            id: 1,
            evaluationDate: new Date(2023, 5, 15).toISOString(),
            punctuality: 5,
            attitude: 5,
            responsibility: 4,
            overallPerformance: 4.7,
            comments: "Excelente desempeño durante la limpieza del parque"
          },
          {
            id: 2,
            evaluationDate: new Date(2023, 4, 25).toISOString(),
            punctuality: 4,
            attitude: 5,
            responsibility: 4,
            overallPerformance: 4.3,
            comments: "Buena actitud y colaboración con el equipo"
          }
        ],
        recognitions: [
          {
            id: 1,
            recognitionType: "Voluntario del Mes",
            achievementDate: new Date(2023, 5, 30).toISOString(),
            description: "Por su dedicación y compromiso con el medio ambiente",
            createdAt: new Date(2023, 5, 30).toISOString()
          },
          {
            id: 2,
            recognitionType: "Mejor Equipo",
            achievementDate: new Date(2023, 4, 15).toISOString(),
            description: "Por coordinar eficientemente la plantación de árboles",
            createdAt: new Date(2023, 4, 15).toISOString()
          }
        ]
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error(`Error en endpoint de prueba:`, error);
    res.status(500).json({ message: "Error interno en el servidor" });
  }
});

export { testRouter };