const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for seeding...");

    // Basic Models
    const UserSchema = new mongoose.Schema({
      username: { type: String, required: true },
      email: { type: String, required: true },
      password: { type: String, required: true },
    }, { timestamps: true });
    
    const StorySchema = new mongoose.Schema({
      title: String,
      slug: String,
      description: String,
      coverImage: String,
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      views: { type: Number, default: 0 },
      likes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] },
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
      likes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] },
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    const Story = mongoose.models.Story || mongoose.model("Story", StorySchema);
    const Chapter = mongoose.models.Chapter || mongoose.model("Chapter", ChapterSchema);

    // Clear existing for a clean slate, or just append. Let's just append.
    
    // Create Users
    const passwordHash = await bcrypt.hash("password123", 10);
    const u1 = await User.create({ username: "georgerrmartin", email: "george@example.com", password: passwordHash });
    const u2 = await User.create({ username: "brandonsanderson", email: "brandon@example.com", password: passwordHash });
    const u3 = await User.create({ username: "scifimaster", email: "scifi@example.com", password: passwordHash });

    console.log("Users created.");

    // Create Stories
    const s1 = await Story.create({
      title: "The Winds of Winter",
      slug: "the-winds-of-winter",
      description: "The long awaited sequel. Winter is finally here, and with it comes the white walkers.",
      genre: "Fantasy",
      tags: ["dragons", "magic", "epic"],
      author: u1._id,
      views: 1205
    });

    const s2 = await Story.create({
      title: "Mistborn: The Final Empire",
      slug: "mistborn-final-empire",
      description: "In a world where ash falls from the sky, a crew of thieves plans the ultimate heist against an immortal tyrant.",
      genre: "Fantasy",
      tags: ["heist", "allomancy", "rebellion"],
      author: u2._id,
      views: 840
    });

    const s3 = await Story.create({
      title: "Project Hail Mary",
      slug: "project-hail-mary",
      description: "A lone astronaut must save the earth from disaster in another solar system.",
      genre: "Sci-Fi",
      tags: ["space", "science", "survival"],
      author: u3._id,
      views: 342
    });

    const s4 = await Story.create({
      title: "The Silent Symphony",
      slug: "the-silent-symphony",
      description: "In a world where sound is currency, a deaf girl discovers she holds the key to unlimited wealth.",
      genre: "Sci-Fi",
      tags: ["dystopian", "cyberpunk"],
      author: u3._id,
      views: 156
    });

    const s5 = await Story.create({
      title: "A Court of Thorns",
      slug: "a-court-of-thorns",
      description: "A mortal huntress is dragged into a magical realm.",
      genre: "Romance",
      tags: ["fae", "magic", "enemies-to-lovers"],
      author: u1._id,
      views: 990
    });

    console.log("Stories created.");

    // Create Chapters
    const chapters = [
      { storyId: s1._id, title: "Prologue", chapterNumber: 1, content: "# Prologue\\n\\nThe snow fell heavy..." },
      { storyId: s1._id, title: "Chapter 1: Jon", chapterNumber: 2, content: "## Jon Snow\\n\\nJon looked out over the wall..." },
      
      { storyId: s2._id, title: "Ash Fell", chapterNumber: 1, content: "Ash fell from the sky. Vin watched it..." },
      { storyId: s2._id, title: "The Crew", chapterNumber: 2, content: "Kelsier smiled. It was a terrifying smile..." },
      
      { storyId: s3._id, title: "Awakening", chapterNumber: 1, content: "I woke up. I didn't know who I was..." },
      { storyId: s3._id, title: "The Pendulum", chapterNumber: 2, content: "I measured the gravity. It wasn't earth..." },
      
      { storyId: s4._id, title: "Silence", chapterNumber: 1, content: "The world was loud, but her mind was quiet..." },
      
      { storyId: s5._id, title: "The Hunt", chapterNumber: 1, content: "The wolf was massive, unlike any I'd ever seen..." }
    ];

    await Chapter.insertMany(chapters);

    console.log("Chapters created.");
    console.log("Seeding complete!");
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
