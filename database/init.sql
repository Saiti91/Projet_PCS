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

DROP TABLE IF EXISTS appartements;
CREATE TABLE appartements (
    id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    owner serial REFERENCES users(id) ON DELETE CASCADE,
    
    surface int,
    address text,
    capacity int,
    price int,
    available boolean
);

INSERT INTO appartements(
    owner,
    surface,
    address,
    capacity,
    price,
    available
) VALUES
      (3,30, 'Paris 04, 6 avenue de la boustifaille', 3, 60,true);

DROP TABLE IF EXISTS reservations;
CREATE TABLE reservations (
    id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    location serial REFERENCES appartements(id) ON DELETE CASCADE,
    customer serial REFERENCES users(id) ON DELETE CASCADE,
    date_start date, 
    date_end date,
    price int

);
INSERT Into reservations(
    location,
    customer,
    date_start,
    date_end,
    price
) VALUES
(1,4,'2024-06-01','2024-06-02',60);

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
INSERT INTO services(
    name,
    type,
    providerAddress,
    range,
    provider,
    price
) VALUES
('Ménage', 'menage', 'Paris 07, 11 rue Erard', 10, 5, 20);

DROP TABLE IF EXISTS commentary;

-- Crée à nouveau la table avec la définition correcte
CREATE TABLE commentary (
    id serial PRIMARY KEY,
    text text,
    rating int,
    customer serial REFERENCES users(id) ON DELETE CASCADE,
    service serial REFERENCES services(id) ON DELETE CASCADE
);