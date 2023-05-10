/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS Lgas (
  lga_id SERIAL PRIMARY KEY,
  lga VARCHAR(255) NOT NULL,
  state_id INTEGER REFERENCES States (state_id) ON DELETE CASCADE
  )