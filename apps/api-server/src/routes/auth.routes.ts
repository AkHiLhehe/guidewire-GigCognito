import { Router } from "express";
import { sendOTP, verifyOTP } from "../services/auth/otp.service";

const router = Router();

/**
 * POST /auth/send-otp
 * Body: { phone: "9876543210" }
 */
router.post("/send-otp", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number is required" });
  }

  const result = sendOTP(String(phone).trim());
  return res.status(result.success ? 200 : 400).json(result);
});

/**
 * POST /auth/verify-otp
 * Body: { phone: "9876543210", otp: "1234" }
 */
router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone and OTP are required" });
  }

  const result = verifyOTP(String(phone).trim(), String(otp).trim());
  return res.status(result.success ? 200 : 400).json(result);
});

export default router;