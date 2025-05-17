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
  
  // Set an image as primary for a park (admin/municipality only)
  apiRouter.put("/parks/:parkId/images/:imageId/set-primary", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.parkId);
      const imageId = Number(req.params.imageId);
      
      // First, reset all images for this park to non-primary
      const parkImages = await storage.getParkImages(parkId);
      for (const image of parkImages) {
        if (image.isPrimary) {
          await storage.updateParkImage(image.id, { isPrimary: false });
        }
      }
      
      // Then set the selected image as primary
      const updatedImage = await storage.updateParkImage(imageId, { isPrimary: true });
      
      if (!updatedImage) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error setting image as primary" });
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
  
  // Get all incidents
  apiRouter.get("/incidents", async (req: Request, res: Response) => {
    try {
      const parkId = req.query.parkId ? Number(req.query.parkId) : undefined;
      const incidents = parkId 
        ? await storage.getParkIncidents(parkId)
        : await storage.getAllIncidents();
      
      res.json(incidents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching incidents" });
    }
  });
  
  // Get incidents for a specific park
  apiRouter.get("/parks/:id/incidents", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const incidents = await storage.getParkIncidents(parkId);
      
      res.json(incidents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching park incidents" });
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
      
      // En una aplicación real, crearíamos una sesión y cookies seguras
      // Si el usuario pertenece a un municipio, incluimos su información
      let municipalityData = null;
      if (user.municipalityId) {
        const municipality = await storage.getMunicipality(user.municipalityId);
        if (municipality) {
          municipalityData = {
            id: municipality.id,
            name: municipality.name,
            state: municipality.state,
            logoUrl: municipality.logoUrl
          };
        }
      }
      
      // Return the user without the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        user: {
          ...userWithoutPassword,
          municipality: municipalityData
        },
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
  
  // Get detailed information about a specific park
  publicApiRouter.get("/parks/:id", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const park = await storage.getExtendedPark(parkId);
      
      if (!park) {
        return res.status(404).json({
          status: "error",
          message: "Park not found"
        });
      }
      
      // Get park activities
      const activities = await storage.getParkActivities(parkId);

      // Format park data for public API consumption
      const formattedPark = {
        id: park.id,
        name: park.name,
        type: park.parkType,
        address: park.address,
        postalCode: park.postalCode,
        municipality: park.municipality ? {
          id: park.municipality.id,
          name: park.municipality.name,
          state: park.municipality.state
        } : null,
        location: {
          latitude: park.latitude,
          longitude: park.longitude
        },
        description: park.description,
        size: park.area,
        foundedIn: park.foundationYear,
        administrator: park.administrator,
        condition: park.conservationStatus,
        schedule: park.openingHours,
        contact: {
          email: park.contactEmail,
          phone: park.contactPhone
        },
        amenities: park.amenities?.map(amenity => ({
          id: amenity.id,
          name: amenity.name,
          category: amenity.category,
          icon: amenity.icon
        })) || [],
        images: park.images?.map(image => ({
          id: image.id,
          url: image.imageUrl,
          caption: image.caption,
          isPrimary: image.isPrimary
        })) || [],
        activities: activities.map(activity => ({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          startDate: activity.startDate,
          endDate: activity.endDate,
          category: activity.category,
          location: activity.location
        })),
        lastUpdated: park.updatedAt
      };
      
      res.json({
        status: "success",
        data: formattedPark
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching detailed park data" 
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
  
  // Get activities for a specific park - for external applications
  publicApiRouter.get("/parks/:id/activities", async (req: Request, res: Response) => {
    try {
      const parkId = Number(req.params.id);
      const activities = await storage.getParkActivities(parkId);
      
      // Format for external consumption
      const formattedActivities = activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        startDate: activity.startDate,
        endDate: activity.endDate,
        category: activity.category,
        location: activity.location
      }));
      
      res.json({
        status: "success",
        data: formattedActivities,
        count: formattedActivities.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: "error", 
        message: "Error fetching park activities data" 
      });
    }
  });
  
  // Advanced search endpoint for parks
  publicApiRouter.get("/search/parks", async (req: Request, res: Response) => {
    try {
      const filters: any = {};
      
      // Basic filters
      if (req.query.municipalityId) filters.municipalityId = Number(req.query.municipalityId);
      if (req.query.parkType) filters.parkType = String(req.query.parkType);
      if (req.query.postalCode) filters.postalCode = String(req.query.postalCode);
      if (req.query.search) filters.search = String(req.query.search);
      
      // Area filters
      if (req.query.minArea) filters.minArea = Number(req.query.minArea);
      if (req.query.maxArea) filters.maxArea = Number(req.query.maxArea);
      
      // Boolean filters
      if (req.query.hasAccessibility === 'true') filters.hasAccessibility = true;
      if (req.query.hasActivities === 'true') filters.hasActivities = true;
      
      // Date/Year filters
      if (req.query.foundedBefore) filters.foundedBefore = Number(req.query.foundedBefore);
      if (req.query.foundedAfter) filters.foundedAfter = Number(req.query.foundedAfter);
      
      // Conservation status
      if (req.query.conservationStatus) filters.conservationStatus = String(req.query.conservationStatus);
      
      // Location proximity search
      if (req.query.latitude && req.query.longitude && req.query.maxDistance) {
        filters.nearLocation = {
          latitude: String(req.query.latitude),
          longitude: String(req.query.longitude),
          maxDistance: Number(req.query.maxDistance)
        };
      }
      
      // Handle amenities filter as array of IDs
      if (req.query.amenities) {
        const amenityIds = Array.isArray(req.query.amenities) 
          ? req.query.amenities.map(Number) 
          : [Number(req.query.amenities)];
        
        if (amenityIds.length > 0 && !amenityIds.some(isNaN)) {
          filters.amenities = amenityIds;
        }
      }
      
      // Set extended results option
      const extended = req.query.extended === 'true';
      
      // Fetch parks with applied filters
      const parks = extended 
        ? await storage.getExtendedParks(filters)
        : await storage.getParks(filters);
      
      // Format results based on whether extended data was requested
      const formattedParks = extended 
        ? parks.map(park => ({
            id: park.id,
            name: park.name,
            type: park.parkType,
            address: park.address,
            postalCode: park.postalCode,
            latitude: park.latitude,
            longitude: park.longitude,
            description: park.description,
            area: park.area,
            foundationYear: park.foundationYear,
            conservationStatus: park.conservationStatus,
            accessibilityFeatures: park.accessibilityFeatures,
            openingHours: park.openingHours,
            contactEmail: park.contactEmail,
            contactPhone: park.contactPhone,
            images: park.images?.map(img => ({
              id: img.id,
              url: img.imageUrl,
              caption: img.caption,
              isPrimary: img.isPrimary
            })),
            primaryImage: park.primaryImage,
            amenities: park.amenities?.map(amenity => ({
              id: amenity.id,
              name: amenity.name,
              category: amenity.category,
              icon: amenity.icon
            })),
            activities: park.activities?.map(activity => ({
              id: activity.id,
              title: activity.title,
              description: activity.description,
              startDate: activity.startDate,
              endDate: activity.endDate,
              category: activity.category,
              location: activity.location
            })),
            municipality: park.municipality ? {
              id: park.municipality.id,
              name: park.municipality.name,
              state: park.municipality.state
            } : null,
            lastUpdated: park.updatedAt
          }))
        : parks.map(park => ({
            id: park.id,
            name: park.name,
            type: park.parkType,
            address: park.address,
            latitude: park.latitude,
            longitude: park.longitude,
            foundationYear: park.foundationYear,
            conservationStatus: park.conservationStatus,
            area: park.area
          }));
      
      res.json({
        status: "success",
        data: formattedParks,
        count: formattedParks.length,
        filters: filters
      });
      
    } catch (error) {
      console.error("Advanced search error:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Error processing advanced search" 
      });
    }
  });
  
  return httpServer;
}
