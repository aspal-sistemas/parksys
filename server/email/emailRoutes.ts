import { Router, Request, Response } from "express";
import { emailService } from "./emailService";

const emailRouter = Router();

/**
 * Ruta para probar la configuración de email
 */
emailRouter.get("/test-connection", async (req: Request, res: Response) => {
  try {
    const result = await emailService.testConnection();
    res.json(result);
  } catch (error) {
    console.error("Error testing email connection:", error);
    res.status(500).json({ 
      success: false, 
      method: 'error', 
      error: 'Error interno del servidor' 
    });
  }
});

/**
 * Ruta para enviar email personalizado
 */
emailRouter.post("/send", async (req: Request, res: Response) => {
  try {
    const { to, subject, text, html, cc, bcc } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ 
        success: false, 
        message: "Faltan campos requeridos: to, subject, y text o html" 
      });
    }

    const success = await emailService.sendEmail({
      to,
      subject,
      text,
      html,
      cc,
      bcc,
    });

    if (success) {
      res.json({ success: true, message: "Email enviado correctamente" });
    } else {
      res.status(500).json({ success: false, message: "Error enviando email" });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

/**
 * Ruta para enviar email de bienvenida
 */
emailRouter.post("/welcome", async (req: Request, res: Response) => {
  try {
    const { userEmail, userName, temporaryPassword } = req.body;

    if (!userEmail || !userName) {
      return res.status(400).json({ 
        success: false, 
        message: "Faltan campos requeridos: userEmail y userName" 
      });
    }

    const success = await emailService.sendWelcomeEmail(userEmail, userName, temporaryPassword);

    if (success) {
      res.json({ success: true, message: "Email de bienvenida enviado" });
    } else {
      res.status(500).json({ success: false, message: "Error enviando email de bienvenida" });
    }
  } catch (error) {
    console.error("Error sending welcome email:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

/**
 * Ruta para enviar notificación de evento aprobado
 */
emailRouter.post("/event-approval", async (req: Request, res: Response) => {
  try {
    const { userEmail, eventTitle, eventDate } = req.body;

    if (!userEmail || !eventTitle || !eventDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Faltan campos requeridos: userEmail, eventTitle y eventDate" 
      });
    }

    const success = await emailService.sendEventApprovalEmail(userEmail, eventTitle, eventDate);

    if (success) {
      res.json({ success: true, message: "Notificación de evento enviada" });
    } else {
      res.status(500).json({ success: false, message: "Error enviando notificación" });
    }
  } catch (error) {
    console.error("Error sending event approval email:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

/**
 * Ruta para enviar notificación de nómina
 */
emailRouter.post("/payroll-notification", async (req: Request, res: Response) => {
  try {
    const { userEmail, userName, period, netAmount } = req.body;

    if (!userEmail || !userName || !period || netAmount === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Faltan campos requeridos: userEmail, userName, period y netAmount" 
      });
    }

    const success = await emailService.sendPayrollNotification(userEmail, userName, period, netAmount);

    if (success) {
      res.json({ success: true, message: "Notificación de nómina enviada" });
    } else {
      res.status(500).json({ success: false, message: "Error enviando notificación de nómina" });
    }
  } catch (error) {
    console.error("Error sending payroll notification:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

/**
 * Ruta para enviar recordatorio de mantenimiento
 */
emailRouter.post("/maintenance-reminder", async (req: Request, res: Response) => {
  try {
    const { userEmail, assetName, dueDate } = req.body;

    if (!userEmail || !assetName || !dueDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Faltan campos requeridos: userEmail, assetName y dueDate" 
      });
    }

    const success = await emailService.sendMaintenanceReminder(userEmail, assetName, dueDate);

    if (success) {
      res.json({ success: true, message: "Recordatorio de mantenimiento enviado" });
    } else {
      res.status(500).json({ success: false, message: "Error enviando recordatorio" });
    }
  } catch (error) {
    console.error("Error sending maintenance reminder:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

export { emailRouter };