const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

const { createPatient } = require("../controllers/patientControl");
router.post("/registerpatient", createPatient);
module.exports = router;
