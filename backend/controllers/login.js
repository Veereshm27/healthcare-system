const Patient = require("../models/patientSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginPatient = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: patient._id, email: patient.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      patient: { id: patient._id, name: patient.name, email: patient.email }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { loginPatient };
