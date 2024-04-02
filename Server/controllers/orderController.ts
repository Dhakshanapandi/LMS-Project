import express, { NextFunction ,Request,Response} from "express"
import ErrorHandler from "../utils/ErrorHandler"
import userModel,{IUser} from "../models/userModel"
import CourseModel,{ICourse} from "../models/courseModel"
import { CatchAsyncError } from "../middleware/CatchAsyncErrors"
import { IOrder } from "../models/orderModel"
import sendMail from "../utils/sendMail"
import NotificationModel from "../models/notificationModel"
import { createNewOrder } from "../services/orderServices"

async function createOrderHandle (req:Request,res:Response,next:NextFunction){
    try{
    const{courseId,payment_info} = req.body as IOrder;
    const user = await userModel.findById(req.user?._id);
    console.log("user",user);
    
    
    const courseExist = await user?.courses.some((course:any)=>course._id.toString() === courseId)
    if(courseExist){
        return (next(new ErrorHandler("course already purchased",400)))
    }   
    const course  = await CourseModel.findById(courseId) 
    if(!course){
        return(next(new ErrorHandler("Course not found",400)))
    }
    const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info
    };
    const mailData = {
        _id: course._id.toString().slice(0, 6),
        name: course.name,
        price: course.price,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };
    try{
        if (user) {
            await sendMail({
              email: user.email,
              subject: "Order Confirmation",
              template: "order-confirmation.ejs",
              data: {mailData: mailData},
            });
          }
    }catch(error:any){
        return next(new ErrorHandler(error.message, 400));
    }
    user?.courses.push(course.id)
    await user?.save()

    await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `you have a new order from ${course?._id}`,
      });
    course.purchased ? course.purchased =+ 1 : course.purchased
    await course.save();

    createNewOrder(data, res, next);

    }catch(error:any){
        return next(new ErrorHandler(error.message, 400));
    }
}
const createOrder = CatchAsyncError(createOrderHandle)

export default createOrder;