import Notification from "../models/Notification.js";
import NotificationRead from "../models/NotificationRead.js"
import { getNotificationService } from "../services/notification.service.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

export const getNotification = async(req,res,next) => {
    try {
        const user = req.user.id;
        const data = await getNotificationService({user});
        res.status(200).json({success:true,data})
    } catch (error) {
        next(error);
    }
}

export const postReadNotification = async(req,res,next) => {
    try {
        const user = req.user.id;
        const {id,isRead} = req.body;

        if(!id){
            throw new AppError("Notification Id is required",400)
        }

        const data = await NotificationRead.findOneAndUpdate(
            {
                user,
                notificationId:new mongoose.Types.ObjectId(id)
            },
            {
                isRead
            },
            {
                new:true,
                upsert:true
            }
        )

        console.log(data,"data")

        res.status(201).json({success:true,message:"Notification read status updated successfully"})
    } catch (error) {
        next(error)
    }
}