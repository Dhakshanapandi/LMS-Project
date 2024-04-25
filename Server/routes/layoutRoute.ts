import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { createLayout } from '../controllers/layoutControllers';
const layoutRouter = express.Router();

layoutRouter.post("/create-layout", isAuthenticated,authorizeRoles("admin"),createLayout);

export default layoutRouter;