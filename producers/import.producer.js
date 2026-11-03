import { getChannel } from "../config/rabbitmq.js";
import { QUEUES } from "../queues/queueNames.js";

export const publishImportFile = async (data) => {
    const channel = getChannel();

    await channel.assertQueue(QUEUES.IMPORT_QUEUE,{
        durable:true
    })

    channel.sendToQueue(
        QUEUES.IMPORT_QUEUE,
        Buffer.from(JSON.stringify(data)),
        {
            persistent:true
        }
    )
}