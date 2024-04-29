import { Request,Response,NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";
import { generateLast12MonthsData } from "../utils/analytics_generator";
import userModel from "../models/userModel";
import CourseModel from "../models/courseModel";
import OrderModel from "../models/orderModel";

// get users analystics --- only for admin
export const getUserAnalytics = CatchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{
    try {
        
        const users = await generateLast12MonthsData(userModel);

        res.status(200).json({
            success: true,
            users,
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message,500));
    }
})

// get courses analystics --- only for admin
export const getCourseAnalytics = CatchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{
    try {
        
        const courses = await generateLast12MonthsData(CourseModel);

        res.status(200).json({
            success: true,
            courses,
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message,500));
    }
})

// get orders analystics --- only for admin
export const getOrderAnalytics = CatchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{
    try {
        
        const orders = await generateLast12MonthsData(OrderModel);

        res.status(200).json({
            success: true,
            orders,
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message,500));
    }
})