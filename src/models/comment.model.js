import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"    // mongoose ka jo model banate hai ussi ka refrence dete hai
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

commentSchema.plugin(mongooseAggregatePaginate)     // plugin use for give us ability to kahan se kahan tak videos bhej ne hai and next call me kahan se start karke kahan tak video dene hai

export const Comment = mongoose.model("Comment",commentSchema)