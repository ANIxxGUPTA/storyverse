const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

const genreToKeywords = {
  "sci-fi": "space,galaxy,stars",
  "fantasy": "castle,forest,magic",
  "romance": "sunset,flowers,rose",
  "horror": "fog,dark,spooky",
  "thriller": "shadows,mystery,detective",
  "adventure": "hiking,mountain,compass",
  "drama": "rain,moody,window",
  "comedy": "smile,balloons,bright",
  "fiction": "library,reading,books",
  "mystery": "fog,night,lantern"
};

function stringToHash(string) {
  let hash = 0;
  if (string.length === 0) return hash;
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash % 10000) + 1; 
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
      
      const cleanGenre = story.genre.toLowerCase();
      
      // Determine keywords based on genre mapping
      let keywords = genreToKeywords[cleanGenre] || "nature,landscape,abstract";
      
      const lockId = stringToHash(story.title);
      
      // We removed "book,cover" to avoid the generic PSD mockups, and we use highly filtered keywords to avoid NSFW
      const imageUrl = `https://loremflickr.com/400/600/${keywords}?lock=${lockId}`;
      
      story.coverImage = imageUrl;
      await story.save();
      console.log(`Updated cover for "${story.title}" to ${imageUrl}`);
    }

    console.log("All covers updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateCovers();
