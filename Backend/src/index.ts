import express from 'express';
import dotenv from "dotenv";
import connectDB from '../config/db';
import userRoutes from '../routes/userRoutes';
import seedDatabase from '../utils/seedData';
import User from '../models/User';

// Load env vars before using them
dotenv.config(); 

const server = express();

// Middleware
server.use(express.json());

// Routes
server.get('/', (req, res) => {
  res.json({ message: 'Health Matters API is running!' });
});

server.use('/api/users', userRoutes);

// Connect to Database, Seed if Empty, then Start Server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Check if database is empty and seed if needed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📦 Database is empty. Seeding data...');
      await seedDatabase();
      console.log('✅ Database seeded successfully!');
    } else {
      console.log(`✅ Database already has ${userCount} users`);
    }
    
    // Start Server
    const Port = process.env.PORT || 3000;
    server.listen(Port, () => {
      console.log(`🚀 Server is running on port ${Port}`);
      console.log(`📡 API: http://localhost:${Port}/api/users`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();