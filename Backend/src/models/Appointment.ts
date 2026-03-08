import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // Patient & Practitioner
    patientClerkUserId: { type: String, required: true },
    practitionerClerkUserId: { type: String },

    // Service
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },

    // Appointment Details
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    scheduledDate: { type: Date, required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
