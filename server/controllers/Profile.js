const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
    try {
        //get data
        const {
            gender,
            dateOfBirth = "",
            about = "",
            contactNumber,
        } = req.body;
        // get user id
        const id = req.user.id;
        //validation
        if (!contactNumber || !gender || !id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        // find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        // save the updated profile data
        await profileDetails.save();
        // return response
        return res.status(200).json({
            success: true,
            message: "Profile Updated successfully",
            // profileDetails
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// delete Account

exports.deleteAccount = async (req, res) => {
    try {
        // find account id
        const id = req.user.id;
        // check valid id (validation)
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        // delete profile
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        // ###############################
        // TODO : HW unenroll user from all enrolled courses

        // ##############################
        // Use SetTimeOut before deleting the account
        // take 24 hours to delete the account
        // const deletionTimeout = 24 * 60 * 60 * 1000;
        // setTimeout(async () => {
        //     // delete user
        //     await User.findByIdAndDelete({ _id: id });
        // }, deletionTimeout);

        await User.findByIdAndDelete({ _id: id });

        // return response
        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// TODO : create one more method to stop the delete account request
// Use cron job for this
// cron job: .schedule method and .stop method

exports.getAllUserDetails = async (req, res) => {
    try {
        //get user id
        const id = req.user.id;
        // get user data
        const userDetails = await User.findById(id)
            .populate("additionalDetails")
            .exec();

        // return response
        return res.status(200).json({
            success: false,
            message: "User Data Fetched Successfully",
            userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
