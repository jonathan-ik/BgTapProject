CREATE FUNCTION concat_names(firstname VARCHAR(255), lastname VARCHAR(255))
  RETURNS VARCHAR(255)
  IMMUTABLE
AS $$
  SELECT lastname || ' ' || firstname;
$$ LANGUAGE SQL;

CREATE FUNCTION generate_operator_id(id INTEGER)
  RETURNS VARCHAR(255)
  IMMUTABLE
AS $$
  SELECT CONCAT('00-', id);
$$ LANGUAGE SQL;

CREATE TYPE gender AS ENUM ('male', 'female');

CREATE TABLE IF NOT EXISTS Operator_profile (
  id SERIAL PRIMARY KEY,
  operator_id VARCHAR(255) GENERATED ALWAYS AS (generate_operator_id(id)) STORED UNIQUE,
  firstname VARCHAR(255) Not Null,
  lastname VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) GENERATED ALWAYS AS (concat_names(firstname, lastname)) STORED,
  phonenumber BIGINT,
  nationality VARCHAR(255),
  state VARCHAR(255),
  lga VARCHAR(255),
  sex gender,
  dateofbirth DATE,
  nin BIGINT,
  picture BYTEA,
  isVerified BOOLEAN DEFAULT true,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);