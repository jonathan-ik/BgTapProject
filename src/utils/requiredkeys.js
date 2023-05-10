// To validate the keys passed in by the client

const requiredKeysValidator = (req, requiredKeysArray) => {
  return new Promise(async (resolve, reject) => {
    const keys = Object.keys(req.body);
    const missingKeys = requiredKeysArray.filter((key) => !keys.includes(key));
    // console.log(missingKeys);

    if (missingKeys.length > 0) {
      reject(`Missing required keys: ${missingKeys.join(", ")}`);
    }

    for (const key in req.body) {
      if (!requiredKeysArray.includes(key)) {
        reject(`'${key}' not expected. Only ${requiredKeysArray} are allowed`);
      }
    }
    resolve(true);
  });
};

module.exports = { requiredKeysValidator };
