import  Express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {getAllNotification,updateNotification} from "../controllers/notificationController";
const Router = Express.Router();

Router.get("/allNotification",isAuthenticated,authorizeRoles("admin"),getAllNotification);
Router.put("/updateNotification",isAuthenticated,authorizeRoles("admin"),updateNotification);

export default Router;