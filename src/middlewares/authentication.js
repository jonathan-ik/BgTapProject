const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authToken = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    jwt.verify(authorizationHeader, process.env.JWT_SECRET);

    return next();
  } catch (err) {
    res.status(500).send({ err });
  }
};

module.exports = { authToken };
