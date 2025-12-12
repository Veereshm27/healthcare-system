const Patient = require("../models/patientSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const cloudinaryConfig = require("../config/cloudinary");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Initialize Cloudinary
cloudinaryConfig();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ------------------ REGISTER PATIENT ------------------
const createPatient = async (req, res) => {
  const { name, age, gender, email, phone, address, password } = req.body;

  if (!name || !age || !gender || !email || !phone || !address || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  try {
    // check if email already exists
    const existing = await Patient.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = new Patient({
      name,
      age,
      gender,
      email,
      phone,
      address,
      password: hashedPassword
    });

    await newPatient.save();
    res.status(201).json({ message: "Patient registered successfully", patient: newPatient });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ LOGIN PATIENT ------------------
const loginPatient = async (req, res) => {
  console.log("Login route hit", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  try {
    const user = await Patient.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Password not set for this account. Please register again." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ GET PATIENT PROFILE ------------------
const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select("-password");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json({ patient });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ UPDATE PATIENT PROFILE ------------------
const updatePatientProfile = async (req, res) => {
  const { name, age, gender, phone, address } = req.body;

  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.user.id,
      { name, age, gender, phone, address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", patient: updatedPatient });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ UPLOAD FILE ------------------
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "healthcare-reports",
      resource_type: "auto"
    });

    // Determine the type of file and update the patient record accordingly
    const { type } = req.body; // e.g., 'labReport', 'prescription', etc.
    const updateField = {
      labReport: "labReports",
      prescription: "prescriptions",
      doctorNote: "doctorNotes",
      vaccinationReport: "vaccinationReports",
      imagingReport: "imagingReports",
      medicalExpense: "medicalExpenses"
    }[type];

    if (!updateField) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const updateData = {
      title: req.body.title || req.file.originalname,
      url: result.secure_url,
      date: new Date(),
      notes: req.body.notes || ""
    };

    if (type === "medicalExpense") {
      updateData.amount = req.body.amount;
      updateData.receiptUrl = result.secure_url;
    } else if (type === "vaccinationReport") {
      updateData.vaccineName = req.body.vaccineName;
    } else if (type === "imagingReport") {
      updateData.modality = req.body.modality;
      updateData.bodyPart = req.body.bodyPart;
    }

    const patient = await Patient.findById(req.user.id);
    patient[updateField].push(updateData);
    await patient.save();

    res.status(200).json({ message: "File uploaded successfully", file: result });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ FORGOT PASSWORD ------------------
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await Patient.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token and expiry (1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ RESET PASSWORD ------------------
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required" });
  }

  try {
    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await Patient.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ SEND EMAIL NOTIFICATION ------------------
const sendEmailNotification = async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ message: "To, subject, and message are required" });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
};

module.exports = { createPatient, loginPatient, getPatientProfile, updatePatientProfile, uploadFile, sendEmailNotification, forgotPassword, resetPassword };
