import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const requireOwner = (Model: mongoose.Model<any>, idParam = 'id', authorField = 'author') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const resourceId = req.params[idParam];
      if (!resourceId) {
        return res.status(400).json({ error: "Resource ID missing" });
      }

      const resource = await Model.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }

      const ownerId = resource[authorField];
      const user = req.user as any;
      
      if (!ownerId || ownerId.toString() !== user._id.toString()) {
        return res.status(403).json({ error: "Forbidden - You are not the author of this resource" });
      }

      // Attach the fetched resource to req for reuse in the controller if needed
      (req as any).resource = resource;
      
      next();
    } catch (error) {
      console.error("requireOwner middleware error:", error);
      return res.status(500).json({ error: "Server error during authorization check" });
    }
  };
};
