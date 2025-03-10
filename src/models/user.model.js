import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"  // creating data without optional encryption  // beared token hai means jo usko beer karta hai usko sahi maan leta hai
import bcrypt from "bcrypt"     // help for hash password


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true     // searching filed ke liye index use karte hai
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true     // searching filed ke liye index use karte hai
        },
        avatar: {
            type: String,   // cloudinary url
            required: true
        },
        coverImage: {
            type: String
        },
        // this is an array bcz multiple history hogi issme and add karenge hum
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required:[true, "Password Is Required"]
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)   // here hash roung = 10
    next()
})  // pre("save", callback) here in callback we can not use () => {} bcz issme this function ka reference nhi hota context nhi pata hota and yahan pe context pata hona bahot jaruri hota hai

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)