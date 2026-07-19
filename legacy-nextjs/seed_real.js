const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

const lorum1 = `# The Beginning

The sky above the port was the color of television, tuned to a dead channel.
"It's not like I'm using," Case heard someone say, as he shouldered his way through the crowd around the door of the Chat. "It's like my body's developed this massive drug deficiency."
It was a Sprawl voice and a Sprawl joke. The Chatsubo was a bar for professional expatriates; you could drink there for a week and never hear two words in Japanese.

These were the days when the city was a sprawling, endless maze of neon and chrome. Rain slicked the streets, reflecting the vibrant advertisements that plastered every available surface. In the distance, the hum of hover-cars provided a constant, low-frequency background noise to the bustling life below.

## The Meet

She was waiting in a booth in the back, nursing a synthetic gin and tonic. Her eyes were shielded by mirrored shades, a classic model from the early 20s. 
"You're late," she said, her voice a smooth alto that carried over the din of the bar.
"Traffic," I replied, sliding into the booth opposite her. "The mag-lev over Sector 4 broke down again."

We sat in silence for a moment, the tension palpable. We both knew why we were here, but neither wanted to be the first to bring it up. The data drive in my pocket felt heavier than it should have, a tiny piece of metal and silicon that held the key to bringing down the biggest mega-corp on the Eastern seaboard.

"Do you have it?" she finally asked, her gaze fixed on the table between us.
I nodded slowly. "Yeah. It cost me, though. Two of my best contacts are dark, and I had to burn a safe house."

She reached out a hand, palm up. "Hand it over, Case. We don't have much time."
I hesitated, my fingers brushing against the cold metal of the drive in my pocket. Once I handed it over, there was no going back. We would be targets for the rest of our short, violent lives. But then again, we already were.

I pulled the drive out and placed it in her waiting hand. She closed her fingers around it tightly, a small, triumphant smile playing on her lips. "Good boy," she murmured. "Now, let's get out of here before the corp-cops show up."`;

const lorum2 = `# Chapter 2: The Escape

The alarm blared, a piercing shriek that cut through the silence of the facility. Red lights flashed, casting long, frantic shadows against the concrete walls. We were running now, our boots pounding against the floor in a desperate rhythm.

"This way!" she shouted, pointing towards a heavy steel door at the end of the corridor. "The extraction point is just beyond that!"

I didn't argue. My lungs were burning, my legs aching with every step, but fear pushed me forward. Behind us, the sounds of pursuit were growing louder—heavy boots, shouted orders, the unmistakable hum of energized plasma rifles.

We hit the door hard, her shoulder slamming into the metal. It didn't budge. "Locked!" she cursed, frantically tapping at the keypad next to the frame. "Damn it, they've overridden the local security protocols!"

"Let me try," I said, shoving her aside. I pulled a small, illegal decryption spike from my belt and jammed it into the data port below the keypad. The small screen flared to life, lines of code scrolling rapidly as the spike went to work.

"Hurry, Case," she urged, glancing over her shoulder. "They're almost here!"

"I'm going as fast as I can!" I yelled back, my fingers flying across the tiny interface. Come on, come on... With a satisfying click, the heavy deadbolts slid back, and the door swung open.

We tumbled through, hitting the damp alleyway outside just as the first corp-cops rounded the corner behind us. Plasma bolts scorched the air where we had been a second before, shattering the concrete around the doorway.

"Move, move, move!" she screamed, grabbing my arm and hauling me to my feet. We sprinted down the alley, the sounds of sirens wailing in the distance, joining the chaotic symphony of our escape. We had the data, but the night was far from over.`;


