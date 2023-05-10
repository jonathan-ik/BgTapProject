const pool = require("../db");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { requiredKeysValidator } = require("../utils/requiredkeys");
const { validateUserReg, getUserId } = require("../services/userservices");

dotenv.config();

//sign up a new user
const createUser = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      await validateUserReg(req);
      const conn = await pool.connect();
      const sql = `INSERT INTO users(
                      email, password, role)
                      VALUES ($1, $2, $3)
                      RETURNING *;`;

      const hashPassword = bcrypt.hashSync(
        req.body.password + process.env.BCRYPT_PASSWORD,
        parseInt(process.env.SALT_ROUNDS)
      );

      const values = [req.body.email, hashPassword, req.body.role];
      const result = await conn.query(sql, values);
      conn.release();

      resolve(result.rows[0]);
    } catch (error) {
      reject(error);
    }
  });
};

const userLogin = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const requiredKeys = ["email", "password"];
      await requiredKeysValidator(req, requiredKeys);

      const { email, password } = req.body;

      const conn = await pool.connect();
      const result = await conn.query(
        "SELECT user_id, password, role FROM users WHERE email = $1;",
        [email]
      );
      const rows = result.rows;
      conn.release();

      if (rows.length > 0) {
        const matchPassword = await bcrypt.compare(
          password + process.env.BCRYPT_PASSWORD,
          rows[0].password
        );
        if (matchPassword) {
          resolve(`${rows[0].user_id}`);
        } else {
          reject("email and/or password do not match");
        }
      } else {
        reject("user does not exist");
      }
    } catch (error) {
      reject(error);
    }
  });
};

//update user details
const userProfileUpdate = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      //validate user input
      const requiredKeys = ["role"];
      await requiredKeysValidator(req, requiredKeys);
      const { role } = req.body;

      let newRole = null;
      if (role) {
        if (typeof role !== "string") {
          reject("Role must be a string");
        } else if (
          !["operator", "member"].includes(role.toLowerCase().trim())
        ) {
          reject("You can either sign up as an operator or as a member");
        } else {
          newRole = role.toLowerCase().trim();
        }
      }

      //obtain userId if user exist in the database
      const user_id = await getUserId(req);

      //connect to database and update profile
      const conn = await pool.connect();
      const sql = `UPDATE users SET role = COALESCE($1, role), updated_at = now() WHERE user_id = ($2) RETURNING *;`;
      const values = [newRole, user_id];
      const result = await conn.query(sql, values);
      const rows = result.rows[0];

      if (!rows) {
        reject("User is not valid");
      }

      conn.release();
      resolve(rows);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { createUser, userLogin, userProfileUpdate };
