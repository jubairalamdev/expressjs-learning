
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/config.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  refresh_secret: process.env.REFRESH_SECRET,
  refresh_token_validity: process.env.REFRESH_TOKEN_VALIDITY,
  access_token_validity: process.env.ACCESS_TOKEN_VALIDITY
};

// src/db/index.ts
var pool = new Pool({
  connectionString: config.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(20),
                email VARCHAR(20) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                is_active BOOLEAN DEFAULT true,
                age INT,
                role VARCHAR(10) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )    
        `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS profiles(
                id SERIAL PRIMARY KEY,
                user_id INT UNIQUE REFERENCES "users"(id) ON DELETE CASCADE,

                bio TEXT,
                address TEXT,
                phone VARCHAR(15),
                gender VARCHAR(10),

                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )    
        `);
    console.log("Database connceted successfully!");
  } catch (error) {
    console.error();
  }
};

// src/modules/user/user.service.ts
import bcrypt from "bcryptjs";
var createUserIntoDB = async (payload) => {
  const { name, email, password, age, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  console.log(hashPassword);
  const result = await pool.query(`
            INSERT INTO users (name, email, password, age, role) 
            VALUES($1,$2,$3,$4,COALESCE($5, 'user'))
            RETURNING *
        `, [name, email, hashPassword, age, role]);
  delete result.rows[0].password;
  delete result.rows[0].is_active;
  return result;
};
var getAllUsersFromDB = async () => {
  const result = await pool.query(`
            SELECT * FROM users
        `);
  delete result.rows[0].password;
  delete result.rows[0].is_active;
  return result;
};
var getSingleUserFromDB = async (id) => {
  const result = await pool.query(`
            SELECT * FROM users WHERE id=$1
        `, [id]);
  delete result.rows[0].password;
  delete result.rows[0].is_active;
  return result;
};
var putSingleUserToDB = async (id, payload) => {
  const { name, password, age, is_active } = payload;
  const result = await pool.query(`
            UPDATE users 
            SET 
            name=COALESCE($1, name), 
            password=COALESCE($2, password), 
            age=COALESCE($3, age), 
            is_active=COALESCE($4, is_active), 
            updated_at=NOW()
            
            WHERE id=$5
            RETURNING *
        `, [name, password, age, is_active, id]);
  delete result.rows[0].password;
  delete result.rows[0].is_active;
  return result;
};
var deleteSingleUserFromDB = async (id) => {
  const result = await pool.query(`
            DELETE FROM users
            WHERE id=$1    
        `, [id]);
  return result;
};
var userService = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  putSingleUserToDB,
  deleteSingleUserFromDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      success: true,
      statusCode: 201,
      message: "User created successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      success: false,
      statusCode: 500,
      message: error.error,
      error
    });
  }
};
var getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsersFromDB();
    res.status(200).json({
      success: true,
      message: "Users retrived successfully!",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.getSingleUserFromDB(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
        data: {}
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User retrived successfully!",
        data: result.rows[0]
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var putSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.putSingleUserToDB(id, req.body);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: true,
        message: "User not found"
        // data: result.rows[0],
      });
    } else {
      res.status(201).json({
        success: true,
        message: "User updated successfully!",
        data: result.rows[0]
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var deleteSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteSingleUserFromDB(id);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: true,
        message: "User not found"
        // data: result.rows[0],
      });
    } else {
      res.status(201).json({
        success: true,
        message: "User deleted successfully!",
        data: {}
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var userController = {
  createUser,
  getAllUsers,
  getSingleUser,
  putSingleUser,
  deleteSingleUser
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized Access!"
        });
      }
      const decoded = jwt.verify(
        token,
        config.jwtSecret
      );
      const userData = await pool.query(`
            SELECT * FROM users
            WHERE email=$1
        `, [decoded.email]);
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found!"
        });
      }
      if (!user.is_active) {
        res.status(403).json({
          success: false,
          message: "Forbidden!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  admin: "admin",
  agent: "agent",
  user: "user"
};

// src/modules/user/user.route.ts
var router = Router();
router.post("/", userController.createUser);
router.get("/", auth_default(USER_ROLE.admin, USER_ROLE.agent), userController.getAllUsers);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.putSingleUser);
router.delete("/:id", userController.deleteSingleUser);
var userRoute = router;

// src/modules/profile/profile.route.ts
import { Router as Router2 } from "express";

// src/modules/profile/profile.service.ts
var createProfileIntoDB = async (payload) => {
  const { user_id, bio, address, phone, gender } = payload;
  const user = await pool.query(`
        SELECT * FROM users
        WHERE id=$1
    `, [user_id]);
  if (user.rows.length === 0) {
    throw new Error("User does not exists!");
  }
  const result = await pool.query(`
        INSERT INTO profiles(
            user_id, bio, address, phone, gender
        )  VALUES(
            $1, $2, $3, $4, $5 
        )
        RETURNING *
    `, [user_id, bio, address, phone, gender]);
  return result;
};
var profileService = {
  createProfileIntoDB
};

// src/modules/profile/profile.controller.ts
var createProfile = async (req, res) => {
  try {
    const result = await profileService.createProfileIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "Profile created successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var profileController = {
  createProfile
};

// src/modules/profile/profile.route.ts
var router2 = Router2();
router2.post("/", profileController.createProfile);
var profileRoute = router2;

// src/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.serivce.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
        SELECT * FROM users
        WHERE email=$1
    `, [email]);
  if (userData.rowCount === 0) {
    throw new Error("Invalid Email");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Password");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active
  };
  const accessToken = jwt2.sign(jwtPayload, config.jwtSecret, {
    expiresIn: "1d"
  });
  const refreshToken2 = jwt2.sign(jwtPayload, config.refresh_secret, {
    expiresIn: "90d"
  });
  return { accessToken, refreshToken: refreshToken2 };
};
var generateRefreshToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized access!");
  }
  const decoded = jwt2.verify(
    token,
    config.refresh_secret
  );
  const userData = await pool.query(`
        SELECT * FROM users
        WHERE email=$1
    `, [decoded.email]);
  const user = userData.rows[0];
  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  if (!user.is_active) {
    throw new Error("Forbidden");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active
  };
  const accessToken = jwt2.sign(jwtPayload, config.jwtSecret, {
    expiresIn: "90d"
  });
  return { accessToken };
};
var authService = {
  loginUserIntoDB,
  generateRefreshToken
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refreshToken", refreshToken2, {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    });
    res.status(200).json({
      success: true,
      message: "User logged in successfully!",
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateRefreshToken(req.cookies.refreshToken);
    res.status(200).json({
      success: true,
      message: "Access token generated!",
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser,
  refreshToken
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/login", authController.loginUser);
router3.post("/refresh-token", authController.refreshToken);
var authRoute = router3;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `
Method -> ${req.method} - Time -> ${Date.now} - URL -> ${req.url}
`;
  fs.appendFile("logger.txt", log, (err) => {
    console.log(err);
  });
  next();
};

// src/app.ts
import CookieParser from "cookie-parser";
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

// src/app.ts
var app = express();
var corsOptions = {
  origin: "http://localhost:3000"
};
app.use(cors(corsOptions));
app.use(CookieParser());
app.use(express.json());
app.use(logger);
app.get("/", (req, res) => {
  res.status(200).json({
    "message": "Express Server",
    "author": "Next Level"
  });
});
app.use("/api/users", userRoute);
app.use("/api/profile", profileRoute);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map