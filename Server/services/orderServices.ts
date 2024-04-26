import { NextFunction,Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";
import OrderModel from "../models/orderModel";

async function newOrder(data: any, next: NextFunction,res:Response) {
 const order = await OrderModel.create(data);
 
 res.status(200).json({
     success: true,
     order
});

}

  // Get All Orders
  export const getAllOrderServices = async(res:Response ) => {
    const orders = await OrderModel.find().sort({createdAt:-1});
  
    res.status(201).json({
      success: true,
      orders,
    })
  }
  
export const createNewOrder = CatchAsyncError(newOrder);
