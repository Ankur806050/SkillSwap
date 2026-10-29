import crypto from "node:crypto";

// Function to generate OTP
function generateOtp() {
    const otp = crypto.randomInt(100000, 1000000).toString();
    return otp;
}

export default generateOtp;