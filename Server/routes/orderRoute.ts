import express from "express";
import createOrderHandle from "../controllers/orderController";
import { isAuthenticated } from "../middleware/auth";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";

const orderRoute = express.Router();

orderRoute.post(
  "/createOrder",
  isAuthenticated,
  CatchAsyncError(createOrderHandle)
);

export default orderRoute;
