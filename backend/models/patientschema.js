const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  bloodgroup: { type: String },

  labReports: [{ title: String, url: String, date: Date, notes: String }],
  prescriptions: [{ title: String, url: String, date: Date, notes: String }],
  doctorNotes: [{ title: String, url: String, date: Date, notes: String }],
  vaccinationReports: [
    { vaccineName: String, url: String, date: Date, notes: String },
  ],
  imagingReports: [
    { modality: String, bodyPart: String, url: String, date: Date, notes: String },
  ],
  medicalExpenses: [
    { amount: Number, date: Date, note: String, receiptUrl: String },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PatientSchema.pre("save", function () {
  this.updatedAt = Date.now();
});


module.exports = mongoose.model("Patient", PatientSchema);
