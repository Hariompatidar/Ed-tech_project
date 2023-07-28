const Category = require("../models/Category");

// create tag ka handler function
exports.createCategory = async () => {
    try {
        // fetch data from request body
        const { name, description } = req.body;

        // validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // create entry in DB
        const categoryDetails = await Category.create({
            name,
            description,
        });
        console.log(categoryDetails);
        return res.status(200).json({
            success: true,
            message: "Categoies Created Successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// getAllCategories handler function

exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find(
            {},
            // { name: true, description: true }
        );

        return res.status(200).json({
            success: true,
            message: "All categories returned successfully",
            data: allCategories,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.categoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body;

        // get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
            .populate("courses")
            .exec();
        // Handle the case when the category is not found
        if (!selectedCategory) {
            console.log("Category not found");
            return res.status(400).json({
                success: false,
                message: "Category not found",
            });
        }
        // Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.");
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            });
        }
        const selectedCourses = selectedCategory.courses;

        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        })
            .populate("courses")
            .exec();
        let differentCourses = [];
        for (const category of categoriesExceptSelected) {
            differentCourses.push(...category.courses);
        }

        // Get top selling courses accross all categories
        const allCategories = await Category.find().populate("courses");
        const allCourses = allCategories.flatMap(
            (category) => category.courses
        );
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10);

        return res.status(200).json({
            success: true,
            message: "Category Courses returned successfully",
            selectedCourses,
            differentCourses,
            mostSellingCourses
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message,
        })
    }
};
