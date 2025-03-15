// asyncHandler.js file method bana ke usko export ke liye banani hoti hai

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}  // (or) try-catch se bhi kar sakte hai


export {asyncHandler}

// higher order function: jo function ko as a parameter bhi exept kar sakte hai ya to usko return kar sakte hai
// yahan pe humne parameter me hi ek fn(function) as a parameter liya hai
// const asyncHandler = () => {}
// const asyncHandler = (func) => { () => {} }
// const asyncHandler = (func) => { async () => {} }
/*
const asyncHandler = (fn) => async (req, res, next) => {
    try{
        await fn(req, res, next)
    }
    catch(error){
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
*/