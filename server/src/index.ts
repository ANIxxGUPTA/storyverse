import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from './config/passport';
import { connectDB } from './config/db';
import mongoose from 'mongoose';

import healthRoute from './routes/health';
import authRoutes from './routes/auth.routes';
import storyRoutes from './routes/story.routes';
import feedRoutes from './routes/feed.routes';
import userRoutes from './routes/user.routes';
import searchRoutes from './routes/search.routes';
import aiRoutes from './routes/ai.routes';
import collectionRoutes from './routes/collection.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Trust Vercel's edge proxy so secure cookies (like session) work correctly
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    clientPromise: connectDB().then(() => mongoose.connection.getClient())
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/health', healthRoute);
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/collections', collectionRoutes);

const startServer = async () => {
  await connectDB();
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
    });
  }
};

startServer();

export default app;
