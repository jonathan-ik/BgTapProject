const pool = require("../db");

const loadSeedTypesTable = async (req, res, next) => {
  let conn;
  try {
    conn = await pool.connect();
    const checkSql = "SELECT COUNT(*) FROM seeds";
    const rows = await conn.query(checkSql);
    const rowCount = rows.rows[0].count;
    if (rowCount == 0) {
      const insertSql = `INSERT INTO seeds (seed_type,product_id)
              VALUES
              ('Maize Seed Type A',1),
              ('Maize Seed Type B',1),
              ('Maize Seed Type C',1),
              ('Rice Seed Type A',2),
              ('Rice Seed Type B',2),
              ('Rice Seed Type C',2)
              RETURNING *;`;
      const result = await conn.query(insertSql);
      console.log("Seed Types Table loaded successfully");
    }
  } catch (error) {
    console.log(error);
    res.status(401).json(`Error loading seed types table - ${error}`);
  } finally {
    conn.release();
    next();
  }
};

module.exports = loadSeedTypesTable;
