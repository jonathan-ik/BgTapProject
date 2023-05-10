const pool = require("../db");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { requiredKeysValidator } = require("../utils/requiredkeys");
const validator = require("validator");
const { getUserId } = require("./userservices");

const getOperator_id = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user_id = await getUserId(req);
      // console.log(user_id);
      const conn = await pool.connect();
      const sql = "SELECT * from operator_profile where user_id =($1);";
      const result = await conn.query(sql, [user_id]);
      const operator = result.rows[0];

      // console.log(operator);
      const operator_id = operator.operator_id;
      // console.log(operator_id);

      conn.release();
      resolve(operator_id);
    } catch (error) {
      reject(error);
    }
  });
};

// Validate user country
const userNationality = (req) => {
  return new Promise((resolve, reject) => {
    try {
      let { nationality } = req.body;
      nationality = nationality.toLowerCase().trim();
      if (nationality !== "nigerian") {
        reject(
          "We're sorry, our services are only available in Nigeria at the moment"
        );
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// validate user state

const userState = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { state } = req.body;
      state = state.toLowerCase();
      const conn = await pool.connect();

      const stateQuery = 'SELECT * FROM "states" WHERE state = $1';
      const values = [state];
      const result = await pool.query(stateQuery, values);

      const foundState = result.rows[0];
      conn.release();

      if (!foundState) {
        reject("Please enter a valid state");
      }
      const stateId = foundState.state_id;
      // console.log(stateId);

      resolve(stateId);
    } catch (error) {
      reject(error);
    }
  });
};

const userLga = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { lga } = req.body;
      const LGAname = lga.toLowerCase();
      const stateID = await userState(req);
      // console.log(stateID);
      const stateId = stateID.toString();
      const conn = await pool.connect();

      const lgaQuery = 'SELECT * FROM "lgas" WHERE lga = $1';
      const values = [LGAname];
      const result = await pool.query(lgaQuery, values);
      const foundlGA = result.rows;
      conn.release();

      if (foundlGA.length === 0) {
        reject("Please enter a valid Local Government");
      }

      const lgaStateID = foundlGA[0].state_id.toString();

      if (!(stateId === lgaStateID)) {
        reject("Local Government selected doesn't exist in your state");
      }

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const operatorValidation = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
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

      // List of required keys
      const Keys = [
        "firstname",
        "lastname",
        "phonenumber",
        "nationality",
        "state",
        "lga",
        "sex",
        "dateofbirth",
        "nin",
      ];

      // // List of allowed image types
      const ImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

      // Validate that all required keys are present in the request body
      await requiredKeysValidator(req, Keys);

      // Regular expressions to validate phone number and NIN
      const phonePattern = /^((\+234)|234|0)[78901]\d{9}$/;
      const ninPattern = /^(?!0{11})\d{11}$/;

      // Check that all required fields are not empty
      if (
        !(
          firstname.trim() &&
          lastname.trim() &&
          phonenumber.trim() &&
          nationality.trim() &&
          state.trim() &&
          lga.trim() &&
          sex.trim() &&
          dateofbirth.trim() &&
          nin.trim()
        )
      ) {
        reject(
          "firstname, lastname, phonenumber, nationality, state, lga, sex, dateofbirth, nin and picture must be provided"
        );
      } else if (!ImageTypes.includes(req.file.mimetype)) {
        reject("Upload an image as picture");
      } else if (!phonePattern.test(phonenumber)) {
        // Check that phone number is valid
        reject("Phone number not valid");
      } else if (!["male", "female"].includes(sex.toLowerCase())) {
        // Check that sex is either "Male" or "Female"
        reject("Sex must either be male or female");
      } else if (!moment(dateofbirth, "YYYY-MM-DD", true).isValid()) {
        // Check that date of birth is in the format "YYYY-MM-DD"
        reject("Enter Date of Birth format in YYYY-MM-DD");
      } else if (!ninPattern.test(nin)) {
        // Check that NIN is valid
        reject("Invalid NIN");
      } else {
        // All validation checks passed
        resolve(true);
      }
    } catch (error) {
      reject(error);
    }
  });
};

const checkCorrectProductAndSeedTypeId = (req) => {
  return new Promise(async (resolve, reject) => {
    let conn; // declare conn here

    try {
      const { product_id, seed_id } = req.body;

      const operator_id = await getOperator_id(req);

      conn = await pool.connect(); // initialize conn here

      const allSeedTypeSql = "SELECT * from seeds where product_id=($1);";
      const allSeedTypeResult = await conn.query(allSeedTypeSql, [product_id]);
      const SeedTypes = allSeedTypeResult.rows;

      if (!SeedTypes.length)
        reject(
          `Select a valid product_id from this list of products; ${product_id}`
        );

      const seedTypeSql =
        "SELECT * from seeds where seed_id =($1) and product_id=($2);";
      const seedTypeResult = await conn.query(seedTypeSql, [
        seed_id,
        product_id,
      ]);
      const seedType = seedTypeResult.rows[0];
      if (!seedType)
        reject(
          `Invalid Seed Type_id for product_id provided. Valid Seed_id Include: ${SeedTypes.map(
            (seed) => seed.seed_id
          )}`
        );

      const sql =
        "SELECT * from operator_selections where operator_id =($1) and seed_id =($2) and product_id=($3)";
      const result = await conn.query(sql, [operator_id, seed_id, product_id]);
      const operatorSelection = result.rows[0];
      if (operatorSelection) reject("Operator already has this selection");

      resolve(true);
    } catch (error) {
      reject(error);
    } finally {
      if (conn) conn.release(); // check if conn is defined before releasing it
    }
  });
};

const validateOperatorsSelection = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { product_id, seed_id } = req.body;
      const operator_id = await getOperator_id(req);

      const requiredKeys = ["product_id", "seed_id"];
      await requiredKeysValidator(req, requiredKeys);

      if (!product_id || !seed_id) {
        reject("Product_id and seed_id must be provided");
      } else {
        if (!validator.isInt(String(product_id)))
          reject("Invalid Product id. Product_id must be a number");
        if (!validator.isInt(String(seed_id)))
          reject("Invalid Seed type id. seed_id must be a number");
        await checkCorrectProductAndSeedTypeId(req); // pass req object
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  userNationality,
  userState,
  userLga,
  operatorValidation,
  getOperator_id,
  validateOperatorsSelection,
};
