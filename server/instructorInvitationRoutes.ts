import type { Express } from "express";
import { z } from "zod";
import { db } from "./db";
import { instructorInvitations, instructors, users } from "../shared/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

// Schema de validación para invitaciones
const createInvitationSchema = z.object({
  email: z.string().email("Email inválido"),
});

const registerInstructorSchema = z.object({
  fullName: z.string().min(1, "Nombre completo requerido"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  age: z.number().min(18).max(80).optional(),
  gender: z.enum(["masculino", "femenino", "otro"]).optional(),
  address: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  experienceYears: z.number().min(0).max(50).default(0),
  availableDays: z.array(z.string()).optional(),
  availableHours: z.string().optional(),
  preferredParkId: z.number().optional(),
  bio: z.string().optional(),
  qualifications: z.string().optional(),
  profileImageUrl: z.string().optional(),
  curriculumUrl: z.string().optional(),
  hourlyRate: z.number().min(0).default(0),
});

// Configurar transporter de email (puedes usar tu configuración existente)
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export function registerInstructorInvitationRoutes(app: Express): void {
  
  // Endpoint para crear invitaciones (solo usuarios autenticados)
  app.post("/api/instructor-invitations", async (req, res) => {
    try {
      // Validar autenticación
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const validatedData = createInvitationSchema.parse(req.body);
      
      // Verificar que el email no esté ya invitado o registrado
      const existingInvitation = await db
        .select()
        .from(instructorInvitations)
        .where(eq(instructorInvitations.email, validatedData.email))
        .limit(1);

      if (existingInvitation.length > 0) {
        return res.status(400).json({ error: "Este email ya tiene una invitación pendiente" });
      }

      const existingInstructor = await db
        .select()
        .from(instructors)
        .where(eq(instructors.email, validatedData.email))
        .limit(1);

      if (existingInstructor.length > 0) {
        return res.status(400).json({ error: "Este email ya está registrado como instructor" });
      }

      // Generar token único
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

      // Crear invitación
      const [invitation] = await db
        .insert(instructorInvitations)
        .values({
          email: validatedData.email,
          invitationToken: token,
          invitedBy: req.user.id,
          expiresAt,
        })
        .returning();

      // Enviar email de invitación
      try {
        const transporter = createEmailTransporter();
        const registrationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/instructors/register?token=${token}`;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: validatedData.email,
          subject: 'Invitación para registrarte como Instructor - ParkSys',
          html: `
            <h2>¡Te hemos invitado a ser Instructor!</h2>
            <p>Has sido invitado a registrarte como instructor en ParkSys.</p>
            <p>Esta invitación es válida por 7 días.</p>
            <p><a href="${registrationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Completar Registro</a></p>
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p>${registrationUrl}</p>
          `
        });

        console.log(`✅ Invitación enviada a ${validatedData.email}`);
      } catch (emailError) {
        console.error("Error enviando email:", emailError);
        // No fallar la creación de la invitación si el email falla
      }

      res.status(201).json({
        message: "Invitación creada exitosamente",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          status: invitation.status,
          expiresAt: invitation.expiresAt
        }
      });

    } catch (error) {
      console.error("Error creando invitación:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Endpoint para validar token de invitación
  app.get("/api/instructor-invitations/validate/:token", async (req, res) => {
    try {
      const { token } = req.params;

      const [invitation] = await db
        .select()
        .from(instructorInvitations)
        .where(
          and(
            eq(instructorInvitations.invitationToken, token),
            eq(instructorInvitations.status, "pending")
          )
        )
        .limit(1);

      if (!invitation) {
        return res.status(404).json({ error: "Invitación no encontrada o ya utilizada" });
      }

      if (new Date() > invitation.expiresAt) {
        // Marcar como expirada
        await db
          .update(instructorInvitations)
          .set({ status: "expired" })
          .where(eq(instructorInvitations.id, invitation.id));

        return res.status(400).json({ error: "La invitación ha expirado" });
      }

      res.json({
        valid: true,
        email: invitation.email,
        expiresAt: invitation.expiresAt
      });

    } catch (error) {
      console.error("Error validando invitación:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Endpoint público para registro de instructor con token
  app.post("/api/instructors/register", async (req, res) => {
    try {
      const { token, ...instructorData } = req.body;

      // Validar token
      const [invitation] = await db
        .select()
        .from(instructorInvitations)
        .where(
          and(
            eq(instructorInvitations.invitationToken, token),
            eq(instructorInvitations.status, "pending")
          )
        )
        .limit(1);

      if (!invitation) {
        return res.status(404).json({ error: "Token de invitación inválido o ya utilizado" });
      }

      if (new Date() > invitation.expiresAt) {
        await db
          .update(instructorInvitations)
          .set({ status: "expired" })
          .where(eq(instructorInvitations.id, invitation.id));

        return res.status(400).json({ error: "La invitación ha expirado" });
      }

      // Validar datos del instructor
      const validatedInstructorData = registerInstructorSchema.parse({
        ...instructorData,
        email: invitation.email // Usar el email de la invitación
      });

      // Crear instructor
      const [newInstructor] = await db
        .insert(instructors)
        .values(validatedInstructorData)
        .returning();

      // Marcar invitación como usada
      await db
        .update(instructorInvitations)
        .set({ 
          status: "used",
          usedAt: new Date()
        })
        .where(eq(instructorInvitations.id, invitation.id));

      console.log(`✅ Instructor registrado: ${newInstructor.fullName} (${newInstructor.email})`);

      res.status(201).json({
        message: "Registro completado exitosamente",
        instructor: {
          id: newInstructor.id,
          fullName: newInstructor.fullName,
          email: newInstructor.email,
          status: newInstructor.status
        }
      });

    } catch (error) {
      console.error("Error registrando instructor:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Endpoint para listar invitaciones (solo usuarios autenticados)
  app.get("/api/instructor-invitations", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const invitations = await db
        .select({
          id: instructorInvitations.id,
          email: instructorInvitations.email,
          status: instructorInvitations.status,
          invitedAt: instructorInvitations.invitedAt,
          expiresAt: instructorInvitations.expiresAt,
          usedAt: instructorInvitations.usedAt,
          invitedByName: users.fullName
        })
        .from(instructorInvitations)
        .leftJoin(users, eq(instructorInvitations.invitedBy, users.id))
        .orderBy(instructorInvitations.createdAt);

      res.json(invitations);

    } catch (error) {
      console.error("Error obteniendo invitaciones:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  console.log("✅ Rutas de invitaciones de instructores registradas");
}