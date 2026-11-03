import {getChannel} from "../config/rabbitmq.js";
import {QUEUES} from "../queues/queueNames.js";

export const publishBookingEmail = async (booking) => {
    const channel = getChannel();

    await channel.assertQueue(QUEUES.BOOKING_EMAIL,{
        durable:true
    })

    channel.sendToQueue(
        QUEUES.BOOKING_EMAIL,
        Buffer.from(JSON.stringify(booking)),
        {
            persistent:true
        }
    )
}