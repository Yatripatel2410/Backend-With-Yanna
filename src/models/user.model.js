import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"  //create token ,,, creating data without optional encryption  // beared token hai means jo usko beer karta hai usko sahi maan leta hai
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
            required:[true, 'Password Is Required']
        },
        refreshToken: {
            type: String,
        }
    },
    // timestamps: true se createdAt , updatedAt mil hi jayega 
    {
        timestamps: true
    }
)

// Pre middleware function are execute one after another, when each middleware calls next.
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();    // if modify hai to hi firse save karo otherwise go to next

    this.password = await bcrypt.hash(this.password, 10)   // here hash roung = 10
    next()
})  // pre("save", callback) here in callback we can not use () => {} bcz issme this function ka reference nhi hota bcz context nhi pata hota and yahan pe context pata hona bahot jaruri hota hai

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//  sign method token generate karega
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

// refresh tokem me kaam information hoti hai bcz wo baar baar refresh hota rehta hai
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