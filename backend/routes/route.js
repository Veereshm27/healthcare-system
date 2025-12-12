const express = require("express");
const router = express.Router();
const { createPatient, loginPatient, getPatientProfile, updatePatientProfile, uploadFile, sendEmailNotification, forgotPassword, resetPassword } = require("../controllers/patientControl");
const { authenticateToken } = require("../middlewares/auth");
const upload = require("../config/multer");

router.post("/registerpatient", createPatient);
router.post("/loginpatient", loginPatient);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/patient/profile", authenticateToken, getPatientProfile);
router.put("/patient/profile", authenticateToken, updatePatientProfile);
router.post("/patient/upload", authenticateToken, upload.single("file"), uploadFile);
router.post("/send-email", authenticateToken, sendEmailNotification);

module.exports = router;
