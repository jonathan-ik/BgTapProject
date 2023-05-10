const pool = require("../db");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const fs = require("fs");
const { getUserId, getUserRole } = require("../services/userservices");
const {
  userNationality,
  userState,
  userLga,
  operatorValidation,
  getOperator_id,
  validateOperatorsSelection,
} = require("../services/operatorservices");
dotenv.config();

const operatorCompleteRegistration = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user_id = await getUserId(req);
      console.log(user_id);

      const {
        firstname,
        lastname,
        phonenumber,
        nationality,
        state,
        lga,
        sex,
        dateofbirth,
        nin,
      } = req.body;
      console.log(req.body);
      if (!req.file) {
        //   // Check that a picture file is uploaded
        reject("Upload a Picture");
      }

      const picture = fs.readFileSync(req.file.path);
      const conn = await pool.connect();

      // Check if user signedup as an operator

      const role = await getUserRole(req);

      if (role !== "operator") {
        reject("You need to be an operator to complete registration");
        return;
      }

      // Check if operator already completed registration
      const checkProfileSql =
        "SELECT * FROM operator_profile WHERE user_id = ($1)";
      const checkProfileValues = [user_id];
      const checkProfileResult = await conn.query(
        checkProfileSql,
        checkProfileValues
      );
      const operatorProfile = checkProfileResult.rows[0];

      if (operatorProfile) {
        reject("You have already completed this registration");
        return;
      }

      //validate operator data fields
      await operatorValidation(req);

      //validate nationality
      await userNationality(req);

      // validate state
      await userState(req);

      //validate Local Gaovernment Area
      await userLga(req);

      const foundNINQuery = "SELECT * FROM operator_profile WHERE nin = $1";
      const foundNINResult = await conn.query(foundNINQuery, [nin]);
      const foundNIN = foundNINResult.rows[0];
      if (foundNIN) {
        reject("NIN already in use, Please provide another NIN");
      } else {
        // Insert operator profile
        const insertSql = `INSERT INTO operator_profile (user_id, firstname, lastname, phonenumber, nationality, state, lga, sex, dateofbirth, nin,picture) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11) RETURNING *;`;
        const insertValues = [
          user_id,
          firstname,
          lastname,
          phonenumber,
          nationality,
          state.toLowerCase(),
          lga.toLowerCase(),
          sex.toLowerCase(),
          dateofbirth,
          nin,
          picture,
        ];
        const newPicturePath = `uploads/${user_id}.png`;
        console.log(newPicturePath);

        fs.unlinkSync(req.file.path);
        fs.writeFileSync(newPicturePath, picture);

        await conn.query(insertSql, insertValues);
      }
      conn.release();

      resolve(JSON.parse('{"status": "registration completed"}'));
    } catch (error) {
      reject(error);
    }
  });
};

const createOperatorSelections = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { product_id, seed_id } = req.body;
      const operator_id = await getOperator_id(req);
      // console.log(operator_id);
      const conn = await pool.connect();

      await validateOperatorsSelection(req);

      ////////
      const sql = `INSERT INTO operator_selections(
                  operator_id, product_id, seed_id)
                  VALUES ($1, $2, $3)
                      RETURNING *;`;

      const values = [operator_id, product_id, seed_id];

      const result = await conn.query(sql, values);
      const operatorSelection = result.rows[0];

      conn.release();

      resolve(operatorSelection);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { operatorCompleteRegistration, createOperatorSelections };
