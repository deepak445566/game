import express from "express";

import { protectUser } from "../middleware/protectUser.js";
import multer from "multer";
import { uploadPicture ,
  checkFollowingStatus,
  downloadProfile, 
  followUser, 
  getAllUserProfile, 

  getConnectionCounts, 

  getFollowers, 

  getFollowing, 

  getUserAndProfile, 
  getUserProfileById, 
  isAuth, 
  loginUser, 
  logoutUser, 
  registerUser, 
  unfollowUser, 
  updateProfileData, 
  updateUserProfile,} from "../controllers/userControllers.js";

const upload = multer({
  storage: multer.memoryStorage()
});

const userRouter = express.Router();

// Authentication routes
userRouter.post('/register', registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/isauth", protectUser, isAuth);
userRouter.post("/logout", logoutUser);

// Profile routes
userRouter.post('/upload-profile', protectUser, upload.single("picture"), uploadPicture);
userRouter.post("/update", protectUser, updateUserProfile);
userRouter.get("/getUserProfile", protectUser, getUserAndProfile);
userRouter.post("/update-profile", protectUser, updateProfileData);
userRouter.get("/getAllUserProfile", protectUser, getAllUserProfile);
userRouter.get("/getUserProfile/:userId", protectUser, getUserProfileById);
userRouter.get("/download", downloadProfile);

// Follow/Unfollow routes
// Follow/Unfollow routes
userRouter.post("/follow", protectUser, followUser);
userRouter.post("/unfollow", protectUser, unfollowUser);
userRouter.get("/followers/:userId", protectUser, getFollowers);
userRouter.get("/following/:userId", protectUser, getFollowing);
userRouter.get("/connection-counts/:userId", protectUser, getConnectionCounts);
userRouter.get("/check-following/:targetUserId", protectUser, checkFollowingStatus);
export default userRouter;