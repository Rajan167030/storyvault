import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import { scrapeStories } from './controller/story.controller.js';
import { connectToDB } from './utils/mongo.js';
const app = express();

import storyRoutes from './routes/story.routes.js';
import authRoutes from './routes/auth.routes.js';

app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/stories' , storyRoutes);
app.use('/api/auth' , authRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectToDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  void scrapeStories().catch((error) => {
    console.error('Initial story scrape failed', error);
  });
};

void startServer();
