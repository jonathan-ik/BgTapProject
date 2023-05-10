const jwt = require("jsonwebtoken");
const { createUser, userLogin, userProfileUpdate } = require("../dao/userdao");

const userSignUp = async (req, res) => {
  try {
    let result = await createUser(req);
    res.status(200).json(result);
  } catch (error) {
    console.log("Error creating user: ", error);
    res.status(404).json({ error });
  }
};

const usersLogin = async (req, res) => {
  try {
    let result = await userLogin(req);
    let token = jwt.sign({ user_id: result }, process.env.JWT_SECRET, {
      expiresIn: 3600,
    });
    res.status(201).json({ result, token });
  } catch (error) {
    console.log("Unable to Login: ", error);
    res.status(401).json({ error });
  }
};

const updateUser = async (req, res) => {
  try {
    let result = await userProfileUpdate(req);
    res.status(201).json(result);
  } catch (error) {
    console.log("Unable to update User: ", error);
    res.status(404).json({ error });
  }
};

module.exports = { userSignUp, usersLogin, updateUser };
