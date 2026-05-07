import cors from 'cors';

import express from 'express';
import { connectToDB } from './utils/mongo.js';
const app = express();
import storyRoutes from './routes/story.routes.js';

app.use(express.json());
app.use('/api/stories' , storyRoutes);

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;
connectToDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});