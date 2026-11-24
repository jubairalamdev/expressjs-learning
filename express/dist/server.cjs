
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express4 = __toESM(require("express"), 1);

// src/modules/user/user.route.ts
var import_express = require("express");

// src/db/index.ts
var import_pg = require("pg");

// src/config/config.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
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
var pool = new import_pg.Pool({
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
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var createUserIntoDB = async (payload) => {
  const { name, email, password, age, role } = payload;
  const hashPassword = await import_bcryptjs.default.hash(password, 10);
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
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
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
      const decoded = import_jsonwebtoken.default.verify(
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
var router = (0, import_express.Router)();
router.post("/", userController.createUser);
router.get("/", auth_default(USER_ROLE.admin, USER_ROLE.agent), userController.getAllUsers);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.putSingleUser);
router.delete("/:id", userController.deleteSingleUser);
var userRoute = router;

// src/modules/profile/profile.route.ts
var import_express2 = require("express");

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
var router2 = (0, import_express2.Router)();
router2.post("/", profileController.createProfile);
var profileRoute = router2;

// src/modules/auth/auth.route.ts
var import_express3 = require("express");

// src/modules/auth/auth.serivce.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
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
  const matchPassword = await import_bcryptjs2.default.compare(password, user.password);
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
  const accessToken = import_jsonwebtoken2.default.sign(jwtPayload, config.jwtSecret, {
    expiresIn: "1d"
  });
  const refreshToken2 = import_jsonwebtoken2.default.sign(jwtPayload, config.refresh_secret, {
    expiresIn: "90d"
  });
  return { accessToken, refreshToken: refreshToken2 };
};
var generateRefreshToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized access!");
  }
  const decoded = import_jsonwebtoken2.default.verify(
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
  const accessToken = import_jsonwebtoken2.default.sign(jwtPayload, config.jwtSecret, {
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
var router3 = (0, import_express3.Router)();
router3.post("/login", authController.loginUser);
router3.post("/refresh-token", authController.refreshToken);
var authRoute = router3;

// src/middleware/logger.ts
var import_fs = __toESM(require("fs"), 1);
var logger = (req, res, next) => {
  const log = `
Method -> ${req.method} - Time -> ${Date.now} - URL -> ${req.url}
`;
  import_fs.default.appendFile("logger.txt", log, (err) => {
    console.log(err);
  });
  next();
};

// src/app.ts
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_cors = __toESM(require("cors"), 1);

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

// src/app.ts
var app = (0, import_express4.default)();
var corsOptions = {
  origin: "http://localhost:3000"
};
app.use((0, import_cors.default)(corsOptions));
app.use((0, import_cookie_parser.default)());
app.use(import_express4.default.json());
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
//# sourceMappingURL=server.cjs.map