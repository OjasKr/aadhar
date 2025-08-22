import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  aadhaar: { type: String, required: true, unique: true },
  mobile: { type: String, required: true }
})

const User = mongoose.model("User", userSchema, "users")

export default User
