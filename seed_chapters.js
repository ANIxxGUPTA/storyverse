const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

const sampleContent = `# The Story Continues\n\nAs the journey progressed, new challenges arose. The protagonist faced them head-on, determined to overcome the obstacles in their path.\n\n"We can't turn back now," they said, looking at their companions. "We've come too far."\n\nAnd so they marched forward into the unknown.`;

async function addChapters() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB...");

    const StorySchema = new mongoose.Schema({
      title: String,
    }, { timestamps: true });
    
    const ChapterSchema = new mongoose.Schema({
      storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
      title: String,
      chapterNumber: Number,
      content: String,
      status: { type: String, default: 'published' },
    }, { timestamps: true });

    const Story = mongoose.models.Story || mongoose.model("Story", StorySchema);
    const Chapter = mongoose.models.Chapter || mongoose.model("Chapter", ChapterSchema);

    const stories = await Story.find({});
    console.log(`Found ${stories.length} stories. Adding 7 chapters to each...`);

    const newChapters = [];

    for (const story of stories) {
      // Find highest chapter number currently
      const existingChapters = await Chapter.find({ storyId: story._id }).sort({ chapterNumber: -1 }).limit(1);
      let startNumber = 1;
      if (existingChapters.length > 0) {
        startNumber = existingChapters[0].chapterNumber + 1;
      }

      for (let i = 0; i < 7; i++) {
        newChapters.push({
          storyId: story._id,
          title: `Chapter ${startNumber + i}`,
          chapterNumber: startNumber + i,
          content: sampleContent,
          status: 'published'
        });
      }
    }

    if (newChapters.length > 0) {
      await Chapter.insertMany(newChapters);
      console.log(`Successfully added ${newChapters.length} total chapters!`);
    } else {
      console.log("No chapters added.");
    }

    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

addChapters();
