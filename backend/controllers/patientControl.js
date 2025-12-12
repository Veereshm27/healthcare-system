const patient = require("../models/patientschema");
const upload = require("../config/multer");
const cloudinaryConfig = require("../config/cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinaryConfig();
// Create a new patient
const createPatient = async (req, res) => {
  const { name, age, gender, email, phone, address } = req.body;
  if (!name || !age || !gender || !email || !phone || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const newPatient = new patient({
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
    res.status(500).json({ message: "Server Error", error });
  }
};
module.exports = { createPatient };
