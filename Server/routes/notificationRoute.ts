import Express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  handleGetAllNotification,
  handleUpdateNotification,
} from "../controllers/notificationController";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";
const Router = Express.Router();

Router.get(
  "/allNotification",
  isAuthenticated,
  authorizeRoles("admin"),
  CatchAsyncError(handleGetAllNotification)
);
Router.put(
  "/updateNotification",
  isAuthenticated,
  authorizeRoles("admin"),
  CatchAsyncError(handleUpdateNotification)
);

export default Router;
