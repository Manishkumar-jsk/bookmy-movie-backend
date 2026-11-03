import mongoose from "mongoose";

const notificationRead = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:null
        },
        notificationId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Notification",
            default:null,
        },
        isRead:{type:Boolean,default:false}
    }
)

export default mongoose.model("Notification_Read",notificationRead)