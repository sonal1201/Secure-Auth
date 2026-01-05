import express from "express";
import {
  loginUser,
  myprofile,
  refreshToken,
  registerUser,
  verifyOtp,
  verifyUser,
} from "../controllers/user_controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.get("/me", isAuth, myprofile);
router.post("/refresh-token", refreshToken);

export default router;
