import type { Request, Response } from "express"
import { userService } from "./user.service"

const createUser = async (req: Request, res: Response) => {
    // console.log(req.body)
    try {
        const result = await userService.createUserIntoDB(req.body)

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
}

const getAllUsers = async(req:Request, res:Response)=> {
    try {
        const result:any = await userService.getAllUsersFromDB()

        res.status(200).json({
            success: true,
            message: "Users retrived successfully!",
            data: result.rows,
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
    }
}

const getSingleUser = async(req: Request, res:Response)=> {
    try {
        const {id} = req.params;
        const result: any = await userService.getSingleUserFromDB(id as string)

        if (result.rows.length === 0) {
            res.status(404).json({
            success: false,
            message: "User not found!",
            data: {},
        })
        } else {
            res.status(200).json({
                success: true,
                message: "User retrived successfully!",
                data: result.rows[0],
            })
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
    }
}

const putSingleUser = async(req:Request, res: Response)=> {
    try {
        const {id} = req.params;
        // console.log(id, name)

        const result = await userService.putSingleUserToDB(id as string, req.body)

        // console.log(result)
        if (result.rows.length === 0) {
        res.status(404).json({
            success: true,
            message: "User not found",
            // data: result.rows[0],
        })
        } else {
            res.status(201).json({
                success: true,
                message: "User updated successfully!",
                data: result.rows[0],
            })
        }

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
    }
} 

const deleteSingleUser = async(req:Request, res:Response)=> {
    const {id} = req.params;
    try {
        const result = await userService.deleteSingleUserFromDB(id as string)

        if (result.rowCount === 0) {
        res.status(404).json({
            success: true,
            message: "User not found",
            // data: result.rows[0],
        })
        } else {
            res.status(201).json({
                success: true,
                message: "User deleted successfully!",
                data: {},
            })
        }

    } catch (error:any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
    }
}

export const userController = {
    createUser,
    getAllUsers,
    getSingleUser,
    putSingleUser,
    deleteSingleUser
}