
import { getUserService } from "../services/user.service.js";


export const user = async (req,res,next) => {
    try {
        const user = await getUserService({userId:req.user.id});
        res.status(200).json({success:true,user})
    } catch (error) {
        next(error)
    }
}