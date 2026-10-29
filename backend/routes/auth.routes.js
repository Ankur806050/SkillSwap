import express from "express";
import { registerUser } from "../controllers/auth.controller.js";
import { verifyEmail } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
// router.post("/resend-otp", resendOtp);
// router.post("/login", loginUser);
// router.post("/logout", authenticateUser, logoutUser);
// router.get("/me", authenticateUser, getCurrentUser);

export default router;