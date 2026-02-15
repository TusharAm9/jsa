import { PrismaClient } from "./app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Defined" : "Undefined");

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const count = await prisma.user.count();
        console.log("User count:", count);
    } catch (error) {
        console.error("Connection failed:", error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
