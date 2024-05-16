CREATE TYPE role AS ENUM ('admin', 'staff', 'owner', 'customer','provider');
CREATE TYPE serviceType AS ENUM ('menage','jardin','plomberie','travaux');
CREATE EXTENSION citext;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    users_id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    
    role role,
    email citext UNIQUE,
    password text,
    first_name text,
    last_name text
);

DROP TABLE IF EXISTS appartements;
CREATE TABLE appartements (
    appartements_id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    owner_id serial REFERENCES users(users_id) ON DELETE CASCADE,
    longitude float8,
    latitude float8,
    surface int,
    address text,
    capacity int,
    price int,
    available boolean
);

DROP TABLE IF EXISTS reservations;
CREATE TABLE reservations (
    reservations_id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    location serial REFERENCES appartements(appartements_id) ON DELETE CASCADE,
    customer serial REFERENCES users(users_id) ON DELETE CASCADE,
    date_start date, 
    date_end date,
    price int

);


DROP TABLE IF EXISTS services;
CREATE TABLE services (
    services_id serial PRIMARY KEY,
    name text,
    type serviceType,
    providerAddress text,
    providerLongitude float8,
    providerLatitude float8,
    maxOperatingRadius INT,
    provider serial REFERENCES users(users_id) ON DELETE CASCADE,
    price FLOAT
);

DROP TABLE IF EXISTS commentary;
CREATE TABLE commentary (
    commentary_id serial PRIMARY KEY,
    text text,
    rating int,
    customer serial REFERENCES users(users_id) ON DELETE CASCADE,
    service serial REFERENCES services(services_id) ON DELETE CASCADE
);

CREATE TABLE providerAvailabilities (
    providerAvailabilities_id SERIAL PRIMARY KEY,
    available BOOLEAN NOT NULL,
    date date NOT NULL,
    provider_id INT NOT NULL,
    FOREIGN KEY (provider_id) REFERENCES users(users_id) ON DELETE CASCADE
);

CREATE TABLE appartementAvailabilities (
    appartementAvailabilities_id SERIAL PRIMARY KEY,
    available BOOLEAN NOT NULL,
    date date NOT NULL,
    owner_id INT NOT NULL,
    appartement_id INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(users_id) ON DELETE CASCADE,
    FOREIGN KEY (appartement_id) REFERENCES appartements(appartements_id) ON DELETE CASCADE
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


INSERT INTO appartements(
    owner_id,
    surface,
    address,
    longitude,
    latitude,
    capacity,
    price,
    available
) VALUES
    (3, 30, 'Paris 04, 6 avenue de la boustifaille', 10, 10, 3, 60,true);

INSERT Into reservations(
    location,
    customer,
    date_start,
    date_end,
    price
) VALUES
    (1,4,'2024-06-01','2024-06-02',60);

INSERT INTO services(
    name,
    type,
    providerAddress,
    providerLongitude,
    providerLatitude,
    provider,
    price
) VALUES
    ('Ménage', 'menage', 'Paris 07, 11 rue Erard', 10, 10, 5, 20);