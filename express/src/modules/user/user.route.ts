import { Router, type NextFunction, type Request, type Response } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";

const router = Router()

// Post a new user to the database
router.post('/', userController.createUser)

// Get all the users from database
router.get('/', auth(), userController.getAllUsers)

// Get single user from database
router.get('/:id', userController.getSingleUser)

// Put and update a single user 
router.put('/:id', userController.putSingleUser)

// Delete a single user
router.delete('/:id', userController.deleteSingleUser)

export const userRoute = router
