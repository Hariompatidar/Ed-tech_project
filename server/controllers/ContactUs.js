const Contactus = require("../models/Contactus");
const mailSender = require("../utils/mailSender");

exports.contactUs = async () => {
    try {
        // fetch data
        const {
            firstName,
            lastName,
            email,
            countryCode,
            phoneNumber,
            message,
        } = req.body;
        // validate
        if (
            !firstName ||
            !lastName ||
            !email ||
            !countryCode ||
            !phoneNumber ||
            !message
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the details",
            });
        }
        // save in DB
        const contactUsdetails = await Contactus.create({
            firstName,
            lastName,
            email,
            countryCode,
            phoneNumber,
            message,
        });
        // send mail to user
        const userMailResponse=await mailSender(
            contactUsdetails.email,
            "We get your email",
            "Thank You for contacting with us we will reach you soon..."
        ) 
        console.log(userMailResponse);
        // send mail to me
        const supportMailResponse=await mailSender(
            "patidar101hariom@gmail.com",
            "One user has contact with us",
            `User data is: ${contactUsdetails}`,
        ) 
        console.log(supportMailResponse);
        // return response
        return res.status(200).json({
            success:true,
            message:"All work done of contact us"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};
