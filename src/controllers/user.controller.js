import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refereshToken = user.generateRefreshToken()

        user.refereshToken = refereshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refereshToken}

    }catch(error){
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    // req body se -> data leke aao
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie

    const {email, username, password} = req.body

    if(!username && !email){
        throw new ApiError(400, "username or password is required")
    }

    // alternative of above code
    // if(!username || !email){
    //     throw new ApiError(400, "username or password is required")
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    if (typeof user.isPasswordCorrect !== "function") {
        console.log("Method missing! User object:", user);
        return res.status(500).json({ message: "Server error: isPasswordCorrect is not a function" });
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refereshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refereshToken", refereshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, 
                accessToken,
                refereshToken
            },
            "User Logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refereshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refereshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refereshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefereshToken = req.cookies.refereshToken || req.body.refereshToken

    if(!incomingRefereshToken){
        throw new ApiError(401, "unauthorized request")
    }
    
    try {
        const decodedToken = jwt.verify(
            incomingRefereshToken,
            process.env.ACCESS_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefereshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefereshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return req
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refereshToken", newRefereshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refereshToken: newRefereshToken
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refereshAccessToken
}