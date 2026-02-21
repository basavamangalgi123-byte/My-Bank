import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  balance: { type: Number, default: 1000 }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
