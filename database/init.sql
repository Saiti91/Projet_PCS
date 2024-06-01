CREATE TYPE role AS ENUM ('admin', 'staff', 'owner', 'customer','provider');
CREATE TYPE serviceType AS ENUM ('menage','jardin','plomberie','travaux');
CREATE TYPE apartmentsTypes AS ENUM ('apartment','house','studio','villa');
CREATE TYPE addressComplements AS ENUM ('bis','ter');

CREATE EXTENSION citext;

CREATE TABLE users (
    users_id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    role role,
    email citext UNIQUE,
    password text,
    first_name text,
    last_name text
);

CREATE TABLE address (
     address_id serial PRIMARY KEY,
     number int,
     addressComplement addressComplements,
     building citext,
     apartmentNumber int,
     street citext,
     CP int,
     ville citext
);

CREATE TABLE apartments (
    appartements_id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    owner_id serial REFERENCES users(users_id) ON DELETE CASCADE,
    longitude float8,
    latitude float8,
    surface int,
    address_id int REFERENCES address(address_id),
    capacity int,
    available boolean,
    apartmentsType apartmentsTypes,
    garden boolean,
    roomNumber int,
    pool boolean,
    price int
);

CREATE TABLE reservations (
    reservations_id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    location serial REFERENCES apartments (appartements_id) ON DELETE CASCADE,
    customer serial REFERENCES users(users_id) ON DELETE CASCADE,
    date_start date, 
    date_end date,
    price int

);

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
    FOREIGN KEY (appartement_id) REFERENCES apartments (appartements_id) ON DELETE CASCADE
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

INSERT INTO address (number, addressComplement, building, apartmentNumber, street, CP, ville)
VALUES (1, 'bis', 'A', 2, 'rue Erard', 75007, 'Paris');
INSERT INTO apartments(
    owner_id,
    surface,
    address_id,
    longitude,
    latitude,
    capacity,
    apartmentsType,
    garden,
    roomNumber,
    pool,
    price,
    available
) VALUES
    (3, 30, 1, 10, 10, 3,'apartment',false,2,false, 60,true);


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