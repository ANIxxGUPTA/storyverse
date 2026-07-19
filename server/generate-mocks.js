const { connectDB } = require('./dist/config/db');
const express = require('express');
const fs = require('fs');
const path = require('path');
const storyRoutes = require('./dist/routes/story.routes').default;
const feedRoutes = require('./dist/routes/feed.routes').default;
require('./dist/models/User');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/stories', storyRoutes);
app.use('/api/feed', feedRoutes);

app.listen(4008, async () => {
  await connectDB();
  console.log("Started mock generation on 4008");

  const fetchAndSave = async (url, filename) => {
     const res = await fetch(url);
     const text = await res.text();
     const dest = path.join(__dirname, '../client/src/mocks', filename);
     fs.mkdirSync(path.dirname(dest), { recursive: true });
     fs.writeFileSync(dest, text);
     console.log(`Saved ${filename}`);
  };

  await fetchAndSave('http://localhost:4008/api/stories', 'stories.json');
  await fetchAndSave('http://localhost:4008/api/feed', 'feed.json');

  process.exit(0);
});
