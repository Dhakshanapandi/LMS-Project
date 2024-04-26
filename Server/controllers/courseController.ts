import {Request,Response,NextFunction } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCourseServices } from "../services/course.service";
import CourseModel from "../models/courseModel";
import { redis } from "../utils/redis";
import ejs from "ejs";
import path from "path";
import { isElementAccessExpression } from "typescript";
import mongoose from "mongoose";
import sendMail from "../utils/sendMail";
//upload course

export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
     const course = createCourse(data);
     res.status(201).json({
      success:true,
      course
     })
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const courseId = req.params.id;

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true }
      );

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get single course - without purchasing

export const getSingleCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = req.params.id;

    const isCacheExist = await redis.get(courseId);

    if (isCacheExist) {
      const course = JSON.parse(isCacheExist);

      res.status(200).json({
        success: true,
        course,
      });
      return;
    }

    const course = await CourseModel.findById(req.params.id).select(
      "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
    );

    await redis.set(courseId, JSON.stringify(course));

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

//get All courses - without purchasing

export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isCacheExist = await redis.get("allCourses");

    if (isCacheExist) {
      const courses = JSON.parse(isCacheExist);
      res.status(200).json({
        success: true,
        courses,
      });
      return;
    }
    const course = await CourseModel.find().select(
      "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
    );

    await redis.set("allCourses", JSON.stringify(course));
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

//get course content - only for valid user

export const getCourseByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userCourseList = req.user?.courses;
    const courseId = req.params.id;

    const courseExists = userCourseList?.find(
      (course: any) => course._id.toString() === courseId
    );

    if (!courseExists) {
      return next(
        new ErrorHandler("You are not eligible to access this course", 400)
      );
    }
    const course = await CourseModel.findById(courseId);

    const content = course?.courseData;

    res.status(200).json({
      success: true,
      content,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
}

// Get All courses --- only for admins
export const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getAllCourseServices(res);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
  }
}

// Delete Course -- only for admin
export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const course = await CourseModel.findById(id);

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    await course.deleteOne({ id });

    await redis.del(id);

    res.status(200).json({
      success: true,
      message: "Course Deleted Successfully"
    });

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
}

// add questions in course 

interface IAddQuestionData{
  question:string,
  courseId:string,
  contentId:string
}

export const addQuestion = async(req:Request,res:Response,next:NextFunction)=>{
  try {
     const {question,courseId,contentId} : IAddQuestionData = req.body;
     const course = await CourseModel.findById(courseId)

     if(!mongoose.Types.ObjectId.isValid(contentId)){
      return next(new ErrorHandler("Invalid content id 1",400))
     }
     console.log(course);
     
     const courseContent = course?.courseData?.find((item:any)=>item._id.equals(contentId))

     if(!courseContent){
      return next(new ErrorHandler("Invalid content id 2",400))
     }

     //create new question object

     const newQuestion:any = {
       user:req.user,
       question,
       questionReplies:[]
     }

     //add this question to our course content  

     courseContent.questions.push(newQuestion)

     await course?.save();

     res.status(200).json({
      success:true,
      course
     })





  } catch (error:any) {
    return next(new ErrorHandler(error.message,500))
    
  }
}


//add answer in course question

interface IAddAnswerData{
  answer:string,
  courseId:string,
  contentId:string,
  questionId:string
}

export const addAnswer = async(req:Request,res:Response,next:NextFunction)=>{
   try {
      const {answer,courseId,contentId,questionId}:IAddAnswerData = req.body;

      const course = await CourseModel.findById(courseId);

      if(!mongoose.Types.ObjectId.isValid(contentId)){

        return next(new ErrorHandler("Invalid content id",400))
      }

      const courseContent = course?.courseData?.find((item:any)=>{
        item._id.equals(contentId)
      })

      if(!courseContent){
        return next(new ErrorHandler("Invalid content id",400))
      }

      const question = courseContent?.questions?.find((item:any)=>{
        item._id.equals(questionId)
      }
      )

      if(!question){
        return next(new ErrorHandler("Invalid question id",400))
      }

      // create a new answer object

      const newAnswer:any = {
        user:req.user,
        answer, 
      }

      question.questionReplies.push(newAnswer);



      await course?.save();


      if(req.user?._id === question.user._id){
             //create notification for admin 
      } else{
         const data = {
           name:question.user.name,
           title:courseContent.title
         }

         const html = await ejs.renderFile(path.join(__dirname,"../mails/question-reply.ejs"),data);

         

         try{
          await sendMail({
            email:question.user.email,
            subject:"Question Reply",
            template:"question-reply.ejs",
            data
          })
         }catch(error:any){
          return next(new ErrorHandler(error.message,500))
         }
      }

   } catch (error:any) { 
       return next(new ErrorHandler(error.message,500))
   }
} 