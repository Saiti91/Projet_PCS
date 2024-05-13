CREATE TYPE role AS ENUM ('admin', 'staff', 'owner', 'customer','provider');
CREATE TYPE serviceType AS ENUM ('menage','jardin','plomberie','travaux');
CREATE EXTENSION citext;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    
    role role,
    email citext UNIQUE,
    password text,
    first_name text,
    last_name text
);

INSERT INTO users(
    role, 
    email, 
    password, 
    first_name, 
    last_name
) VALUES
('admin', 'test@user.com', 'password', 'Georges', 'Abitbol'),
('staff', 'staff@user.com', 'password', 'John', 'Doe'),
('owner', 'owner@user.com', 'password', 'Jane', 'Doe'),
('customer', 'customer@user.com', 'password', 'Jim', 'Beam'),
('provider', 'provider@user.com', 'password', 'Jack', 'Daniels');

DROP TABLE IF EXISTS locations;
CREATE TABLE locations (
    id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    owner serial REFERENCES users(id) ON DELETE CASCADE,
    
    area int,
    address text,
    capacity int,
    price money,
    available boolean
);
DROP TABLE IF EXISTS reservations;
CREATE TABLE reservations (
    id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    location serial REFERENCES locations(id) ON DELETE CASCADE,
    customer serial REFERENCES users(id) ON DELETE CASCADE,
    date_start date, 
    date_end date,
    price money

);

DROP TABLE IF EXISTS services;
CREATE TABLE services (
    id serial PRIMARY KEY,
    name text,
    type serviceType,
    providerAddress text,
    range FLOAT,
    provider serial REFERENCES users(id) ON DELETE CASCADE,
    price FLOAT
);

DROP TABLE IF EXISTS commentary;

-- Crée à nouveau la table avec la définition correcte
CREATE TABLE commentary (
    id serial PRIMARY KEY,
    text text,
    rating int,
    customer serial REFERENCES users(id) ON DELETE CASCADE,
    service serial REFERENCES services(id) ON DELETE CASCADE
);