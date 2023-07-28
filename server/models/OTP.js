const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const otpTemplate= require('../mail/templates/emailVerificationTemplate')

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60,
    },
});

// pre and post middleware must be written before creation of the model and after the creation of the schema.

// a function -> to send emails

async function sendVerificationEmail(email,otp){
    try {
        const mailbody= await otpTemplate(otp);
        const mailResponse= await mailSender(email, "Verification email from Hariom Patidar", mailbody);
        console.log("Email sent Successfully: ", mailResponse);
    } catch (error) {
        console.log("Error occured while sending mail", error);
        throw error;
    }
};

OTPSchema.pre("save", async function(next){
    console.log("New document saved to database");

    // Only send an email when a new document is created
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
})


module.exports = mongoose.model("OTP", OTPSchema);
