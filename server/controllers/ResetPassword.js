const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt= require("bcrypt");

// resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email fron req body
        const { email } = req.body;
        // check user for this email, email validation
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: "Your Email is not registered with us",
            });
        }
        // generate token
        const token = crypto.randomUUID();
        //updateuser by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            { email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000,
            },
            { new: true }
        );
        // create url
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail containing the url
        await mailSender(email,
            "Password Reset Link",
            `Password ResetLink: ${url} `);
        // return response
        return res.json({
            success:true,
            message:"Email sent successfully, please check your email for changing the password"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Somethig went wrong while sending reset password mail"
        })
    }
};

// resetPassword
exports.resetPassword= async (req,res)=>{
    try {
        //fetch data 
        const {password, confirmPassword, token}= request.body;
        // validation
        if(!password !== confirmPassword){
            return res.status(401).status({
                success:false,
                message:"Password not matching in both the input fields"
            })
        }

        //get user details from db using token
        const userDetails= await User.findOne({token});
        // if no entry found - invalid token
        if(! userDetails){
            return res.status(400).status({
                success:false,
                message:"Token is invalid please try again",
            })
        }
        // token time check
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:"Token is expired, please regenerate your token again",
            })
        }

        // hash the password
        const hashedPassword= await bcrypt.hash(password,10);
        // update the password
        await User.findOneAndUpdate(
            {token},
            {password:hashedPassword},
            {new:true}
        );
        // return respoonse
        return res.status(200).json({
            success:true,
            message:"Password reset successful",
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while reseting the password"
        })
    }
}
