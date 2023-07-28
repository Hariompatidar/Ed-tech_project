const mongoose = require("mongoose");
require("dotenv").config();

const connect = () => {
    mongoose
        .connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log("DB connected successfully"))
        .catch((error) => {
            console.log("Error in connecting with Database");
            console.log(error);
            process.exit(1);
        });
};

module.exports = connect;
