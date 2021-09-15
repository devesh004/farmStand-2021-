const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Please enter Your email to Create account'],
        unique: true
    },
    phoneNo: {
        type: Number,
        require: true,
        unique: true
    },
    farm: {
        type: Schema.Types.ObjectId,
        ref: 'farm'
    }
})

userSchema.plugin(passportLocalMongoose) //give password(hash password) and username 


const User = mongoose.model('User', userSchema);
module.exports = User;