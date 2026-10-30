import User from "../models/User.model.js";
import College from "../models/College.model.js";
import EmailVerification from "../models/EmailVerification.model.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto, { verify } from "node:crypto";

import generateOtp from "../utils/generateOtp.js";
import generateJwtToken from "../utils/generateJwtToken.js";
import sendEmail from "../utils/sendEmail.js";
import asyncHandler from "../utils/asyncHandler.js";

// function to register user
export const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    collegeId,
    department,
    studyYear
  } = req.body;

  // 1. Validate required fields
  if (
    !name?.trim() ||
    !email?.trim() ||
    !password ||
    !collegeId ||
    !department?.trim() ||
    studyYear == null
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields."
    });
  }

  // 2. Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // 3. Validate study year
  if (!Number.isInteger(studyYear) || studyYear < 1 || studyYear > 4) {
    return res.status(400).json({
      success: false,
      message: "Study year must be an integer between 1 and 4."
    });
  }

  // 4. Validate college
  const college = await College.findOne({
    _id: collegeId,
    isActive: true
  });

  if (!college) {
    return res.status(400).json({
      success: false,
      message: "Please select a valid, active college."
    });
  }

  // Validate email domain only if the college has configured domains
  if (college.emailDomains.length > 0) {
    const emailDomain = normalizedEmail.split("@").pop();

    const allowedDomains = college.emailDomains.map(
        domain => domain.toLowerCase()
    );

    if (!allowedDomains.includes(emailDomain)) {
        return res.status(400).json({
            success: false,
            message: "Please use an email address associated with your selected college."
        });
    }
  }

  // 5. Check whether user already exists
  const existingUser = await User.findOne({
    email: normalizedEmail
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists."
    });
  }

  // 6. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 7. Create pending user
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashedPassword,
    collegeId,
    department: department.trim(),
    studyYear
  });

  // 8. Generate OTP
  const otp = generateOtp();
  console.log("otp generated");

  // Hash OTP before storing it
  const otpHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // 9. Save verification record
  await EmailVerification.create({
    userId: user._id,
    otpHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    attempts: 0
  });

  // 10. Send OTP email
  await sendEmail({
    to: normalizedEmail,
    subject: "Verify your SkillSwap account",
    text: `Your SkillSwap verification OTP is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`
  });

  console.log("otp sent successfully");

  // 11. Respond to frontend
  return res.status(201).json({
    success: true,
    message: "Registration successful. Please check your email for the verification OTP."
  });
});

// function to verify email by verifying otp
export const verifyEmail = asyncHandler(async(req,res) => {
  // extract email and otp send by user
  const {email , userOtp} = req.body;

  // check whether this user registered as pending user
  const userExist = await User.findOne({email});
  if(!userExist){
    return res.status(404).json({
      success: "false",
      message: "User not found. Please register first."
    })
  }

  //check whether email is already verified
  if (userExist.emailVerified) {
    return res.status(400).json({
        success: false,
        message: "Email is already verified."
    });
  }

  // check whether email verification record exist
  const otpRecord = await EmailVerification.findOne({userId : userExist._id});
  if(!otpRecord){
    return res.status(400).json({
      success: "false",
      message: "No active verification OTP found. Please request a new OTP."
    })
  }

  // check whether otp expired or not
  if (otpRecord.expiresAt.getTime() <= Date.now()) {
    await otpRecord.deleteOne();

    return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP."
    });
  }

  // check max attempts
  const MAX_ATTEMPTS = 3;

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await otpRecord.deleteOne();
    return res.status(429).json({
        success: false,
        message: "Maximum OTP attempts exceeded. Please request a new OTP."
    });
  }

  // now compare otp for verification
  const otpHash = crypto
    .createHash("sha256")
    .update(userOtp)
    .digest("hex");

  if (otpHash !== otpRecord.otpHash) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${MAX_ATTEMPTS - otpRecord.attempts} attempts remaining.`
    });
  }

  // now since the user verified their email we will update it to database
  userExist.emailVerified = true;
  userExist.emailVerifiedAt = new Date();
  userExist.accountStatus = "active";

  await userExist.save();

  // Delete OTP so it cannot be reused
  await otpRecord.deleteOne();

  // Generate JWT
const token = generateJwtToken(userExist._id);

  return res.status(200).json({
    success: true,
    message: "Email verified successfully. You are now logged in.",
    token,
    user: {
        id: userExist._id,
        name: userExist.name,
        email: userExist.email,
        collegeId: userExist.collegeId
    }
  });
});

// function to resend otp
export const resendOtp = asyncHandler(async(req,res) => {
  //extract email
  const {email} = req.body;

  // check whether this user registered as pending user
  const userExist = await User.findOne({email});
  if(!userExist){
    return res.status(404).json({
      success: "false",
      message: "User not found. Please register first."
    })
  }

  //check whether email is already verified
  if (userExist.emailVerified) {
    return res.status(400).json({
        success: false,
        message: "Email is already verified."
    });
  }

  // check whether email verification record exist
  const otpRecord = await EmailVerification.findOne({userId : userExist._id});
  if(!otpRecord){
    return res.status(400).json({
      success: "false",
      message: "No active verification OTP found. Please request a new OTP."
    })
  }

  // check max attempts
  const MAX_ATTEMPTS = 3;

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await otpRecord.deleteOne();
    return res.status(429).json({
        success: false,
        message: "Maximum OTP attempts exceeded. Please request a new OTP."
    });
  }

  // Generate new OTP
  const otp = generateOtp();
  console.log("otp generated");

  // Hash OTP before storing it
  const otpHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Update the verification record and save to database
  otpRecord.otpHash = otpHash;
  otpRecord.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  otpRecord.attempts += 1;
  await otpRecord.save();

  // 10. Send OTP email
  await sendEmail({
    to: email.trim().toLowerCase(),
    subject: "Verify your SkillSwap account",
    text: `Your SkillSwap verification OTP is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`
  });
  console.log("otp sent successfully");

  return res.status(200).json({
    success: true,
    message: "A new OTP has been sent to your email."
  });
});