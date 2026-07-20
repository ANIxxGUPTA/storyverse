const mongoose = require('mongoose');
const User = require('./dist/models/User').default;
const Story = require('./dist/models/Story').default;
const Chapter = require('./dist/models/Chapter').default;
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing
    await User.deleteMany({ email: 'seeduser@test.com' });
    
    // Create seed user
    const seedUser = await User.create({
      username: 'StoryVerseAuthor',
      email: 'seeduser@test.com',
      password: 'password123',
    });
    
    const stories = [
      {
        title: "The Quantum Enigma",
        description: "In a distant future, a lone scientist discovers a frequency that allows communication across parallel universes. But the voices on the other side are begging for help.",
        genre: "Sci-Fi",
        tags: ["time-travel", "multiverse", "dystopian"],
        author: seedUser._id
      },
      {
        title: "Chronicles of Aethelgard",
        description: "An exiled knight must forge an unlikely alliance with a rogue sorcerer to reclaim his honor and save his kingdom from an ancient, awakening evil.",
        genre: "Fantasy",
        tags: ["magic", "dragons", "epic-fantasy"],
        author: seedUser._id
      },
      {
        title: "Echoes of the Forgotten",
        description: "A seasoned detective investigates a series of murders that eerily mirror cold cases from a century ago, leading to a dark secret hidden within the city's elite.",
        genre: "Mystery",
        tags: ["noir", "crime", "detective"],
        author: seedUser._id
      },
      {
        title: "Whispers in the Dark",
        description: "A group of teenagers explore an abandoned asylum on a dare, only to realize the horrifying legends aren't just myths—they are hungry.",
        genre: "Thriller",
        tags: ["horror", "suspense", "supernatural"],
        author: seedUser._id
      },
      {
        title: "The Clockwork Heart",
        description: "In a steampunk Victorian London, a brilliant inventor builds a mechanical heart to save her dying sister, but soon discovers it holds a devastating power.",
        genre: "Sci-Fi",
        tags: ["steampunk", "victorian", "invention"],
        author: seedUser._id
      }
    ];

    for (const story of stories) {
      await Story.deleteMany({ title: story.title });
      const created = await Story.create(story);
      await Chapter.create({
        storyId: created._id,
        title: "Chapter 1: The Beginning",
        content: "This is the first chapter of " + story.title + ". The journey starts here...",
        chapterNumber: 1,
        status: 'published',
        publishAt: new Date(),
        wordCount: 15
      });
      console.log("Created story:", story.title);
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
