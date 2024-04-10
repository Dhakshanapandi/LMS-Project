import express from "express";
import createOrder, { getAllOrders } from "../controllers/orderController";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const orderRoute = express.Router();

orderRoute.post("/createOrder",isAuthenticated,createOrder);

orderRoute.get("/get-orders-admin",isAuthenticated, authorizeRoles("admin"), getAllOrders);

export default orderRoute;
