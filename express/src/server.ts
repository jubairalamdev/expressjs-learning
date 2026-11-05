import express, { type Application, type Request, type Response } from "express"
import {Pool} from "pg"
const app: Application = express()
const port = 5000

app.use(express.json())

const pool = new Pool({
    connectionString : "postgresql://neondb_owner:npg_wmkWecQ6ni1U@ep-solitary-fire-za7ymwxk-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
})

app.get('/', (req: Request, res: Response) => {
//   res.send('Hello World!')
    res.status(200).json({
        "message" : "Express Server",
        "author" : "Next Level"
    })
});

app.post('/', async(req: Request, res: Response)=>{
    // console.log(req.body)
    const body = req.body
    res.status(201).json({
        message: "Created",
        data: body
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})