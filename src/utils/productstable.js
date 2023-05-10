const pool = require("../db");

const loadProductsTable = async (req, res, next) => {
  let conn;
  try {
    conn = await pool.connect();
    const checkSql = "SELECT COUNT(*) FROM products";
    const rows = await conn.query(checkSql);
    const rowCount = rows.rows[0].count;
    if (rowCount == 0) {
      const insertSql = `INSERT INTO products (product)
              VALUES
                        ('Maize'),
                        ('Rice')
                          RETURNING *;`;
      const result = await conn.query(insertSql);
      console.log("Products Table loaded successfully");
    }
  } catch (error) {
    console.log(error);
    res.status(401).json(`Error loading products table - ${error}`);
  } finally {
    conn.release();
    next();
  }
};

module.exports = loadProductsTable;
