const express = require("express");
const router = express.Router();

const { createPatient } = require("../controllers/patientControl");

router.post("/registerpatient", createPatient);

module.exports = router;
