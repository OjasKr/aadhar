import mongoose from "mongoose"
import User from "../models/userSchema.js"
import dotenv from "dotenv"

dotenv.config();

const MONGO_URI = "mongodb://127.0.0.1:27017/aadharDB"

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to aadharDB"))
  .catch(err => console.log(err))

const mockUsers = [
  { aadhaar: "123456789012", mobile: "9876543210" },
  { aadhaar: "234567890123", mobile: "8765432109" },
  { aadhaar: "345678901234", mobile: "7654321098" },
  { aadhaar: "456789012345", mobile: "6543210987" },
  { aadhaar: "567890123456", mobile: "9123456780" },
  { aadhaar: "678901234567", mobile: "9012345678" },
  { aadhaar: "789012345678", mobile: "8123456709" },
  { aadhaar: "890123456789", mobile: "7012345678" },
  { aadhaar: "901234567890", mobile: "6213456789" },
  { aadhaar: "112233445566", mobile: "9988776655" }
]

async function initDB() {
  try {
    await User.deleteMany({})
    await User.insertMany(mockUsers)
    console.log("aadharDB → users collection initialized with 10 entries")
    mongoose.connection.close()
  } catch (err) {
    console.error(err)
  }
}

initDB()
