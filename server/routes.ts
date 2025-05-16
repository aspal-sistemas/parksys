import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertParkSchema, insertCommentSchema, insertIncidentSchema, 
  insertActivitySchema, insertDocumentSchema, insertParkImageSchema,
  insertParkAmenitySchema, ExtendedPark, Park, Municipality, Amenity, Activity
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server first
  const httpServer = createServer(app);
  
  // API routes - all prefixed with /api
  const apiRouter = express.Router();
  app.use('/api', apiRouter);

  // Get all parks with option to filter
  apiRouter.get("/parks", async (req: Request, res: Response) => {
    try {
      const municipalityId = req.query.municipalityId ? Number(req.query.municipalityId) : undefined;
      const parkType = req.query.parkType ? String(req.query.parkType) : undefined;
      const postalCode = req.query.postalCode ? String(req.query.postalCode) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      
      // Parse amenities from query (comma-separated list of IDs)
      let amenities: number[] | undefined;
      if (req.query.amenities) {
        amenities = String(req.query.amenities).split(',').map(id => Number(id));
      }
      
      const parks = await storage.getExtendedParks({
        municipalityId,
        parkType,
        postalCode,
        amenities,
        search
      });
      
      res.json(parks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching parks" });
    }
  });

  // Get a specific park by ID with all related data
  apiRouter.get("/parks/:id", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const park = await storage.getExtendedPark(parkId);
      
      if (!park) {
        return res.status(404).json({ message: "Park not found" });
      }
      
      res.json(park);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park" });
    }
  });

  // Create a new park (admin/municipality only)
  apiRouter.post("/parks", async (req: Request, res: Response) => {
    try {
      const parkData = insertParkSchema.parse(req.body);
      const newPark = await storage.createPark(parkData);
      res.status(201).json(newPark);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error creating park" });
    }
  });

  // Update an existing park (admin/municipality only)
  apiRouter.put("/parks/:id", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      // Partial validation is fine for updates
      const parkData = req.body;
      
      const updatedPark = await storage.updatePark(parkId, parkData);
      
      if (!updatedPark) {
        return res.status(404).json({ message: "Park not found" });
      }
      
      res.json(updatedPark);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating park" });
    }
  });

  // Delete a park (admin/municipality only)
  apiRouter.delete("/parks/:id", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const result = await storage.deletePark(parkId);
      
      if (!result) {
        return res.status(404).json({ message: "Park not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting park" });
    }
  });

  // Get all amenities
  apiRouter.get("/amenities", async (_req: Request, res: Response) => {
    try {
      const amenities = await storage.getAmenities();
      res.json(amenities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching amenities" });
    }
  });

  // Get amenities for a specific park
  apiRouter.get("/parks/:id/amenities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const amenities = await storage.getParkAmenities(parkId);
      res.json(amenities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park amenities" });
    }
  });

  // Add an amenity to a park (admin/municipality only)
  apiRouter.post("/parks/:id/amenities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const amenityId = Number(req.body.amenityId);
      
      const data = insertParkAmenitySchema.parse({ parkId, amenityId });
      const result = await storage.addAmenityToPark(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error adding amenity to park" });
    }
  });

  // Remove an amenity from a park (admin/municipality only)
  apiRouter.delete("/parks/:parkId/amenities/:amenityId", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      const amenityId = Number(req.params.amenityId);
      
      const result = await storage.removeAmenityFromPark(parkId, amenityId);
      
      if (!result) {
        return res.status(404).json({ message: "Amenity not found for this park" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error removing amenity from park" });
    }
  });

  // Get images for a specific park
  apiRouter.get("/parks/:id/images", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const images = await storage.getParkImages(parkId);
      res.json(images);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park images" });
    }
  });

  // Add an image to a park (admin/municipality only)
  apiRouter.post("/parks/:id/images", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const imageData = { ...req.body, parkId };
      
      const data = insertParkImageSchema.parse(imageData);
      const result = await storage.createParkImage(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error adding image to park" });
    }
  });

  // Delete an image from a park (admin/municipality only)
  apiRouter.delete("/parks/:parkId/images/:imageId", async (req: Request, res: Response) => {
    try {
      const imageId = Number(req.params.imageId);
      
      const result = await storage.deleteParkImage(imageId);
      
      if (!result) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error removing image from park" });
    }
  });

  // Get documents for a specific park
  apiRouter.get("/parks/:id/documents", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const documents = await storage.getParkDocuments(parkId);
      res.json(documents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park documents" });
    }
  });

  // Add a document to a park (admin/municipality only)
  apiRouter.post("/parks/:id/documents", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const documentData = { ...req.body, parkId };
      
      const data = insertDocumentSchema.parse(documentData);
      const result = await storage.createDocument(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error adding document to park" });
    }
  });

  // Delete a document from a park (admin/municipality only)
  apiRouter.delete("/parks/:parkId/documents/:documentId", async (req: Request, res: Response) => {
    try {
      const documentId = Number(req.params.documentId);
      
      const result = await storage.deleteDocument(documentId);
      
      if (!result) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error removing document from park" });
    }
  });

  // Get activities for a specific park
  apiRouter.get("/parks/:id/activities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const activities = await storage.getParkActivities(parkId);
      res.json(activities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park activities" });
    }
  });

  // Add an activity to a park (admin/municipality only)
  apiRouter.post("/parks/:id/activities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const activityData = { ...req.body, parkId };
      
      const data = insertActivitySchema.parse(activityData);
      const result = await storage.createActivity(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error adding activity to park" });
    }
  });

  // Get comments for a specific park
  apiRouter.get("/parks/:id/comments", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const approvedOnly = req.query.approvedOnly === 'true';
      
      const comments = await storage.getParkComments(parkId, approvedOnly);
      res.json(comments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park comments" });
    }
  });

  // Add a comment to a park (public)
  apiRouter.post("/parks/:id/comments", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const commentData = { ...req.body, parkId };
      
      const data = insertCommentSchema.parse(commentData);
      const result = await storage.createComment(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error adding comment to park" });
    }
  });

  // Approve a comment (admin/municipality only)
  apiRouter.put("/comments/:id/approve", async (req: Request, res: Response) => {
    try {
      const commentId = Number(req.params.id);
      const result = await storage.approveComment(commentId);
      
      if (!result) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error approving comment" });
    }
  });

  // Report an incident for a park (public)
  apiRouter.post("/parks/:id/incidents", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const incidentData = { ...req.body, parkId };
      
      const data = insertIncidentSchema.parse(incidentData);
      const result = await storage.createIncident(data);
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error reporting incident" });
    }
  });

  // Get all municipalities
  apiRouter.get("/municipalities", async (_req: Request, res: Response) => {
    try {
      const municipalities = await storage.getMunicipalities();
      res.json(municipalities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching municipalities" });
    }
  });

  // Basic authentication for testing
  apiRouter.post("/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we'd create a session and set cookies
      // For now, just return the user without the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token: 'dummy-token-for-testing'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error during login" });
    }
  });

  // Public API feature for connecting with other municipal applications
  // This creates endpoints that other municipal apps can use
  const publicApiRouter = express.Router();
  app.use('/public-api', publicApiRouter);
  
  // Get basic park data - limited information for public consumption
  publicApiRouter.get("/parks", async (_req: Request, res: Response) => {
    try {
      const parks = await storage.getParks();
      // Return only basic data needed for integration
      const simplifiedParks = parks.map(park => ({
        id: park.id,
        name: park.name,
        type: park.parkType,
        address: park.address,
        latitude: park.latitude,
        longitude: park.longitude
      }));
      
      res.json({
        status: "success",
        data: simplifiedParks,
        count: simplifiedParks.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching parks data" 
      });
    }
  });
  
  // Get parks by municipality ID - for inter-municipal integration
  publicApiRouter.get("/municipalities/:id/parks", async (req: Request, res: Response) => {
    try {
      const municipalityId = Number(req.params.id);
      const parks = await storage.getParks({ municipalityId });
      
      const simplifiedParks = parks.map(park => ({
        id: park.id,
        name: park.name,
        type: park.parkType,
        address: park.address,
        latitude: park.latitude,
        longitude: park.longitude
      }));
      
      res.json({
        status: "success",
        data: simplifiedParks,
        count: simplifiedParks.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching parks data for municipality" 
      });
    }
  });
  
  // Get upcoming activities across all parks - for calendar integration
  publicApiRouter.get("/activities", async (req: Request, res: Response) => {
    try {
      const allParks = await storage.getParks();
      let allActivities: Activity[] = [];
      
      // Collect activities from all parks
      for (const park of allParks) {
        const activities = await storage.getParkActivities(park.id);
        if (activities.length > 0) {
          allActivities = [...allActivities, ...activities];
        }
      }
      
      // Sort by start date
      allActivities.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      // Format for external consumption
      const formattedActivities = allActivities.map(activity => {
        const park = allParks.find(p => p.id === activity.parkId);
        return {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          startDate: activity.startDate,
          endDate: activity.endDate,
          category: activity.category,
          parkName: park?.name || 'Unknown',
          parkId: activity.parkId,
          location: park ? `${park.address}` : 'Unknown'
        };
      });
      
      res.json({
        status: "success",
        data: formattedActivities,
        count: formattedActivities.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching activities data" 
      });
    }
  });
  
  // Get amenities for a specific park - for external applications
  publicApiRouter.get("/parks/:id/amenities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const amenities = await storage.getParkAmenities(parkId);
      
      // Format for external consumption
      const formattedAmenities = amenities.map(amenity => ({
        id: amenity.id,
        name: amenity.name,
        category: amenity.category,
        icon: amenity.icon
      }));
      
      res.json({
        status: "success",
        data: formattedAmenities,
        count: formattedAmenities.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching park amenities data" 
      });
    }
  });
  
  return httpServer;
}
