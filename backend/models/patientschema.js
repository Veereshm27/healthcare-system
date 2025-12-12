const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  // --- original basic fields (kept exactly) ---
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  bloodgroup: {
    type: String,
    required: false,
  },

  // --- appended simple link-only fields ---
  labReports: {
    // array of { title, url, date, notes }
    type: [{ title: String, url: String, date: Date, notes: String }],
    default: [],
  },
  prescriptions: {
    // array of { title, url, date, notes }
    type: [{ title: String, url: String, date: Date, notes: String }],
    default: [],
  },
  doctorNotes: {
    // array of { title, url, date, notes }
    type: [{ title: String, url: String, date: Date, notes: String }],
    default: [],
  },
  vaccinationReports: {
    // array of { vaccineName, url, date, notes }
    type: [{ vaccineName: String, url: String, date: Date, notes: String }],
    default: [],
  },
  imagingReports: {
    // array of { modality, bodyPart, url, date, notes }
    type: [
      {
        modality: String,
        bodyPart: String,
        url: String,
        date: Date,
        notes: String,
      },
    ],
    default: [],
  },
  medicalExpenses: {
    // expense entries with optional receipt URL
    type: [{ amount: Number, date: Date, note: String, receiptUrl: String }],
    default: [],
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// keep updatedAt fresh
PatientSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Patient", PatientSchema);
