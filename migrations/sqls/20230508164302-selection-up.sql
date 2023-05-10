/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS Operator_selections (
  id SERIAL PRIMARY KEY,
  operator_id VARCHAR(255) REFERENCES Operator_profile(operator_id) on DELETE CASCADE,
  product_id integer REFERENCES Products(product_id) on DELETE set null,
  seed_id integer REFERENCES Seeds(seed_id) on DELETE set null,
  UNIQUE (operator_id, product_id, seed_id)
  )