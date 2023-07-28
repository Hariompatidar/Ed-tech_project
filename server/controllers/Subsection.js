const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create Subsection
exports.createSubSection = async (req, res) => {
    try {
        //fetch data from req body
        const { sectionId, title, timeDuration, description } = req.body;
        // extract file/video
        const video = req.files.videoFile;
        // validation
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        // upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME
        );
        // create a sub- section
        const subSectionDetails = await SubSection.create({
            title,
            timeDuration,
            description,
            videoUrl: uploadDetails.secure_url,
        });
        // update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $push: {
                    subSection: SubSectionDetails._id,
                },
            },
            { new: true }
        )
            .populate("subSection")
            .exec();
        // return response
        return res.status(200).json({
            success: true,
            message: "Sub section created Successfully",
            updatedSection,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// HW: update subsection
exports.updateSubSection = async (req, res) => {
    try {
        // fetch data
        const { subSectionId, title, timeDuration, description } = req.body;
        // fetch video file
        const { video } = req.files.videoFile;

        // find the subSection
        const subSectionDetails= await SubSection.findById(subSectionId);
        // upload video on cloudinary

        if (video) {
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            );
            subSectionDetails.videoUrl= uploadDetails.secure_url;
        }
        //update details
        if(title){
            subSectionDetails.title= title;
        }
        if(timeDuration){
            subSectionDetails.timeDuration=timeDuration;
        }
        if(description){
            subSectionDetails.description=description;
        }
        await subSectionDetails.save();
        return res.status(200).json({
            success:true,
            message:"SubSection details Updated",
            subSectionDetails
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// HW delete subsection

// exports.deleteSubSection = async (req, res) => {
//     try {
//         // get ID - assuming that we are sending ID in params
//         const {subSectionId}= req.params;
//         // use findByIdAndDelete
//         await SubSection.findByIdAndDelete({subSectionId});
//         // return response
//         return res.status(200).json({
//             success:true,
//             message:"SubSection Deleted Successfully"
//         })
//     } catch (error) {
//         return res.status(500).json({
//             succss:false,
//             message:'Unable to delete SubSection, please try again',
//             error:error.message,
//         })
//     }
// };

exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }

      const updatedSection = await Section.findById(sectionId).populate("subSection")
  
      return res.json({
        success: true,
        data:updatedSection,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }
