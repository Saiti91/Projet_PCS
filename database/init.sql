CREATE TYPE role AS ENUM ('admin', 'staff', 'owner', 'customer','provider');
CREATE TYPE addressComplements AS ENUM ('bis', 'ter');
CREATE TYPE subscriptionType AS ENUM ('free', 'bagPacker', 'explorator');
CREATE TYPE commentaryType AS ENUM ('apartment', 'serviceProvider');

-- citext is a case-insensitive version of the standard text data type.
-- version insensible à la casses du type de données text standard.
CREATE EXTENSION citext;

-- Table pour les états de disponibilité
CREATE TABLE availability_status (
                                     id SERIAL PRIMARY KEY,
                                     status_name VARCHAR(50) UNIQUE NOT NULL
);

-- Addresses
CREATE TABLE address
(
    address_id        serial PRIMARY KEY,
    longitude         float8,
    latitude          float8,
    number            int,
    addressComplement addressComplements,
    building          citext,
    apartmentNumber   int,
    street            citext,
    CP                int,
    town              citext
);

-- Users
CREATE TABLE users
(
    users_id   serial PRIMARY KEY,
    created_at timestamp DEFAULT NOW(),
    role       role          NOT NULL,
    email      citext UNIQUE NOT NULL,
    password   citext        NOT NULL,
    first_name citext        NOT NULL,
    last_name  citext        NOT NULL,
    telephone  VARCHAR(15) CHECK (telephone ~ '^\+?\d{1,15}$'),
    address_id int           REFERENCES address (address_id) ON DELETE SET NULL
);

-- Abonnements
CREATE TABLE subscriptions
(
    subscription_id serial PRIMARY KEY,
    user_id         int REFERENCES users (users_id) ON DELETE CASCADE,
    type            subscriptionType NOT NULL,
    start_date      date             NOT NULL,
    end_date        date             NOT NULL,
    CHECK (start_date < end_date)
);

-- Bans
CREATE TABLE bans
(
    ban_id     serial PRIMARY KEY,
    user_id    int REFERENCES users (users_id) ON DELETE CASCADE,
    start_date date,
    end_date   date,
    reason     text
);

-- Type d'appartements
CREATE TABLE apartmentsTypes
(
    apartmentsTypes_id serial PRIMARY KEY,
    name               citext
);

-- Apartments
CREATE TABLE apartments
(
    apartments_id     serial PRIMARY KEY,
    created_at        timestamp DEFAULT NOW(),
    owner_id          int REFERENCES users (users_id) ON DELETE CASCADE,
    surface           int,
    address_id        int REFERENCES address (address_id),
    capacity          int,
    apartmentsType_id int REFERENCES apartmentsTypes (apartmentsTypes_id) ON DELETE CASCADE,
    numberOfRoom      int,
    price             float8,
    name              citext
);

-- Apartment Features
CREATE TABLE apartmentFeatures
(
    feature_id serial PRIMARY KEY,
    name       citext
);

-- Link between apartments and their features
CREATE TABLE apartmentToFeatures
(
    apartment_id int REFERENCES apartments (apartments_id) ON DELETE CASCADE,
    feature_id   int REFERENCES apartmentFeatures (feature_id) ON DELETE CASCADE,
    PRIMARY KEY (apartment_id, feature_id)
);

-- Service Types
CREATE TABLE serviceTypes
(
    serviceTypes_id serial PRIMARY KEY,
    name            citext
);

-- Features required by service types
CREATE TABLE serviceTypeToFeatures
(
    serviceType_id   int REFERENCES serviceTypes (serviceTypes_id) ON DELETE CASCADE,
    apartmentFeature int REFERENCES apartmentFeatures (feature_id) ON DELETE CASCADE
);

-- Reservations
CREATE TABLE reservations
(
    reservations_id serial PRIMARY KEY,
    created_at      timestamp DEFAULT NOW(),
    apartment_id    int REFERENCES apartments (apartments_id) ON DELETE CASCADE,
    customer        int REFERENCES users (users_id) ON DELETE CASCADE,
    date_start      date NOT NULL,
    date_end        date NOT NULL,
    price           int CHECK (price >= 0),
    CHECK (date_start < date_end)
);

