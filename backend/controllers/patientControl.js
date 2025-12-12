const Patient = require("../models/patientSchema");

const createPatient = async (req, res) => {
  console.log("REQ BODY:", req.body);  // Debug

  const { name, age, gender, email, phone, address } = req.body;

  if (!name || !age || !gender || !email || !phone || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newPatient = new Patient({
      name,
      age,
      gender,
      email,
      phone,
      address,
    });

    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (error) {
    console.error("SAVE ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { createPatient };
