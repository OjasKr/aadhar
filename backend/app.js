import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import path from "path"
import { fileURLToPath } from "url"
import User from "./models/userSchema.js"
import twilio from "twilio"

// Twilio credentials (hardcoded for now, better use env vars in production)
const accountSid = "AC3ae113970980c632d798e4f376cc18e7"
const authToken = "e22d5ebdebe892a03f5df2c7d26a9ba2"
const verifySid = "VA6d83b75e7dab6c066d65cc37a6be0c8e"
const client = twilio(accountSid, authToken)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.set("view engine", "ejs")

// MongoDB Atlas connection
const MONGO_URI = "mongodb+srv://aadharDB:wEXQYsKtPYnaj7yT@aadhardb.wxmekmu.mongodb.net/aadharDB?retryWrites=true&w=majority&appName=aadharDB"

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000
})
  .then(() => console.log("✅ Connected to MongoDB Atlas (aadharDB)"))
  .catch(err => console.log("❌ MongoDB connection error:", err))

let mobileCache = ""

// Login page
app.get("/login", (req, res) => {
  res.render("login")
})

// Aadhaar form submit → fetch mobile → send OTP via Twilio
app.post("/send-otp", async (req, res) => {
  const { aadhaar } = req.body

  try {
    const user = await User.findOne({ aadhaar })
    if (!user) return res.send("User not found in aadharDB")

    mobileCache = user.mobile.startsWith("+91") ? user.mobile : `+91${user.mobile}`

    await client.verify.v2.services(verifySid)
      .verifications
      .create({ to: mobileCache, channel: "sms" })

    console.log("OTP sent to", mobileCache)

    res.render("otp", { mobile: mobileCache })
  } catch (err) {
    console.error(err)
    res.send("Server error")
  }
})

// OTP verification
app.post("/verify-otp", async (req, res) => {
  const { otp } = req.body

  try {
    const verification_check = await client.verify.v2.services(verifySid)
      .verificationChecks
      .create({ to: mobileCache, code: otp })

    if (verification_check.status === "approved") {
      res.render("welcome", { mobile: mobileCache })
    } else {
      res.send("Invalid OTP")
    }
  } catch (err) {
    console.error(err)
    res.send("Server error during OTP verification")
  }
})

// ✅ Render requires dynamic port
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
