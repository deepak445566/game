import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import connectDB from './config/db.js';
import postRouter from './routes/postRoutes.js';
import userRouter from './routes/userRoutes.js';


dotenv.config();
const app = express();
app.use(cookieParser());
await connectDB();


// CORS Configuration for Production
const allowedOrigins = [
  'http://localhost:5173',
  'https://cosmic-buttercream-bc92c3.netlify.app'
  
   
];



app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      // If you want to allow all origins in production, use this:
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/post',postRouter);
app.use('/api/user',userRouter);

app.use(express.static("uploads"))






const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


