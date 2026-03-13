import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB");
    const MONGODB_URI = "mongodb://health-matters_db_user:4RFoy8NucZWBIHGV@ac-ispd8cp-shard-00-00.ch6du6y.mongodb.net:27017,ac-ispd8cp-shard-00-01.ch6du6y.mongodb.net:27017,ac-ispd8cp-shard-00-02.ch6du6y.mongodb.net:27017/?ssl=true&replicaSet=atlas-c19thn-shard-0&authSource=admin&appName=Health-MattersDB";
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URL is not defined");
    }
    await mongoose.connect("mongodb://health-matters_db_user:4RFoy8NucZWBIHGV@ac-ispd8cp-shard-00-00.ch6du6y.mongodb.net:27017,ac-ispd8cp-shard-00-01.ch6du6y.mongodb.net:27017,ac-ispd8cp-shard-00-02.ch6du6y.mongodb.net:27017/?ssl=true&replicaSet=atlas-c19thn-shard-0&authSource=admin&appName=Health-MattersDB");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error while connecting to MongoDB", error);
  }
};

export default connectDB;