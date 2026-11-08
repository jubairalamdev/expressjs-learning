import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/user/user.route"
import { profileRoute } from "./modules/profile/profile.route"
import { authRoute } from "./modules/auth/auth.route"
const app: Application = express()
import fs from "fs"
import { logger } from "./middleware/logger"

app.use(express.json())

app.use(logger)

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