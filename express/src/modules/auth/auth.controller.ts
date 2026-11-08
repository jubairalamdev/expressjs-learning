import type { Request, Response } from "express"
import { authService } from "./auth.serivce"

const loginUser = async(req: Request, res: Response) => {
    try {
        
        const accessToken = await authService.loginUserIntoDB(req.body)
        res.status(200).json({
            success: true,
            message: "User logged in successfully!",
            data: {accessToken}
        })

    } catch (error:any) {
        res.status(404).json({
            success: false,
            message: error.message,
            error: error,
        })
    }
}

export const authController = {
    loginUser
}