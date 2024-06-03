CREATE TYPE role AS ENUM ('admin', 'staff', 'owner', 'customer', 'provider');
CREATE TYPE addressComplements AS ENUM ('bis', 'ter');
CREATE EXTENSION citext;

-- Users
CREATE TABLE users (
                       users_id serial PRIMARY KEY,
                       created_at timestamp DEFAULT NOW(),
                       role role,
                       email citext UNIQUE,
                       password text,
                       first_name text,
                       last_name text
);

-- Addresses
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

CREATE TABLE apartmentsTypes (
                                apartmentsTypes_id serial PRIMARY KEY,
                                name citext
);
-- Apartments
CREATE TABLE apartments (
                            apartments_id serial PRIMARY KEY,
                            created_at timestamp DEFAULT NOW(),
                            owner_id int REFERENCES users (users_id) ON DELETE CASCADE,
                            longitude float8,
                            latitude float8,
                            surface int,
                            address_id int REFERENCES address (address_id),
                            capacity int,
                            available boolean,
                            apartmentsType_id int REFERENCES apartmentsTypes(apartmentsTypes_id) ON DELETE CASCADE,
                            roomNumber int,
                            price int
);

-- Apartment Features
CREATE TABLE apartmentFeatures (
                                   feature_id serial PRIMARY KEY,
                                   name citext
);

-- Link between apartments and their features
CREATE TABLE apartmentToFeatures (
                                     apartment_id int REFERENCES apartments(apartments_id) ON DELETE CASCADE,
                                     feature_id int REFERENCES apartmentFeatures (feature_id) ON DELETE CASCADE,
                                     PRIMARY KEY (apartment_id, feature_id)
);

-- Service Types
CREATE TABLE serviceTypes (
                              serviceTypes_id serial PRIMARY KEY,
                              name citext
);

-- Features required by service types
CREATE TABLE serviceTypeFeatures (
                                     serviceType_id int REFERENCES serviceTypes(serviceTypes_id) ON DELETE CASCADE,
                                     apartmentFeature int REFERENCES apartmentFeatures (feature_id) ON DELETE CASCADE
);

-- Reservations
CREATE TABLE reservations (
                              reservations_id serial PRIMARY KEY,
                              created_at timestamp DEFAULT NOW(),
                              location int REFERENCES apartments (apartments_id) ON DELETE CASCADE,
                              customer int REFERENCES users(users_id) ON DELETE CASCADE,
                              date_start date,
                              date_end date,
                              price int
);

-- Service Providers
CREATE TABLE services (
                          services_id serial PRIMARY KEY,
                          name text,
                          type int REFERENCES serviceTypes(serviceTypes_id) ON DELETE CASCADE,
                          providerAddress text,
                          providerLongitude float8,
                          providerLatitude float8,
                          maxOperatingRadius int,
                          provider int REFERENCES users(users_id) ON DELETE CASCADE,
                          price float
);

-- Apartment Images
CREATE TABLE apartmentsImage (
                                 image_id serial PRIMARY KEY,
                                 path citext,
                                 apartment_id int REFERENCES apartments(apartments_id) ON DELETE CASCADE
);

-- Service Images
CREATE TABLE servicesImage (
                               image_id serial PRIMARY KEY,
                               path citext,
                               service_id int REFERENCES services(services_id) ON DELETE CASCADE
);

-- Comments
CREATE TABLE commentary (
                            commentary_id serial PRIMARY KEY,
                            text text,
                            rating int,
                            customer int REFERENCES users(users_id) ON DELETE CASCADE,
                            service int REFERENCES services(services_id) ON DELETE CASCADE
);

-- Provider Availabilities
CREATE TABLE providerAvailabilities (
                                        providerAvailabilities_id serial PRIMARY KEY,
                                        available boolean NOT NULL,
                                        date date NOT NULL,
                                        provider_id int NOT NULL,
                                        FOREIGN KEY (provider_id) REFERENCES users(users_id) ON DELETE CASCADE
);

-- Apartment Availabilities
CREATE TABLE apartmentAvailabilities (
                                         apartmentAvailabilities_id serial PRIMARY KEY,
                                         available boolean NOT NULL,
                                         date date NOT NULL,
                                         owner_id int NOT NULL,
                                         apartment_id int NOT NULL,
                                         FOREIGN KEY (owner_id) REFERENCES users(users_id) ON DELETE CASCADE,
                                         FOREIGN KEY (apartment_id) REFERENCES apartments(apartments_id) ON DELETE CASCADE
);
