import { Request, Response } from 'express';

/**
 * Este endpoint devuelve datos de ejemplo para la página de evaluaciones
 * cuando la base de datos tiene problemas
 */
export async function getExampleInstructorEvaluations(req: Request, res: Response) {
  try {
    // Devolvemos datos de ejemplo estáticos
    const exampleData = [
      {
        id: 1,
        instructor_id: 1,
        assignment_id: 1,
        evaluator_id: 1,
        created_at: new Date().toISOString(),
        evaluation_date: new Date().toISOString(),
        knowledge: 5,
        communication: 5,
        methodology: 4,
        overall_performance: 5,
        comments: "Excelente instructor. Los participantes quedaron muy satisfechos con la actividad.",
        instructor_name: "Carlos Rodríguez",
        instructor_profile_image_url: "https://i.pravatar.cc/150?img=1",
        activity_title: "Taller de Yoga en el Parque",
        evaluator_type: "supervisor",
        follow_up_required: false,
        follow_up_notes: "",
        professionalism: 5,
        teaching_clarity: 4,
        active_participation: 5,
        group_management: 4
      },
      {
        id: 2,
        instructor_id: 2,
        assignment_id: 2,
        evaluator_id: 1,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        evaluation_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        knowledge: 4,
        communication: 5,
        methodology: 5,
        overall_performance: 4,
        comments: "Muy buen manejo de grupo y excelente comunicación con los participantes.",
        instructor_name: "Ana Martínez",
        instructor_profile_image_url: "https://i.pravatar.cc/150?img=5",
        activity_title: "Clases de Pintura al Aire Libre",
        evaluator_type: "supervisor",
        follow_up_required: false,
        follow_up_notes: "",
        professionalism: 4,
        teaching_clarity: 5,
        active_participation: 5,
        group_management: 4
      },
      {
        id: 3,
        instructor_id: 3,
        assignment_id: 3,
        evaluator_id: 1,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        evaluation_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        knowledge: 5,
        communication: 4,
        methodology: 5,
        overall_performance: 5,
        comments: "Excelente conocimiento del tema y buena metodología de enseñanza.",
        instructor_name: "Roberto García",
        instructor_profile_image_url: "https://i.pravatar.cc/150?img=3",
        activity_title: "Taller de Jardinería Urbana",
        evaluator_type: "supervisor",
        follow_up_required: false,
        follow_up_notes: "",
        professionalism: 5,
        teaching_clarity: 5,
        active_participation: 4,
        group_management: 5
      },
      {
        id: 4,
        instructor_id: 4,
        assignment_id: 4,
        evaluator_id: 1,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        evaluation_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        knowledge: 4,
        communication: 4,
        methodology: 4,
        overall_performance: 4,
        comments: "Buena actividad en general, con oportunidades de mejora en la organización del tiempo.",
        instructor_name: "Laura González",
        instructor_profile_image_url: "https://i.pravatar.cc/150?img=9",
        activity_title: "Curso de Compostaje Doméstico",
        evaluator_type: "supervisor",
        follow_up_required: true,
        follow_up_notes: "Programar sesión de seguimiento para mejorar técnicas de enseñanza.",
        professionalism: 4,
        teaching_clarity: 4,
        active_participation: 4,
        group_management: 4
      },
      {
        id: 5,
        instructor_id: 5,
        assignment_id: 5,
        evaluator_id: 1,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        evaluation_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        knowledge: 5,
        communication: 5,
        methodology: 5,
        overall_performance: 5,
        comments: "Excelente manejo del grupo y gran conocimiento del tema. Los participantes quedaron muy satisfechos.",
        instructor_name: "Miguel Hernández",
        instructor_profile_image_url: "https://i.pravatar.cc/150?img=12",
        activity_title: "Taller de Reciclaje Creativo",
        evaluator_type: "supervisor",
        follow_up_required: false,
        follow_up_notes: "",
        professionalism: 5,
        teaching_clarity: 5,
        active_participation: 5,
        group_management: 5
      }
    ];
    
    console.log("Enviando datos de ejemplo para evaluaciones");
    return res.json(exampleData);
  } catch (error) {
    console.error("Error al generar datos de ejemplo:", error);
    res.status(500).json({ message: "Error al generar datos de ejemplo" });
  }
}

/**
 * Este endpoint simula la creación de nuevas evaluaciones de muestra
 */
export async function createExampleInstructorEvaluations(req: Request, res: Response) {
  try {
    console.log("Simulando creación de datos de muestra para evaluaciones");
    
    // Simplemente devolvemos un éxito simulado
    return res.json({ 
      success: true, 
      message: "Datos de ejemplo generados correctamente", 
      count: 5
    });
  } catch (error) {
    console.error("Error al generar datos de ejemplo:", error);
    res.status(500).json({ message: "Error al generar datos de ejemplo" });
  }
}