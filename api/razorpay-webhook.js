import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {

  const secret = "classpay_webhook_secret_2026"

  const signature = req.headers["x-razorpay-signature"]

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex")

  if (signature !== expectedSignature) {
    return res.status(400).send("Invalid signature")
  }

  const event = req.body.event

  if (event === "payment.captured") {

    const payment = req.body.payload.payment.entity

    const paymentId = payment.notes.payment_id
    const registerNum = payment.notes.register_num

    await supabase
      .from("student_payments")
      .update({ status: "paid" })
      .eq("payment_id", paymentId)
      .eq("register_num", registerNum)

  }

  res.status(200).json({ success: true })
}