import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/user/user.route"
import { profileRoute } from "./modules/profile/profile.route"
import { authRoute } from "./modules/auth/auth.route"
const app: Application = express()
import fs from "fs"

app.use(express.json())

app.use((req, res, next)=>{
    // console.log()
    const log = `\nMethod -> ${req.method} - Time -> ${Date.now} - URL -> ${req.url}\n`
    fs.appendFile('logger.txt', log, (err)=>{
        console.log(err)
    })
    next()
})

app.get('/', (req: Request, res: Response) => {
    //   res.send('Hello World!')
    res.status(200).json({
        "message": "Express Server",
        "author": "Next Level"
    })
});

app.use('/api/users', userRoute)
app.use("/api/profile", profileRoute)

app.use("/api/auth", authRoute)

export default app