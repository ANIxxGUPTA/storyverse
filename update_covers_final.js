const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const coversDir = path.join(__dirname, "public", "covers");

async function finalizeCovers() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB...");

    const StorySchema = new mongoose.Schema({
      title: String,
      coverImage: String,
    }, { strict: false });

    const Story = mongoose.models.Story || mongoose.model("Story", StorySchema);
    
    const stories = await Story.find({});
    console.log(`Found ${stories.length} stories.`);

    let count = 0;
    for (const story of stories) {
      const fileName = `${story._id}.jpg`;
      const filePath = path.join(coversDir, fileName);
      
      // If the file exists locally, ensure DB points to it
      if (fs.existsSync(filePath)) {
        const publicPath = `/covers/${fileName}?t=${Date.now()}`;
        story.coverImage = publicPath;
        await story.save();
        count++;
      }
    }

    console.log(`Successfully finalized ${count} covers to use fast, downloaded local images!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

finalizeCovers();
