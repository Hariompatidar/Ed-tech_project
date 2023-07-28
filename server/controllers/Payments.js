const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");

const mailSender = require("../utils/mailSender");
const {
    courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail.js");
const { default: mongoose } = require("mongoose");

//capture the payment and initialte the Pazorpay order
// exports.capturePayment = async (req, res) => {
//     try {
//         // get courseId and userId
//         const { courseId } = req.body;
//         const userId = req.user.id;
//         // validation
//         //valid courseId
//         if (!courseId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide a valid course id",
//             });
//         }
//         // valid courseDetails
//         let course;
//         try {
//             course = await Course.findById(courseId);
//             if (!course) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Could not find the course",
//                 });
//             }
//             // user already pay for the same course
//             const uid = new mongoose.Types.ObjectId(userId);
//             if (course.studentsEnrolled.includes(uid)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Student is already enrolled",
//                 });
//             }
//         } catch (error) {
//             console.log(error);
//             return res.status(500).json({
//                 success: false,
//                 message: error.message,
//             });
//         }
//         // oreder create
//         const amount = course.price;
//         const currency = "INR";
//         const options = {
//             amount: amount * 100,
//             currency,
//             receipt: Math.random(Date.now()).toString(),
//             notes: {
//                 courseId,
//                 userId,
//             },
//         };
//         // create the order
//         try {
//             // initiate the payment using razorpay
//             const paymentResponse = await instance.orders.create(options);
//             console.log(PaymentResponse);

//             // return res.status(200).json({
//             //     success: true,
//             //     courseName: course.courseName,
//             //     courseDescripton: course.courseDescripton,
//             //     thumbnail: course.thumbnail,
//             //     orderId: PaymentResponse.id,
//             //     currency: PaymentResponse.currency,
//             //     amount: PaymentResponse.amount,
//             // });
//             res.status(200).json({
//                 success: true,
//                 message: paymentResponse,
//             });
//         } catch (error) {
//             console.log(error);
//             res.json({
//                 success: false,
//                 message: "Could not initiate order",
//             });
//         }
//         // return response
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// };

exports.capturePayment = async (req, res) => {
    const { courses } = req.body;
    const userId = req.user.id;

    if (courses.length === 0) {
        return res.json({
            success: false,
            message: "Please provide Course Id",
        });
    }

    let totalAmount = 0;

    for (const course_id of courses) {
        let course;
        try {
            course = await Course.findById(course_id);
            if (!course) {
                return res
                    .status(200)
                    .json({
                        success: false,
                        message: "Could not find the course",
                    });
            }

            const uid = new mongoose.Types.ObjectId(userId);
            if (course.studentsEnrolled.includes(uid)) {
                return res
                    .status(200)
                    .json({
                        success: false,
                        message: "Student is already Enrolled",
                    });
            }

            totalAmount += course.price;
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: error.message });
        }
    }
    const currency = "INR";
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
    };

    try {
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success: true,
            message: paymentResponse,
        });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ success: false, mesage: "Could not Initiate Order" });
    }
};


// verify signature of Razorpay and Server
exports.verifySignature = async (req, res) => {
    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);

    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");
    if (signature === digest) {
        console.log("Payment is Authorised");

        const { courseId, userId } = req.body.payload.payment.entity.notes;

        try {
            // Fullfill the action
            // Find the course and enroll student in it
            const enrolledCourse = await Course.findOnAndUpdate(
                { _id: courseId },
                { $push: { studentEnrolled: userId } },
                { new: true }
            );

            if (!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: "Course not found",
                });
            }

            console.log(enrolledCourse);

            // find the student and add the course to their list enrolled courses me
            const enrolledStudent = await User.findOnAndUpdate(
                { _id: userId },
                { $push: { courses: courseId } },
                { new: true }
            );

            console.log(enrolledCourse);

            // mail send kar do confirmation wala
            const emailResponse = await mainSender(
                enrolledStudent.email,
                "Congratulation from Hariom Patidar",
                "Congratulation you are onboard into new Coding course from us"
            );
            console.log(emailResponse);
            return res.status(200).json({
                success: true,
                message: "Signature verified and course added",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    } else {
        return res.status(400).json({
            success: false,
            message: "Invalid request",
        });
    }
};
