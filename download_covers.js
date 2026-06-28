const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const coversDir = path.join(__dirname, "public", "covers");

if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

async function downloadCovers() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB...");

    const StorySchema = new mongoose.Schema({
      title: String,
      genre: String,
      coverImage: String,
    }, { strict: false });

    const Story = mongoose.models.Story || mongoose.model("Story", StorySchema);
    
    const stories = await Story.find({});
    console.log(`Found ${stories.length} stories.`);

    for (const story of stories) {
      if (!story.title || !story.genre) continue;
      
      const fileName = `${story._id}.jpg`;
      const filePath = path.join(coversDir, fileName);
      const publicPath = `/covers/${fileName}`;
      
      // Only download if it's a pollinations URL or empty/not local
      if (story.coverImage && story.coverImage.startsWith("http")) {
        console.log(`Downloading cover for: ${story.title}`);
        
        try {
          const res = await fetch(story.coverImage);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          fs.writeFileSync(filePath, buffer);
          
          story.coverImage = publicPath;
          await story.save();
          console.log(`Saved to ${publicPath}`);
        } catch (e) {
          console.error(`Failed to download for ${story.title}:`, e);
          // Try generating again sequentially
          const prompt = `${story.title} book cover, ${story.genre} theme, highly detailed digital art, aesthetic`;
          const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=600&nologo=true`;
          try {
             const res2 = await fetch(url);
             if (res2.ok) {
                 const ab = await res2.arrayBuffer();
                 fs.writeFileSync(filePath, Buffer.from(ab));
                 story.coverImage = publicPath;
                 await story.save();
                 console.log(`Saved via fallback to ${publicPath}`);
             }
          } catch(err2) {}
        }
        
        // Wait 1 second to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    console.log("All covers processed!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

downloadCovers();
