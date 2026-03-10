import Appointment from "../models/Appointment";
import { Request, Response } from "express";

// Get appointments for an employee (patient timeline)

export const getAppointmentsByEmployeeId = async (
  req: Request,
  res: Response
) => {

  try {

    const { employeeId } = req.params;

    const appointments = await Appointment.find({
      employeeId
    })
      .populate("practitionerId", "firstName lastName")
      .sort({ scheduledDate: -1 });

    res.status(200).json(appointments);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch appointments",
      error
    });

  }

};