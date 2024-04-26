import CourseModel from "../models/courseModel";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";

export const createCourse = CatchAsyncError(
  async (data: any) => {  
    const course = await CourseModel.create(data);
    return course
  }
);

  // Get All Courses
  export const getAllCourseServices = async(res:Response ) => {
    const courses = await CourseModel.find().sort({createdAt:-1});
  
    res.status(201).json({
      success: true,
      courses,
    })
  }
  
