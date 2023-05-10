const pool = require("../db");

const StatesTable = async (req, res, next) => {
  let conn;
  try {
    conn = await pool.connect();
    const checkSql = "SELECT COUNT(*) FROM states";
    const rows = await conn.query(checkSql);
    const rowCount = rows.rows[0].count;
    if (rowCount == 0) {
      const insertSql = `INSERT INTO states (state)
            VALUES 
            ('abia'),
            ('adamawa'),
            ('akwa ibom'),
            ('anambra'),
            ('bauchi'),
            ('bayelsa'),
            ('benue'),
            ('borno'),
            ('cross river'),
            ('delta'),
            ('ebonyi'),
            ('edo'),
            ('ekiti'),
            ('enugu'),
            ('gombe'),
            ('imo'),
            ('jigawa'),
            ('kaduna'),
            ('kano'),
            ('katsina'),
            ('kebbi'),
            ('kogi'),
            ('kwara'),
            ('lagos'),
            ('nasarawa'),
            ('niger'),
            ('ogun'),
            ('ondo'),
            ('osun'),
            ('oyo'),
            ('plateau'),
            ('rivers'),
            ('sokoto'),
            ('taraba'),
            ('yobe'),
            ('zamfara'),
            ('fct')            
                        RETURNING *;`;
      const result = await conn.query(insertSql);
    }
  } catch (error) {
    console.log(error);
    res.status(401).json(`Error loading states table- ${error}`);
  } finally {
    conn.release();
    next();
  }
};

module.exports = StatesTable;
