import CourseModel from "../models/courseModel";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";

export const createCourse = CatchAsyncError(
  async (data: any) => {  
    const course = await CourseModel.create(data);
    return course
  }
);
