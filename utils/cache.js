import redisClient from "../config/redis.js";

export const getCache = async (key) => {
    try {
        const cache = await redisClient.get(key);

        if(!cache) return null;

        return JSON.parse(cache);
    } catch (error) {
        console.error("Redis Get Error:",error.message);
        return null;
    }
}

export const setCache = async(key,value,ttl=300) => {
    try {
        await redisClient.set(key,JSON.stringify(value),{EX:ttl});
    } catch (error) {
        console.error("Redis Set Error:",error.message);
    }
}

export const deleteCache = async (key) => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error("Redis Delete Error:",error.message);
    }
}