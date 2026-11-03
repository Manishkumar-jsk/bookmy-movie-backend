import amqp from "amqplib";

let channel;
let connection;

export const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);

        channel = await connection.createChannel();

        console.log('RabbitMQ Connected')
    } catch (error) {
        console.error("RabbitMQ Error:",error.message);
    }
}

export const getChannel = () =>  {
    if(!channel){
        throw new Error("RabbitMQ Channel not initialized");
    }

    return channel;
};