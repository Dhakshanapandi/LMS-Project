import express from "express";
import { getAllOrders } from "../controllers/orderController";
import createOrderHandle from "../controllers/orderController";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";
const orderRoute = express.Router();

orderRoute.post(
    "/createOrder",
    isAuthenticated,
    CatchAsyncError(createOrderHandle)
);

orderRoute.get("/get-orders-admin", isAuthenticated, authorizeRoles("admin"), CatchAsyncError(getAllOrders));

export default orderRoute;
