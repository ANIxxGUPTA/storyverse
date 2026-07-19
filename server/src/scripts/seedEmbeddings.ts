import mongoose from 'mongoose';
import { embed } from '../services/embeddings.service';
import Story from '../models/Story';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;

async function generateEmbeddings() {
  try {
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");



    const stories = await Story.find({});
    console.log(`Found ${stories.length} stories. Generating embeddings...`);

    let processed = 0;
    for (const story of stories) {
      if (!story.title || !story.description) continue;
      
      const contextText = `Title: ${story.title}. Genre: ${story.genre}. Description: ${story.description}`;
      
      // Generate embedding
      const vector = await embed(contextText);
      
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
