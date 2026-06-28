const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const coversDir = path.join(__dirname, "public", "covers");

if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 25000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function updateCovers() {
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
      const publicPath = `/covers/${fileName}?t=${Date.now()}`;
      
      console.log(`Generating cover for: "${story.title}"...`);
      
      // Specifically target stylized/abstract art to completely avoid NSFW or generic realism
      const prompt = `${story.title} book cover, ${story.genre} theme, minimalist abstract vector art style, flat colors, clean aesthetic, family friendly, safe, beautiful design`;
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=600&nologo=true&safe=true`;
      
      let success = false;
      let retries = 3;
      
      while (!success && retries > 0) {
        try {
          console.log(`Fetching from Pollinations (retries left: ${retries - 1})...`);
          
          const res = await fetchWithTimeout(url, { timeout: 30000 }); // generous timeout
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Verify it's actually an image
          if (buffer.length < 5000) {
              throw new Error("Downloaded file is too small to be a valid image");
          }
          
          fs.writeFileSync(filePath, buffer);
          
          story.coverImage = publicPath;
          await story.save();
          console.log(`✅ Success for "${story.title}"`);
          success = true;
        } catch (e) {
          retries--;
          console.error(`❌ Failed for "${story.title}": ${e.message}`);
          if (retries > 0) {
             console.log("Waiting 4 seconds before retry...");
             await new Promise(r => setTimeout(r, 4000));
          }
        }
      }
      
      if (!success) {
         console.log(`⚠️ Skipped "${story.title}" after all retries failed. Removing bad cover.`);
         story.coverImage = "";
         await story.save();
      }
      
      // Respect rate limits! Wait 3 seconds before moving to the next story.
      console.log("Cooling down for 3 seconds...");
      await new Promise(r => setTimeout(r, 3000));
    }

    console.log("All covers generated and downloaded successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateCovers();
