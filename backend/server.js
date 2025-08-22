import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import path from "path"
import { fileURLToPath } from "url"
import User from "./models/userSchema.js"
import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifySid = process.env.TWILIO_VERIFY_SID
const client = twilio(accountSid, authToken)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.set("view engine", "ejs")

const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.log("❌ MongoDB connection error:", err))

let mobileCache = ""

app.get("/login", (req, res) => {
  res.render("login")
})

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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
