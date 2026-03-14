import MedicalRecord from "../models/MedicalRecord";
import { Request, Response } from "express";

// Get count of medical record access log entries for an employee
export const getAccessLogCountByEmployeeId = async (
  req: Request,
  res: Response
) => {
  try {
    const { employeeId } = req.params;

    const records = await MedicalRecord.find({ employeeId }).select("accessLog");

    const accessCount = records.reduce((sum, record) => {
      const log = Array.isArray(record.accessLog) ? record.accessLog : [];
      return sum + log.length;
    }, 0);

    res.status(200).json({ accessCount });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch medical record access count",
      error,
    });
  }
};
