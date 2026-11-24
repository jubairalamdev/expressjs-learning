import bcrypt from "bcryptjs";
import { pool } from "../../db";

import jwt, { type JwtPayload } from "jsonwebtoken"
import { config } from "../../config/config";

const loginUserIntoDB = async (payload: { email: string, password: string }) => {
    const { email, password } = payload;

    // 1. Check wether the email user exists
    const userData = await pool.query(`
        SELECT * FROM users
        WHERE email=$1
    `, [email])

    if (userData.rowCount === 0) {
        throw new Error("Invalid Email")
    }
    // console.log(user)

    // 2. check wethere password matches
    const user = userData.rows[0]
    const matchPassword = await bcrypt.compare(password, user.password)

    if (!matchPassword) {
        throw new Error("Invalid Password")
    }

    // 3. Generate JWT token
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active
    }

    const accessToken = jwt.sign(jwtPayload, config.jwtSecret, {
        expiresIn: "1d"
    })

    const refreshToken = jwt.sign(jwtPayload, config.refresh_secret, {
        expiresIn: "90d"
    })

    return { accessToken, refreshToken }
}

const generateRefreshToken = async (token: string) => {

    if (!token) {
        throw new Error("Unauthorized access!")
    }

    const decoded = jwt.verify(
        token as string,
        config.refresh_secret
    ) as JwtPayload

    const userData = await pool.query(`
        SELECT * FROM users
        WHERE email=$1
    `, [decoded.email])

    const user = userData.rows[0]

    if (userData.rows.length === 0) {
        throw new Error("User not found")
    }

    if (!user.is_active) {
        throw new Error("Forbidden")
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active
    }

    const accessToken = jwt.sign(jwtPayload, config.jwtSecret, {
        expiresIn: "90d"
    })

    return {accessToken}
}

export const authService = {
    loginUserIntoDB,
    generateRefreshToken
}