import mongoose from "mongoose"
import {config} from "../../src/config/config.js"

export const connectionDB=async()=>{
    try {
        await mongoose.connect(
           config.MONGO_URL,
        {
            dbName: config.DB_NAME
        }
        )
        console.log("Mongoose connection to DB successfully initiated")
    } catch (error) {
        throw new Error(`Error al conectar a DB: ${error}`)
    }
}
