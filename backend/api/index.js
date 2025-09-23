import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';


import authRoutes from './routes/authRoutes.js';
import salesReportRoutes from './routes/salesReportRoutes.js';
// import CrmClient from './models/clientModel.js';
// import SalesReportUser from './models/userModel.js';

// MongoDB Connection
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));


const app = express();
const server = createServer(app);

// CORS Configuration (Must be on Top)
const allowedOrigins = [
  "https://sales.rofconnect.com"
];

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // origin allowed
    } else {
      callback(new Error("CORS policy: Origin not allowed"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,               // Allow cookies
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,       // for legacy browsers
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Preflight requests
app.options("*", cors(corsOptions)); 

// Middleware
// enable preflight for all routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/report', salesReportRoutes);


// Start Server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});




// const run = async () => {
//   const admin = await SalesReportUser.findOne({ role: 'admin' });
//   if (!admin) {
//     console.log('Admin not found.');
//     return;
//   }

//   const result = await CrmClient.updateMany(
//     { createdBy: { $exists: false } },
//     { $set: { createdBy: admin._id } }
//   );

//   console.log(`${result.modifiedCount} leads updated with createdBy.`);

// };

// run();


// const clearCollections = async () => {
//   try {
//     await CrmClient.deleteMany({});
//     console.log('Clients collection cleared.');

//     console.log('All specified collections have been cleared successfully.');
//     process.exit(0); 
//   } catch (error) {
//     console.error('Error clearing collections:', error);
//     process.exit(1);
//   }
// };

// clearCollections();