
-- Insérer les états initiaux dans availability_status
INSERT INTO availability_status (status_name) VALUES
                                                  ('available'),
                                                  ('unavailable'),
                                                  ('reserved'),
                                                  ('pending');

-- Insertions for the address table
INSERT INTO address (longitude, latitude, number, addressComplement, building, apartmentNumber, street, CP, town)
VALUES
    (2.3522, 48.8566, 10, 'bis', 'A', 101, 'Champs-Élysées', 75008, 'Paris'),
    (4.8357, 45.7640, 20, 'ter', 'B', 202, 'Rue de la République', 69002, 'Lyon'),
    (3.0586, 50.6292, 30, null, null, 303, 'Grand Place', 59800, 'Lille'),
    (5.3698, 43.2965, 40, 'bis', 'D', 404, 'Canebière', 13001, 'Marseille'),
    (1.4442, 43.6047, 50, null, null, 505, 'Capitole', 31000, 'Toulouse');

-- Insertions for the users table
INSERT INTO users (role, email, password, first_name, last_name, telephone, address_id)
VALUES
    ('admin', 'test@user.com', 'password', 'admin', 'admin', '+33612345678', 1),
    ('staff', 'staff@user.com', 'password', 'staff', 'staff', '+33612345678', 2),
    ('customer', 'customer@user.com', 'password', 'customer', 'customer', '+33612345678', 3),
    ('provider', 'provider@user.com', 'password', 'provider', 'provider', '+33612345678', 4),
    ('owner', 'owner@user.com', 'password', 'owner', 'owner', '+33612345678', 5);

-- Insertions for the apartmentsTypes table
INSERT INTO apartmentsTypes (name)
VALUES
    ('Studio'),
    ('House'),
    ('Flat'),
    ('Villa'),
    ('Chalet'),
    ('Apartment');

-- Insertions for the apartments table
INSERT INTO apartments (owner_id, surface, address_id, capacity, apartmentsType_id,name, numberOfRoom, price)
VALUES
    (5, 35, 1, 2, 1,'maison de campagne' ,1, 600),
    (5, 45, 2, 3, 2, 'maison en bord de mer',2, 800),
    (5, 60, 3, 4, 3,'appartement parisien' ,3, 1000),
    (5, 75, 4, 5, 4, 'maison écologique',4, 1200),
    (5, 90, 5, 6, 5,'chalet à la montagne' ,2, 1500);

-- Insertions for the apartmentFeatures table
INSERT INTO apartmentFeatures (name)
VALUES
    ('Balcony'),
    ('Pool'),
    ('WiFi'),
    ('Parking'),
    ('Air Conditioning');

-- Insertions for the apartmentToFeatures table
INSERT INTO apartmentToFeatures (apartment_id, feature_id)
VALUES
    (1, 1), (1, 3),
    (2, 2), (2, 4),
    (3, 1), (3, 5),
    (4, 3), (4, 4),
    (5, 2), (5, 5);

-- Insertions for the serviceTypes table
INSERT INTO serviceTypes (name)
VALUES
    ('Cleaning'),
    ('Maintenance'),
    ('Catering'),
    ('Security'),
    ('Transport');


-- Insertions for the servicesProviders table
INSERT INTO servicesProviders (name, telephone, address_id, maxOperatingRadius, employee_count)
VALUES
    ('CleanCo', '+33612345678', 1, 50, 10),
    ('FixIt', '+33623456789', 2, 75, 8),
    ('Foodies', '+33634567890', 3, 30, 15),
    ('SecureGuard', '+33645678901', 4, 100, 5),
    ('TransPro', '+33656789012', 5, 200, 20);

-- Insertions for the serviceProviderToServiceTypes table
INSERT INTO serviceProviderToServiceTypes (serviceProvider_id, serviceType_id, price)
VALUES
    (1, 1, 50.0),
    (2, 2, 60.0),
    (3, 3, 100.0),
    (4, 4, 70.0),
    (5, 5, 80.0);

-- Insertions for the reservations table
INSERT INTO reservations (apartment_id, customer, date_start, date_end, price)
VALUES
    (1, 3, '2024-07-01', '2024-07-10', 600),
    (2, 3, '2024-08-01', '2024-08-10', 800),
    (3, 3, '2024-09-01', '2024-09-10', 1000),
    (4, 3, '2024-10-01', '2024-10-10', 1200),
    (5, 3, '2024-11-01', '2024-11-10', 1500);

-- Insertions for the subscriptions table
INSERT INTO subscriptions (user_id, type, start_date, end_date)
VALUES
    (3, 'free', '2024-01-01', '2024-12-31'),
    (4, 'bagPacker', '2024-01-01', '2024-12-31'),
    (5, 'explorator', '2024-01-01', '2024-12-31');

-- Données de test pour reservation_services
INSERT INTO reservation_services (reservation_id, serviceType_id, serviceProvider_id)
VALUES
    (1, 1, 1), -- Cleaning by CleanCo
    (1, 2, 2), -- Maintenance by FixIt
    (2, 1, 1), -- Cleaning by CleanCo
    (2, 3, 3), -- Catering by Foodies
    (3, 4, 4), -- Security by SecureGuard
    (4, 2, 2), -- Maintenance by FixIt
    (4, 5, 5), -- Transport by TransPro
    (5, 3, 3), -- Catering by Foodies
    (5, 4, 4); -- Security by SecureGuard