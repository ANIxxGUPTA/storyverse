import mongoose from 'mongoose';
import { pipeline } from '@xenova/transformers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const uri = process.env.MONGODB_URI;

const StorySchema = new mongoose.Schema({
  title: String,
  genre: String,
  description: String,
  embedding: { type: [Number], default: [] },
}, { strict: false });

const Story = mongoose.models.Story || mongoose.model("Story", StorySchema);

async function generateEmbeddings() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    console.log("Loading embedding model (this may take a moment on first run)...");
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true, // Uses less memory and runs faster
    });
    console.log("Model loaded successfully!");

    const stories = await Story.find({});
    console.log(`Found ${stories.length} stories. Generating embeddings...`);

    let processed = 0;
    for (const story of stories) {
      if (!story.title || !story.description) continue;
      
      const contextText = `Title: ${story.title}. Genre: ${story.genre}. Description: ${story.description}`;
      
      // Generate embedding
      const output = await extractor(contextText, {
        pooling: 'mean',
        normalize: true,
      });
      
      // output.data is a Float32Array containing the 384-dimensional vector
      const vector = Array.from(output.data);
      
      story.embedding = vector;
      await story.save();
      
      processed++;
      console.log(`[${processed}/${stories.length}] Generated embedding for "${story.title}"`);
    }

    console.log(`Successfully generated and saved ${processed} embeddings!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

generateEmbeddings();
