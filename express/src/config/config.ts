import dotenv from "dotenv"
import path from "path"

dotenv.config({
    path : path.join(process.cwd(), '.env')
})

export const config = {
    connection_string : process.env.CONNECTION_STRING as string,
    port : process.env.PORT,
    jwtSecret: process.env.JWT_SECRET as string,
    refresh_secret:process.env.REFRESH_SECRET as string,
    refresh_token_validity: process.env.REFRESH_TOKEN_VALIDITY as string,
    access_token_validity: process.env.ACCESS_TOKEN_VALIDITY as string,
}