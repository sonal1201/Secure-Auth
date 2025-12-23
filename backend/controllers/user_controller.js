import TryCatch from "../middlewares/tryCatch.js";
import sanitize from "mongo-sanitize";
import { registerSchema } from "../validators/user_vaildator.js";
import { fromError } from "zod-validation-error";
import { redisClient } from "../index.js";
import { User } from "../models/user_model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";
import { getVerifyEmailHtml } from "../config/html.js";

// -----Register User-------

export const registerUser = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = registerSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    const validationError = fromError(validation.error);

    return res.status(400).json({
      validationError: validationError.details[0].message,
    });
  }

  const { name, email, password } = validation.data;

  //rate limit via ipAddress
  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({
      message: "Too Many request, try again later.",
    });
  }

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    return res.status(400).json({ message: "User already exist" });
  }

  const salt = 10;

  const hashedPassword = await bcrypt.hash(password, salt);

  //verify token
  const verifyToken = crypto.randomBytes(32).toString("hex");

  const verifyKey = `verify:${verifyToken}`;

  const dataToStore = JSON.stringify({
    name,
    email,
    password: hashedPassword,
  });

  await redisClient.set(verifyKey, dataToStore, { EX: 300 });

  //mailing to user
  const subject = "Please verify you email for account creation.";
  const html = getVerifyEmailHtml({ email, verifyToken });

  await sendMail({ email, subject, html });

  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  res.status(200).json({
    message:
      "Please verify yourself, a verification link has been send to your given email.  It will expire in 5 minutes",
  });
});

// -----Verify User-------

export const verifyUser = TryCatch(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      message: "Verification token is required.",
    });
  }

  const verifyKey = `verify:${token}`;

  const getDataJson = await redisClient.get(verifyKey);

  if (!getDataJson) {
    return res.status(400).json({
      message: "Verification link is expired.",
    });
  }

  await redisClient.del(verifyKey);

  const userData = JSON.parse(getDataJson);

  const existingUser = await User.findOne({
    email: userData.email,
  });

  if (existingUser) {
    return res.status(400).json({ message: "User already exist" });
  }

  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });

  res.status(201).json({
    message: "Email verified successfully, Your account has been created.",
    user: { _id: newUser._id, name: newUser.name, email: newUser.email },
  });
});
