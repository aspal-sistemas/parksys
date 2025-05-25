import { Router } from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getParkEvents,
  getEventReferenceData,
  getEventParticipants,
  registerParticipant,
  updateParticipantStatus
} from "./events-handlers";

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
  apiRouter.post("/events/:id/participants", registerParticipant);
  apiRouter.put("/events/:eventId/participants/:id/status", isAuthenticated, updateParticipantStatus);
}