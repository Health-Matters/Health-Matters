import express from 'express';
import dotenv from "dotenv"; // Load env vars before using them

dotenv.config(); 
const server = express();
server.use(express.json());

const Port = process.env.PORT || 3000;
server.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});

console.log('Hello, World!');