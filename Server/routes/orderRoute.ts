import express from "express";
import createOrder from "../controllers/orderController";
import { isAuthenticated } from "../middleware/auth";

const orderRoute = express.Router();

orderRoute.post("/createOrder",isAuthenticated,createOrder);

export default orderRoute;
