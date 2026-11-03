import { createClient } from "redis";

// if(!process.env.REDIS_URL){
//     throw new Error("Redis url is missing....")
// }

const redisClient = createClient({
    url: process.env.REDIS_URL
});

//tcp connection establish
redisClient.on("connect", () => {
    console.log("Redis Connected....");
});

//client authentication and initialization process complete
redisClient.on("ready",() => {
    console.log("Redis Ready....")
})

redisClient.on("reconnecting",() => {
    console.log("Redis Reconnecting....")
})

redisClient.on("end",() => {
    console.log("Redis Connection Closed");
})

redisClient.on("error", (err) => {
    console.log("Redis Error:", err.message);
});

export default redisClient;