const pool = require("../db");
const dotenv = require("dotenv");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { requiredKeysValidator } = require("../utils/requiredkeys");
dotenv.config();

const getUserId = (req) => {
  return new Promise((resolve, reject) => {
    try {
      const jwtToken = req.headers.authorization;
      const decodedToken = jwt.decode(jwtToken);
      // console.log("Decoded token: ", decodedToken);
      const user_id = parseInt(decodedToken.user_id);
      // console.log(user_id);
      resolve(user_id);
    } catch (error) {
      reject(error);
    }
  });
};

// check if the email provided is already in the database
const checkDuplicateEmail = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email } = req.body;
      console.log(email);
      const conn = await pool.connect();
      const result = await conn.query("SELECT email from users;");
      const rows = result.rows;
      conn.release();

      const check = rows.find((user) => {
        return user.email.trim() === email.trim();
      });

      resolve(check);
    } catch (error) {
      reject(error);
    }
  });
};

const validateUserReg = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const requiredKeys = ["email", "password", "role"];
      const { email, password, role } = req.body;

      await requiredKeysValidator(req, requiredKeys);

      if (email.trim() === "" || password.trim() === "") {
        reject("Email, password must be provided");
      } else if (!validator.isEmail(email.trim())) {
        reject("Email is invalid");
      } else if (await checkDuplicateEmail(req)) {
        reject("Email already exists");
      } else if (password.trim() === "") {
        reject("Password field can not be empty");
      } else if (typeof role !== "undefined" && typeof role !== "string") {
        reject("Role must be a string");
      } else if (
        role !== undefined &&
        !["operator", "member"].includes(role.toLowerCase())
      ) {
        reject("You can either sign up as an operator or as a member");
      } else {
        resolve(true);
      }
    } catch (error) {
      reject(error);
    }
  });
};

//get user role
const getUserRole = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user_id = await getUserId(req);

      //connect to database and get current role of user
      const conn = await pool.connect();
      const sql = `SELECT * FROM users WHERE user_id = ($1);`;
      const result = await conn.query(sql, [user_id]);
      const rows = result.rows[0];
      const role = rows.role;
      conn.release();

      if (!rows) {
        reject("User is not Valid");
      } else {
        resolve(role);
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { validateUserReg, getUserId, getUserRole };
