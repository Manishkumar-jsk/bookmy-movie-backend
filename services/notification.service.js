import Notification from "../models/Notification.js"

export const getNotificationService = async ({user}) => {
    const data = await Notification.aggregate([
      {
        $match:{
          $or:[
            {
              user:user
            },
            {
              isGlobal:true
            },
            {
              isGlobal:false
            }
          ]
        }
      },
      {
        $lookup:{
          from:"notification_reads",
          let:{id:"$_id"},
          pipeline:[
            {
              $match:{
                $expr:{
                  $eq:["$notificationId","$$id"]
                }
              }
            }
          ],
          as:"notification_read"
        }
      },
      {
        $project:{
          user:1,
          isGlobal:1,
          title:1,
          message:1,
          type:1,
          referenceId:1,
          createdAt:1,
          isRead:{
            $arrayElemAt:["$notification_read.isRead",0]
          }
        }
      }
    ])

    return data;

}