CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    street VARCHAR NOT NULL,
    postal_code VARCHAR(5) CHECK (postal_code ~ '^[0-9]{5}$') NOT NULL,
    city VARCHAR NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    fullname VARCHAR NOT NULL,
    address_id INT REFERENCES addresses(id),
    is_admin SMALLINT CHECK (is_admin IN (0, 1))
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    summary TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status VARCHAR NOT NULL,
    date TIMESTAMP NOT NULL,
    user_id INT NOT NULL REFERENCES users(id),
    total_quantity INT NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE order_product (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    single_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);
