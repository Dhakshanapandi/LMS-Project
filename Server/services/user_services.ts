import { Response } from "express";
import { redis } from "../utils/redis";
import userModel from "../models/userModel";

  // Get user by id
const getUserById = async (id:string, res:Response)=>{
    const userJson = await redis.get(id);
    if(userJson){
      const user = JSON.parse(userJson);
      res.status(200).json({
        success:true,
        user,
    })
    }
}

  // Get All User
export const getAllUserServices = async(res:Response ) => {
  const users = await userModel.find().sort({createdAt:-1});

  res.status(201).json({
    success: true,
    users,
  })
}

export default getUserById;