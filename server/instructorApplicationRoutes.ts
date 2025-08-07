import type { Express } from "express";
import { z } from "zod";
import { db } from "./db";
import { instructorApplicationCampaigns, instructors, users } from "../shared/schema";
import { eq, and, desc, count } from "drizzle-orm";
import nodemailer from "nodemailer";
import { instructorApplicationSchema } from "../shared/schema";

// Configurar transporter de email
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export function registerInstructorApplicationRoutes(app: Express): void {
  
  // Endpoint público para obtener campañas activas
  app.get("/api/instructor-campaigns/active", async (req, res) => {
    try {
      const [activeCampaign] = await db
        .select()
        .from(instructorApplicationCampaigns)
        .where(eq(instructorApplicationCampaigns.isActive, true))
        .orderBy(desc(instructorApplicationCampaigns.createdAt))
        .limit(1);

      if (!activeCampaign) {
        return res.json({ campaign: null, isOpen: false });
      }

      // Verificar si la campaña está dentro del período válido
      const now = new Date();
      const isInPeriod = now >= activeCampaign.startDate && now <= activeCampaign.endDate;
      
      // Verificar si hay cupos disponibles
      const hasCapacity = !activeCampaign.maxApplications || 
                         activeCampaign.currentApplications < activeCampaign.maxApplications;

      res.json({
        campaign: activeCampaign,
        isOpen: isInPeriod && hasCapacity
      });

    } catch (error) {
      console.error("Error obteniendo campaña activa:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Endpoint público para aplicar como instructor
  app.post("/api/instructors/apply", async (req, res) => {
    try {
      // Validar datos de la aplicación
      const validatedData = instructorApplicationSchema.parse(req.body);
      
      // Verificar que la campaña existe y está activa
      const [campaign] = await db
        .select()
        .from(instructorApplicationCampaigns)
        .where(and(
          eq(instructorApplicationCampaigns.id, validatedData.applicationCampaignId),
          eq(instructorApplicationCampaigns.isActive, true)
        ))
        .limit(1);

      if (!campaign) {
        return res.status(400).json({ 
          error: "Campaña no encontrada o ya no está activa" 
        });
      }

      // Verificar que la campaña está en período válido
      const now = new Date();
      if (now < campaign.startDate || now > campaign.endDate) {
        return res.status(400).json({ 
          error: "La campaña no está en período de aplicaciones" 
        });
      }

      // Verificar cupos disponibles
      if (campaign.maxApplications && campaign.currentApplications >= campaign.maxApplications) {
        return res.status(400).json({ 
          error: "Ya no hay cupos disponibles en esta campaña" 
        });
      }

      // Verificar que el email no esté ya registrado
      const existingInstructor = await db
        .select()
        .from(instructors)
        .where(eq(instructors.email, validatedData.email))
        .limit(1);

      if (existingInstructor.length > 0) {
        return res.status(400).json({ 
          error: "Este email ya está registrado" 
        });
      }

      // Crear la aplicación con estado "pending"
      const [newApplication] = await db
        .insert(instructors)
        .values({
          ...validatedData,
          status: "pending"
        })
        .returning();

      // Incrementar contador de aplicaciones
      await db
        .update(instructorApplicationCampaigns)
        .set({ 
          currentApplications: campaign.currentApplications + 1 
        })
        .where(eq(instructorApplicationCampaigns.id, campaign.id));

      // Enviar email de confirmación al candidato
      try {
        const transporter = createEmailTransporter();

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: validatedData.email,
          subject: 'Aplicación Recibida - Programa de Instructores ParkSys',
          html: `
            <h2>¡Tu aplicación ha sido recibida!</h2>
            <p>Hola ${validatedData.fullName},</p>
            <p>Hemos recibido tu aplicación para ser instructor en ParkSys.</p>
            <p><strong>Campaña:</strong> ${campaign.title}</p>
            <p>Tu aplicación será evaluada por nuestro equipo y te notificaremos el resultado por este medio.</p>
            <p>Gracias por tu interés en formar parte de nuestro equipo de instructores.</p>
            <br>
            <p>Atentamente,<br>Equipo ParkSys</p>
          `
        });

        console.log(`✅ Email de confirmación enviado a ${validatedData.email}`);
      } catch (emailError) {
        console.error("Error enviando email de confirmación:", emailError);
        // No fallar la aplicación si el email falla
      }

      res.status(201).json({
        message: "Aplicación enviada exitosamente",
        applicationId: newApplication.id,
        campaign: campaign.title
      });

    } catch (error) {
      console.error("Error procesando aplicación:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Endpoints administrativos (requieren autenticación)
  
  // Listar todas las aplicaciones pendientes
  app.get("/api/instructor-applications/pending", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const pendingApplications = await db
        .select({
          id: instructors.id,
          fullName: instructors.fullName,
          email: instructors.email,
          phone: instructors.phone,
          experienceYears: instructors.experienceYears,
          specialties: instructors.specialties,
          bio: instructors.bio,
          applicationDate: instructors.applicationDate,
          campaignTitle: instructorApplicationCampaigns.title
        })
        .from(instructors)
        .leftJoin(
          instructorApplicationCampaigns, 
          eq(instructors.applicationCampaignId, instructorApplicationCampaigns.id)
        )
        .where(eq(instructors.status, "pending"))
        .orderBy(desc(instructors.applicationDate));

      res.json(pendingApplications);

    } catch (error) {
      console.error("Error obteniendo aplicaciones pendientes:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Evaluar una aplicación (aprobar o rechazar)
  app.put("/api/instructor-applications/:id/evaluate", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const { id } = req.params;
      const { decision, notes } = req.body; // decision: "approved" | "rejected"

      if (!["approved", "rejected"].includes(decision)) {
        return res.status(400).json({ 
          error: "Decisión inválida. Use 'approved' o 'rejected'" 
        });
      }

      // Buscar la aplicación
      const [application] = await db
        .select()
        .from(instructors)
        .where(and(
          eq(instructors.id, parseInt(id)),
          eq(instructors.status, "pending")
        ))
        .limit(1);

      if (!application) {
        return res.status(404).json({ 
          error: "Aplicación no encontrada o ya evaluada" 
        });
      }

      // Actualizar el estado
      const newStatus = decision === "approved" ? "active" : "rejected";
      
      await db
        .update(instructors)
        .set({
          status: newStatus,
          evaluatedBy: req.user.id,
          evaluatedAt: new Date(),
          evaluationNotes: notes || null
        })
        .where(eq(instructors.id, parseInt(id)));

      // Enviar email de notificación al candidato
      try {
        const transporter = createEmailTransporter();
        const isApproved = decision === "approved";

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: application.email,
          subject: `Resultado de tu aplicación - Programa de Instructores ParkSys`,
          html: `
            <h2>${isApproved ? '¡Felicidades!' : 'Resultado de tu aplicación'}</h2>
            <p>Hola ${application.fullName},</p>
            ${isApproved 
              ? `<p>¡Excelentes noticias! Tu aplicación para ser instructor ha sido <strong>aprobada</strong>.</p>
                 <p>Pronto nos pondremos en contacto contigo para los siguientes pasos.</p>`
              : `<p>Gracias por tu interés en ser instructor. En esta ocasión tu aplicación no fue seleccionada.</p>
                 <p>Te invitamos a estar atento a futuras convocatorias.</p>`
            }
            ${notes ? `<p><strong>Comentarios:</strong> ${notes}</p>` : ''}
            <p>Atentamente,<br>Equipo ParkSys</p>
          `
        });

        console.log(`✅ Email de resultado enviado a ${application.email}`);
      } catch (emailError) {
        console.error("Error enviando email de resultado:", emailError);
      }

      res.json({
        message: `Aplicación ${decision === "approved" ? "aprobada" : "rechazada"} exitosamente`,
        applicationId: parseInt(id),
        newStatus
      });

    } catch (error) {
      console.error("Error evaluando aplicación:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Gestión de campañas (solo usuarios autenticados)
  
  // Crear nueva campaña
  app.post("/api/instructor-campaigns", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const campaignData = req.body;
      
      const [newCampaign] = await db
        .insert(instructorApplicationCampaigns)
        .values({
          ...campaignData,
          createdBy: req.user.id
        })
        .returning();

      res.status(201).json(newCampaign);

    } catch (error) {
      console.error("Error creando campaña:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Listar todas las campañas
  app.get("/api/instructor-campaigns", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const campaigns = await db
        .select()
        .from(instructorApplicationCampaigns)
        .orderBy(desc(instructorApplicationCampaigns.createdAt));

      res.json(campaigns);

    } catch (error) {
      console.error("Error obteniendo campañas:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  console.log("✅ Rutas de aplicaciones de instructores registradas");
}