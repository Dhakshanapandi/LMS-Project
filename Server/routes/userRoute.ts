import express from "express";
import { ActivateUser, UpdatePassword, UpdateProfilePicture, getUserInfo, loginUser, logoutUser, socialAuth, updateAccessToken, updateUserInfo, userRegistrationHandler } from "../controllers/userController";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";
const router = express.Router();

router.post("/registration",CatchAsyncError(userRegistrationHandler));

router.post("/activateCode", CatchAsyncError(ActivateUser));

router.post("/loginUser", CatchAsyncError(loginUser));

router.get("/logoutUser", isAuthenticated, CatchAsyncError(logoutUser));

router.get("/refresh", CatchAsyncError(updateAccessToken));

router.get("/getUser", isAuthenticated, CatchAsyncError(getUserInfo));

router.post("/socialAuth", CatchAsyncError(socialAuth));

router.put("/updateUserInfo", isAuthenticated, CatchAsyncError(updateUserInfo));

router.put("/updatePassword", isAuthenticated, CatchAsyncError(UpdatePassword));

router.put("/updateUserAvatar", isAuthenticated, CatchAsyncError(UpdateProfilePicture));

export default router;
