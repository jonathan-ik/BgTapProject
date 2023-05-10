const express = require("express");
const operatorRoute = express.Router();
const { authToken } = require("../middlewares/authentication");
const multer = require("multer");
const {
  createOperator,
  productSelect,
} = require("../controllers/operatorcontrollers");

const upload = multer({ dest: "uploads/" });

//route to register an operator
operatorRoute.post(
  "/register",
  authToken,
  upload.single("picture"),
  createOperator
);

//route to select product and seed type for operator
operatorRoute.post("/selectProductAndSeed", authToken, productSelect);

module.exports = operatorRoute;
