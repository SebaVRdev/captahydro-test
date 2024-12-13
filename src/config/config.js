import dotenv from "dotenv";
dotenv.config();

export const DATABASE_VAR = {
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    port: parseInt(process.env.DB_PORT || "3306"),  
    password: process.env.DB_PASSWORD,  
    database: process.env.DB_NAME 
}