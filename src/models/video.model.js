import mongoose, {Schema} from "mongoose";
// Aggregation query's likhne ke liye use karte hai  for download write in terminal:-( npm i mongoose-aggregate-paginate-v2)
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,   // cloudinary url se le lenge
            required: true
        },
        thumbnail: {
            type: String,   // cloudinary url
            required: true
        },
        title: {
            type: String,   
            required: true
        },
        description: {
            type: String,   
            required: true
        },
        duration: {
            type: Number,   
            required: true
        },
        views:{
            type: Number,
            default: 0
        },
        isPublished:{
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)


videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)