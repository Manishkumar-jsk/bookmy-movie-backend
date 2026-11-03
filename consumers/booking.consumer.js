import { getChannel } from "../config/rabbitmq.js";
import { QUEUES } from "../queues/queueNames.js";
import { sendBookingEmail } from "../services/email.service.js";

export const consumeBookingEmail = async () => {
    const channel = getChannel();

    await channel.assertQueue(QUEUES.BOOKING_EMAIL,{
        durable:true
    })

    channel.consume(
        QUEUES.BOOKING_EMAIL,
        async (message) => {
            try {
                const booking = JSON.parse(message.content.toString());
                console.log(booking,"booking")
                await sendBookingEmail(
                    booking.email,
                    booking.eventName
                )

                channel.ack(message);
            } catch (error) {
                console.log(error);
                channel.nack(message);
            }
        }
    )
}