import { getChannel } from "../config/rabbitmq.js";
import { QUEUES } from "../queues/queueNames.js";
import { importDataFile } from "../services/import_data.service.js";


export const consumeImportFile = async () => {
    const channel = getChannel();

    await channel.assertQueue(QUEUES.IMPORT_QUEUE,{durable:true});

    channel.consume(
        QUEUES.IMPORT_QUEUE,
        async (message) => {
            try {
                const data = JSON.parse(message.content.toString());

                // service
                await importDataFile(data);
                
                channel.ack(message);
            } catch (error) {
                console.log(error);
                channel.nack(message);
            }
        }
    )
}