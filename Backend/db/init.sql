-- Create a customers table
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    signup_date DATE
);

-- Insert sample records
INSERT INTO customers (name, email, signup_date) VALUES
  ('Alice', 'alice@example.com', '2023-01-10'),
  ('Bob', 'bob@example.com', '2023-03-05'),
  ('Charlie', 'charlie@example.com', '2022-12-01');
