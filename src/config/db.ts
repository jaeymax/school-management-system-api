import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();
console.log(process.env.DATABASE_URI);

if(!process.env.DATABASE_URI){
    throw new Error('DATABASE_URI NOT DEFINED IN ENVIRONMENT VARIABLES')
}

const sql = neon(process.env.DATABASE_URI as string);



console.log("Database connection established.");


export default sql;
