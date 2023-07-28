const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// createCourse handler function
exports.createCourse = async (req, res) => {
    try {
        // fetch data from request body
        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            category,
        } = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if (
            !courseName ||
            !courseDescription ||
            !whatYouWillLearn ||
            !price ||
            !category ||
            !thumbnail
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: ", instructorDetails);

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details not found",
            });
        }

        // check given tag is valid or not
        const categoryDetails = Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category Details not found",
            });
        }

        // upload image on cloudinary
        const thumbnailImage = await uploadImageToCloudinary(
            thumbnail,
            process.env.FOLDER_NAME
        );

        // create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });

        // add the new course to the user schema of Instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );

        // update the tag schema
        await Category.findByIdAndUpdate(
            { _id: categoryDetails._id },
            {
                $push: {
                    course: newCourse._id,
                },
            },
            { new: true }
        );

        // return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "failed to create course",
            error: error.message,
        });
    }
};

// getAllCourses handler function

exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find(
            {},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndRewiews: true,
                studentEnrolled: true,
            }
        )
            .populate("instructor")
            .exec();

        return res.status(200).json({
            success: true,
            message: "Data for all Courses fetched successfully",
            data: allCourses,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course data",
            error: error.message,
        });
    }
};

// getComplete course details
exports.getCourseDetails = async (req, res) => {
    try {
        // fetch data from request
        const { courseId } = req.body;
        // validate course id
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Please provide course id",
            });
        }

        const courseDetails = await Course.findById(courseId)
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndRewiews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            }).exec();

            // validation
            if(!courseDetails){
                return res.status(400).json({
                    success: false,
                    message: `Could not find the course with ${courseId}`,
                });
            }

            // return response
            return res.status(200).json({
                success:true,
                message:"Course Details fetched successfully",
                data:courseDetails
            })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
