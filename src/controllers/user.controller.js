import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    // just for basic 1st time 
    // res.status(200).json({
    //     message: "Backend With Yanna"
    // })

    // now do this step sequencially
    // get user details from frontend
    // validation - not empty
    // check if user already exists : check throw username and email both
    // check for image , check for avtar
    // upload them to cloudinary, check avtar upload huaa ki nhi
    // create user object then - create entry in db
    // then remove password and refresh token field from responce
    // check for user creation
    // return responce

    const {fullname, email, username, password} = req.body
        // console.log("email: ", email);

        // if(fullname == ""){
        //     throw new ApiError(400, "fullname is required")
        // }
        if(
            [fullname, email, username, password].some((field) => field?.trim() === "")
        ){
            throw new ApiError(400, "All Fields Are Required")
        }
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if(existedUser){
            throw new ApiError(409, "User With This Email Or Username Is Already Exists")
        }

        // console.log(req.files);

        const avatarLocalPath = req.files?.avatar[0].path;
       // const coverImageLocalPath = req.files?.coverImage[0]?.path;
        // or
        //classic if-else 
        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar File Is Required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400, "Avatar File Is Required")
        }

        // database entry
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

        // check user bana hai ki nhi... empty to nhi hai na?
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            throw new ApiError(500, "Somthing Went Wrong While Registring The User")
        }
   
        // return res if user ban gaya hai
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User Register Succesfully")
        )

})

export {
    registerUser,
}