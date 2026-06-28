require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findById("6a2698af223f63b7852c3669");
  console.log("User:", user);
  
  mongoose.disconnect();
}
run();
