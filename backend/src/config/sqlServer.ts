import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config()

const config = {
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || '',
    database: process.env.DB_NAME || '',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        debug: {
            packet: true,
            data: true,
            payload: true,
            token: false,
            log: true,
        }
    },
}

async function connectDB() {
    try {
        await sql.connect(config)
        console.log("Connected to the database")
    } catch (err) {
        console.error("Database connection failed:", err)
        process.exit(1)
    }
}

async function executeStoredProcedure(procedureName: string, params: { [key: string]: any } = {}) {
    try {
        const pool = await sql.connect(config)
        const request = pool.request()

        for (const key in params) {
            request.input(key, params[key])
        }

        const result = await request.execute(procedureName)
        return result
    } catch (err) {
        console.error("Error executing stored procedure:", err)
        throw err
    }
}

export{ connectDB, executeStoredProcedure }