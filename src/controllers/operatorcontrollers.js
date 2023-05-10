const jwt = require("jsonwebtoken");
const {
  operatorCompleteRegistration,
  createOperatorSelections,
} = require("../dao/operatordao");

const createOperator = async (req, res) => {
  try {
    let result = await operatorCompleteRegistration(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

const productSelect = async (req, res) => {
  try {
    let result = await createOperatorSelections(req);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error });
  }
};

module.exports = {
  createOperator,
  productSelect,
};
