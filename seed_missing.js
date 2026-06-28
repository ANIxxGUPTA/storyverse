const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

const sampleContent = `# Chapter 1\n\nThe quick brown fox jumps over the lazy dog. A story begins here...`;

async function seedMissingGenres() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB...");

    const UserSchema = new mongoose.Schema({ username: { type: String, required: true } }, { timestamps: true });
    const StorySchema = new mongoose.Schema({
      title: String,
      description: String,
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      views: { type: Number, default: 0 },
      genre: { type: String, default: "Fiction" },
      tags: { type: [String], default: [] },
      status: { type: String, default: "ongoing" },
    }, { timestamps: true });
    const ChapterSchema = new mongoose.Schema({
      storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
      title: String,
      chapterNumber: Number,
      content: String,
      status: { type: String, default: 'published' },
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    const Story = mongoose.models.Story || mongoose.model("Story", StorySchema);
    const Chapter = mongoose.models.Chapter || mongoose.model("Chapter", ChapterSchema);

    // Get an existing user
    let user = await User.findOne({ username: "ElenaWrites" });
    if (!user) {
      user = await User.findOne();
    }

    const missingStories = [
      {
        title: "The Midnight Detective",
        description: "A hardboiled detective story.",
        genre: "Mystery",
        tags: ["detective", "crime", "thriller"],
        author: user._id,
        views: 300
      },
      {
        title: "Run For Your Life",
        description: "A high stakes thriller where survival is the only option.",
        genre: "Thriller",
        tags: ["survival", "action", "thriller"],
        author: user._id,
        views: 500
      },
      {
        title: "The Long Journey",
        description: "An epic adventure across the known world.",
        genre: "Adventure",
        tags: ["epic", "hero", "journey"],
        author: user._id,
        views: 1200
      },
      {
        title: "Tears in the Rain",
        description: "A profound drama about life, loss, and finding oneself.",
        genre: "Drama",
        tags: ["daily", "life", "drama"],
        author: user._id,
        views: 450
      },
      {
        title: "Laughing Out Loud",
        description: "A comedy about the absurdities of modern life.",
        genre: "Comedy",
        tags: ["comedy", "humor", "daily"],
        author: user._id,
        views: 890
      },
      {
        title: "Everyday Fiction",
        description: "A fictional tale that could happen to anyone.",
        genre: "Fiction",
        tags: ["fiction", "daily", "love"],
        author: user._id,
        views: 310
      }
    ];

    const insertedStories = await Story.insertMany(missingStories);

    const chapters = insertedStories.map(s => ({
      storyId: s._id,
      title: "Chapter 1",
      chapterNumber: 1,
      content: sampleContent
    }));

    await Chapter.insertMany(chapters);

    console.log("Missing genres and tags seeded successfully!");
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedMissingGenres();