-- Service Providers
CREATE TABLE servicesProviders
(
    servicesProviders_id serial PRIMARY KEY,
    name                 text,
    telephone            VARCHAR(15) CHECK (telephone ~ '^\+?\d{1,15}$'),
    address_id           int REFERENCES address (address_id) ON DELETE CASCADE,
    maxOperatingRadius   float8,
    employee_count       int
);

-- Service Provider to Service Types
CREATE TABLE serviceProviderToServiceTypes
(
    serviceProvider_id int REFERENCES servicesProviders (servicesProviders_id) ON DELETE CASCADE,
    serviceType_id     int REFERENCES serviceTypes (serviceTypes_id) ON DELETE CASCADE,
    price              float,
    PRIMARY KEY (serviceProvider_id, serviceType_id)
);

-- Apartment Images
CREATE TABLE apartmentsImage
(
    image_id     serial PRIMARY KEY,
    path         citext UNIQUE NOT NULL,
    apartment_id int REFERENCES apartments (apartments_id) ON DELETE CASCADE
);

-- Service Images
CREATE TABLE servicesImage
(
    image_id       serial PRIMARY KEY,
    path           citext,
    service_id     int REFERENCES servicesProviders (servicesProviders_id) ON DELETE CASCADE,
    serviceType_id int REFERENCES serviceTypes (serviceTypes_id) ON DELETE CASCADE

);

-- Comments
CREATE TABLE comments
(
    comments_id SERIAL PRIMARY KEY,
    type        commentaryType NOT NULL,
    entity_id   VARCHAR(255)   NOT NULL,
    comment     TEXT           NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images pour les commentaires
CREATE TABLE commentaryImages
(
    image_id    serial PRIMARY KEY,
    path        citext,
    comments_id int REFERENCES comments (comments_id) ON DELETE CASCADE
);

-- Provider Availabilities
CREATE TABLE providerAvailabilities
(
    providerAvailabilities_id serial PRIMARY KEY,
    status_id                 int REFERENCES availability_status(id) NOT NULL,
    date                      date    NOT NULL,
    provider_id               int REFERENCES servicesProviders (servicesProviders_id) ON DELETE CASCADE
);

-- Apartment Availabilities
CREATE TABLE apartmentAvailabilities
(
    apartmentAvailabilities_id serial PRIMARY KEY,
    status_id                  int REFERENCES availability_status(id) NOT NULL,
    date                       date    NOT NULL,
    apartment_id               int REFERENCES apartments (apartments_id) ON DELETE CASCADE
);

-- Factures
CREATE TABLE invoices
(
    invoice_id     serial PRIMARY KEY,
    user_id        int REFERENCES users (users_id) ON DELETE CASCADE,
    provider_id    int REFERENCES servicesProviders (servicesProviders_id) ON DELETE CASCADE,
    reservation_id int REFERENCES reservations (reservations_id) ON DELETE CASCADE,
    amount         numeric(10, 2),
    issued_date    date    DEFAULT CURRENT_DATE,
    paid           boolean DEFAULT false
);

-- stockage des tickets
CREATE TABLE tickets
(
    ticket_id          serial PRIMARY KEY,
    user_id            int REFERENCES users (users_id),
    serviceProvider_id int REFERENCES servicesProviders (servicesProviders_id),
    created_at         timestamp DEFAULT NOW(),
    subject            text NOT NULL,
    description        text NOT NULL,
    status             citext    DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress')),
    assigned_to        int REFERENCES users (users_id),
    priority           citext CHECK (priority IN ('low', 'medium', 'high')),
    category           citext
);

-- état des lieux
CREATE TABLE inventory
(
    inventory_id   SERIAL PRIMARY KEY,
    reservation_id INT         NOT NULL,
    type           VARCHAR(50) NOT NULL,
    description    TEXT,
    comments       TEXT,
    status         VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP            DEFAULT CURRENT_TIMESTAMP
);

-- photos des états des lieux
CREATE TABLE inventory_pictures
(
    id           SERIAL PRIMARY KEY,
    inventory_id INT  NOT NULL REFERENCES inventory (inventory_id),
    path         TEXT NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);