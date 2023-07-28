const mongoose= require('mongoose');

const contactUsSchema= new mongoose.Schema({
    firstName:{
        type:String,
    },
    lastName:{
        type:String,
    },
    email:{
        type:String,
    },
    countryCode:{
        type:String,
    },
    phoneNumber:{
        type:Number,
    },
    message:{
        type:String,
    }
})

module.exports= mongoose.model("Contactus", contactUsSchema);