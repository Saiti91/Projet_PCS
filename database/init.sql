CREATE TYPE role AS ENUM ('admin', 'staff', 'owner', 'customer','provider');
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



CREATE TABLE features (
                          feature_id serial PRIMARY KEY,
                          name citext UNIQUE
);

CREATE TABLE apartments (
                            apartments_id serial PRIMARY KEY,
                            created_at timestamp DEFAULT NOW(),
                            owner_id int REFERENCES users(users_id) ON DELETE CASCADE,
                            longitude float8,
                            latitude float8,
                            surface int,
                            address_id int REFERENCES address(address_id),
                            capacity int,
                            available boolean,
                            apartmentsType apartmentsTypes,
                            roomNumber int,
                            price int
);

CREATE TABLE apartmentFeatures (
                                   apartment_id int REFERENCES apartments(apartments_id) ON DELETE CASCADE,
                                   feature_id int REFERENCES serviceFeatures(feature_id) ON DELETE CASCADE,
                                   PRIMARY KEY (apartment_id, feature_id)
);


CREATE TABLE reservations (
    reservations_id serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    location serial REFERENCES apartments (apartments_id) ON DELETE CASCADE,
    customer serial REFERENCES users(users_id) ON DELETE CASCADE,
    date_start date, 
    date_end date,
    price int

);

CREATE TABLE serviceFeatures (
    feature_id serial PRIMARY KEY,
    name citext
);
CREATE TABLE serviceTypeFeatures (
    serviceType_id int REFERENCES serviceTypes(serviceTypes_id) ON DELETE CASCADE,
    feature_id int REFERENCES serviceFeatures(feature_id) ON DELETE CASCADE,
    PRIMARY KEY (serviceType_id, feature_id)
);


CREATE TABLE services (
    services_id serial PRIMARY KEY,
    name text,
    type serial REFERENCES serviceTypes(serviceTypes_id) ON DELETE CASCADE,
    providerAddress text,
    providerLongitude float8,
    providerLatitude float8,
    maxOperatingRadius INT,
    provider serial REFERENCES users(users_id) ON DELETE CASCADE,
    price FLOAT
);
CREATE TABLE apartmentsImage (
                                 image_id serial PRIMARY KEY,
                                 path citext,
                                 apartment_id serial REFERENCES apartments(apartments_id) ON DELETE CASCADE
);

CREATE TABLE servicesImage (
                               image_id serial PRIMARY KEY,
                               path citext,
                               service_id serial REFERENCES services(services_id) ON DELETE CASCADE
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

CREATE TABLE apartmentAvailabilities (
    apartmentAvailabilities_id SERIAL PRIMARY KEY,
    available BOOLEAN NOT NULL,
    date date NOT NULL,
    owner_id INT NOT NULL,
    apartment_id INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(users_id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments (apartments_id) ON DELETE CASCADE
);