async function seedReal() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for REAL seeding...");

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
    
    const passwordHash = await bcrypt.hash("password123", 10);
    
    // Create REAL looking users
    const u1 = await User.create({ username: "ElenaWrites", email: "elena@example.com", password: passwordHash });
    const u2 = await User.create({ username: "MarcusDawn", email: "marcus@example.com", password: passwordHash });
    const u3 = await User.create({ username: "SarahJ", email: "sarah@example.com", password: passwordHash });
    const u4 = await User.create({ username: "DavidTheAuthor", email: "david@example.com", password: passwordHash });

    console.log("Real users created.");

    // Create REAL looking stories
    const s1 = await Story.create({
      title: "Neon Shadows",
      slug: "neon-shadows",
      description: "In the sprawling metropolis of Neo-Tokyo, a rogue AI begins leaving cryptic messages for a washed-up detective. What starts as a simple missing persons case unravels into a conspiracy that could bring down the entire grid.",
      genre: "Sci-Fi",
      tags: ["cyberpunk", "mystery", "dystopian", "detective"],
      author: u1._id,
      views: 5204
    });

    const s2 = await Story.create({
      title: "The Obsidian Crown",
      slug: "the-obsidian-crown",
      description: "For centuries, the Kingdom of Aethelgard has known peace. But when the King dies under mysterious circumstances, his exiled daughter must return to claim the Obsidian Crown before her treacherous uncle plunges the realm into civil war.",
      genre: "Fantasy",
      tags: ["magic", "royalty", "epic-fantasy", "war"],
      author: u2._id,
      views: 8930
    });

    const s3 = await Story.create({
      title: "Whispers in the Dark",
      slug: "whispers-in-the-dark",
      description: "A family moves into an old Victorian house to start fresh. But the house has its own plans. Late at night, whispers echo through the halls, and shadows move independently of the light.",
      genre: "Horror",
      tags: ["haunted-house", "ghosts", "psychological", "creepy"],
      author: u3._id,
      views: 2150
    });

    const s4 = await Story.create({
      title: "Summer at Cape Cod",
      slug: "summer-at-cape-cod",
      description: "Two childhood friends reunite at their families' shared beach house after ten years apart. Old feelings resurface, but secrets from the past threaten to tear them apart forever.",
      genre: "Romance",
      tags: ["friends-to-lovers", "summer", "contemporary", "angst"],
      author: u4._id,
      views: 12400
    });

    const s5 = await Story.create({
      title: "The Clockwork Assassin",
      slug: "the-clockwork-assassin",
      description: "In a steampunk London, a master clockmaker is forced to build the ultimate weapon for a shadowy organization. His only hope is a rebellious airship pilot who hates everything he stands for.",
      genre: "Fantasy",
      tags: ["steampunk", "adventure", "action", "enemies-to-lovers"],
      author: u1._id,
      views: 4500
    });
    
    const s6 = await Story.create({
      title: "Beyond the Event Horizon",
      slug: "beyond-the-event-horizon",
      description: "The crew of the starship Odyssey investigates a distress signal near a black hole. What they find defies the laws of physics and threatens the very fabric of reality.",
      genre: "Sci-Fi",
      tags: ["space-opera", "aliens", "exploration", "hard-scifi"],
      author: u2._id,
      views: 7800
    });

    console.log("Real stories created.");

    // Create Chapters with ACTUAL substantial content
    const chapters = [
      { storyId: s1._id, title: "Chapter 1: The Hack", chapterNumber: 1, content: lorum1 },
      { storyId: s1._id, title: "Chapter 2: The Run", chapterNumber: 2, content: lorum2 },
      { storyId: s1._id, title: "Chapter 3: Safehouse", chapterNumber: 3, content: "# Chapter 3\n\nWe finally made it to the safehouse. The air smelled of ozone and stale syn-caf..." },
      
      { storyId: s2._id, title: "Prologue: The Fall", chapterNumber: 1, content: "# Prologue\n\nBlood stained the marble floors of the throne room. The King was dead. And the shadow of the Obsidian Crown loomed heavy over the realm." },
      { storyId: s2._id, title: "Chapter 1: Exile", chapterNumber: 2, content: "## Exile\n\nElara watched the shores of her homeland fade into the mist. She swore she would return." },
      
      { storyId: s3._id, title: "The Move", chapterNumber: 1, content: "# Moving Day\n\nThe boxes were stacked high in the grand foyer. Dust motes danced in the pale sunlight filtering through the stained glass windows. 'It's perfect,' Sarah lied, feeling a chill run down her spine." },
      
      { storyId: s4._id, title: "Arrival", chapterNumber: 1, content: "# Chapter 1\n\nThe salty breeze off the Atlantic Ocean whipped through my hair as I pulled into the gravel driveway. The house looked exactly the same as it had ten years ago. And so did he, waiting on the porch." },
      { storyId: s4._id, title: "First Dinner", chapterNumber: 2, content: "## Dinner\n\nThe tension at the table was thick enough to cut with a knife. Neither of us had brought up the summer of '16, but we were both thinking about it." },
      
      { storyId: s5._id, title: "Gears and Grease", chapterNumber: 1, content: "# Chapter 1\n\nThe workshop smelled of brass polish and old oil. Elias adjusted his magnifying loupe, delicately placing the final gear into the automaton's chest cavity." },
      
      { storyId: s6._id, title: "The Signal", chapterNumber: 1, content: "# The Signal\n\n'Captain, we're receiving a transmission on all standard frequencies,' the comms officer reported. 'It's coming from the accretion disk of Cygnus X-1.'" },
    ];

    await Chapter.insertMany(chapters);

    console.log("Real chapters created with substantial content.");
    console.log("REAL Seeding complete!");
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedReal();
