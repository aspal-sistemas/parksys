import { Router, Request, Response } from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getParkEvents,
  getEventReferenceData
} from "./events-handlers";

import {
  getEventParticipants,
  registerParticipant,
  updateParticipantStatus,
  removeParticipant,
  getEventParticipantsSummary
} from "./events-participants-handlers";

import {
  getEventResources,
  getEventResource,
  assignResourceToEvent,
  updateEventResource,
  removeEventResource,
  updateResourceStatus,
  getEventResourcesSummary
} from "./events-resources-handlers";

import {
  getEventEvaluations,
  createEventEvaluation,
  updateEventEvaluation,
  deleteEventEvaluation
} from "./events-evaluations-handlers";

import {
  getEventVolunteers,
  assignVolunteerToEvent,
  updateVolunteerAssignment,
  removeVolunteerFromEvent,
  getAvailableVolunteers
} from "./events-volunteers-handlers";

export const eventRouter = Router();

// Rutas públicas (no requieren autenticación)
eventRouter.get("/events", getAllEvents);
eventRouter.get("/events/:id", getEventById);
eventRouter.get("/parks/:id/events", getParkEvents);
eventRouter.get("/events-reference-data", getEventReferenceData);

// Rutas protegidas (requieren autenticación)
eventRouter.post("/events", createEvent);
eventRouter.put("/events/:id", updateEvent);
eventRouter.delete("/events/:id", deleteEvent);

export function registerEventRoutes(app: any, apiRouter: Router, isAuthenticated: any) {
  // Las categorías de eventos se manejan ahora en event-categories-routes.ts
  // Esta ruta se mantiene temporalmente para compatibilidad pero será removida

  // Rutas públicas
  apiRouter.get("/events", getAllEvents);
  apiRouter.get("/events/:id", getEventById);
  apiRouter.get("/parks/:id/events", getParkEvents);
  apiRouter.get("/events-reference-data", getEventReferenceData);
  
  // Rutas protegidas (requieren autenticación)
  apiRouter.post("/events", isAuthenticated, createEvent);
  apiRouter.put("/events/:id", isAuthenticated, updateEvent);
  apiRouter.delete("/events/:id", isAuthenticated, deleteEvent);
  
  // Rutas para participantes
  apiRouter.get("/events/:id/participants", getEventParticipants);
  apiRouter.get("/events/:id/participants/summary", getEventParticipantsSummary);
  apiRouter.post("/events/:id/participants", registerParticipant);
  apiRouter.put("/events/:id/participants/:participantId/status", isAuthenticated, updateParticipantStatus);
  apiRouter.delete("/events/:id/participants/:participantId", isAuthenticated, removeParticipant);
  
  // Rutas para recursos de eventos
  apiRouter.get("/events/:id/resources", getEventResources);
  apiRouter.get("/events/:id/resources/summary", getEventResourcesSummary);
  apiRouter.get("/events/:id/resources/:resourceId", getEventResource);
  apiRouter.post("/events/:id/resources", isAuthenticated, assignResourceToEvent);
  apiRouter.put("/events/:id/resources/:resourceId", isAuthenticated, updateEventResource);
  apiRouter.put("/events/:id/resources/:resourceId/status", isAuthenticated, updateResourceStatus);
  apiRouter.delete("/events/:id/resources/:resourceId", isAuthenticated, removeEventResource);
  
  // Rutas para evaluaciones de eventos
  apiRouter.get("/events/:id/evaluations", getEventEvaluations);
  apiRouter.post("/events/:id/evaluations", createEventEvaluation);
  apiRouter.put("/events/:id/evaluations/:evaluationId", isAuthenticated, updateEventEvaluation);
  apiRouter.delete("/events/:id/evaluations/:evaluationId", isAuthenticated, deleteEventEvaluation);
  
  // Rutas para voluntarios de eventos
  apiRouter.get("/events/:id/volunteers", getEventVolunteers);
  apiRouter.post("/events/:id/volunteers", isAuthenticated, assignVolunteerToEvent);
  apiRouter.put("/events/:id/volunteers/:assignmentId", isAuthenticated, updateVolunteerAssignment);
  apiRouter.delete("/events/:id/volunteers/:assignmentId", isAuthenticated, removeVolunteerFromEvent);
  
  // Ruta para obtener voluntarios disponibles
  apiRouter.get("/volunteers/available", getAvailableVolunteers);
}