import express, { type Application, type Request, type Response } from "express"
import { Pool } from "pg"
const app: Application = express()
const port = 5000

app.use(express.json())

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_wmkWecQ6ni1U@ep-solitary-fire-za7ymwxk-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
})

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(20),
                email VARCHAR(20) UNIQUE NOT NULL,
                password VARCHAR(20) NOT NULL,
                is_active BOOLEAN DEFAULT true,
                age INT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )    
        `)
        console.log("Database connceted successfully!")
    } catch (error) {
        console.error();
    }
}

initDB()

app.get('/', (req: Request, res: Response) => {
    //   res.send('Hello World!')
    res.status(200).json({
        "message": "Express Server",
        "author": "Next Level"
    })
});

app.post('/', async (req: Request, res: Response) => {
    // console.log(req.body)
    const { name, email, password, age } = req.body

    try {
        const result = await pool.query(`
        INSERT INTO users (name, email, password, age) 
        VALUES($1,$2,$3,$4)
        RETURNING *
    `, [name, email, password, age])

        res.status(201).json({
            message: "User created",
            data: result.rows[0]
        })
    } catch (error:any) {
        res.status(500).json({
            message: error.message,
            error: error
        })
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})