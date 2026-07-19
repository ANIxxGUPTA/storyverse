const { connectDB } = require('./dist/config/db');
const express = require('express');
const storyRoutes = require('./dist/routes/story.routes').default;
const userRoutes = require('./dist/routes/user.routes').default;
const feedRoutes = require('./dist/routes/feed.routes').default;
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/stories', storyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feed', feedRoutes);

app.listen(4007, async () => {
  await connectDB();
  console.log("Started on 4007");

  const printRes = async (name, res) => {
     const text = await res.text();
     let data = text;
     try {
       const json = JSON.parse(text);
       data = Array.isArray(json) ? `Array[${json.length}]` : (json.error ? `Error: ${json.error}` : `Object (keys: ${Object.keys(json).join(', ')})`);
       if (Array.isArray(json) && json.length > 0 && json[0].title) {
         data += ` (e.g. ${json[0].title})`;
       }
     } catch (e) {}
     console.log(`${name} => ${res.status} ${data}`);
  };

  await printRes('GET /api/stories', await fetch('http://localhost:4007/api/stories'));
  await printRes('GET /api/stories?genre=Fantasy', await fetch('http://localhost:4007/api/stories?genre=Fantasy'));
  await printRes('GET /api/users/georgerrmartin', await fetch('http://localhost:4007/api/users/georgerrmartin'));
  await printRes('GET /api/feed', await fetch('http://localhost:4007/api/feed'));

  process.exit(0);
});
