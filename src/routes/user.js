const express = require("express");
const userRoute = express.Router();
const {
  userSignUp,
  usersLogin,
  updateUser,
} = require("../controllers/usercontroller");
const { authToken } = require("../middlewares/authentication");

//route to register user
userRoute.post("/", userSignUp);

//route to login a user
userRoute.post("/login", usersLogin);

//route to update user
userRoute.put("/update", authToken, updateUser);

module.exports = userRoute;
