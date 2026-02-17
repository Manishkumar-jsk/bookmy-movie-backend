import {z} from "zod";

export const createCategorySchema = z.object({
    name:z.string({required_error:"name is required"}).trim()
})