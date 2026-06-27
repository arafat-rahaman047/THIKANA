-- Seed Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'System Administrator with full access'),
(2, 'tenant', 'Tenant or buyer looking for properties'),
(3, 'owner', 'Property owner who rents or sells property'),
(4, 'agency', 'Real estate agency representing multiple properties')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- Seed Users (Passwords: Admin@123, Tenant@123, Owner@123, Agency@123)
INSERT INTO users (id, email, phone, password, role_id, is_active, is_verified) VALUES
(1, 'admin@thikana.com', '01711111111', '$2a$10$CU3NQZqNR03flwvsNhTqsuEzXRupprkfGMj1NdGGwWLx.QESLGrkq', 1, 1, 1),
(2, 'tenant@thikana.com', '01722222222', '$2a$10$tvSn0vjitq0VwFHHLz842ewpuho42UBjMFPTsnRwNh3vzs7TKdopS', 2, 1, 1),
(3, 'owner@thikana.com', '01733333333', '$2a$10$10zRXvZhOBlFNDezb82mO.bcIoBgXZNXY7hUWe8fuAGfIitZxnO2O', 3, 1, 1),
(4, 'agency@thikana.com', '01744444444', '$2a$10$ls.bKRxgYyYVh84dEB58OeboD38vfmXXFxbMb/sEGce1qQ7/HvmA.', 4, 1, 1)
ON DUPLICATE KEY UPDATE 
    phone=VALUES(phone), 
    password=VALUES(password), 
    role_id=VALUES(role_id), 
    is_active=VALUES(is_active), 
    is_verified=VALUES(is_verified);

-- Seed User Profiles
INSERT INTO user_profiles (id, user_id, full_name, avatar_url, nid_number, address, bio) VALUES
(1, 1, 'System Admin', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', '1234567890', 'Dhaka, Bangladesh', 'System Administrator of Thikana Platform'),
(2, 2, 'Rahim Tenant', 'https://api.dicebear.com/7.x/adventurer/svg?seed=rahim', '2345678901', 'Gulshan, Dhaka', 'Looking for a bachelor apartment in Dhaka'),
(3, 3, 'Karim Owner', 'https://api.dicebear.com/7.x/adventurer/svg?seed=karim', '3456789012', 'Banani, Dhaka', 'Property owner offering premium flats for rent'),
(4, 4, 'Thikana Agency', 'https://api.dicebear.com/7.x/identicon/svg?seed=agency', '4567890123', 'Dhanmondi, Dhaka', 'Professional Real Estate Agency in Bangladesh')
ON DUPLICATE KEY UPDATE 
    full_name=VALUES(full_name), 
    avatar_url=VALUES(avatar_url), 
    nid_number=VALUES(nid_number), 
    address=VALUES(address), 
    bio=VALUES(bio);

-- Seed Property Types
INSERT INTO property_types (id, name, description) VALUES
(1, 'Apartment', 'Self-contained residential unit'),
(2, 'House', 'Independent building or villa'),
(3, 'Sublet', 'Shared residential room/flat portion'),
(4, 'Office', 'Commercial office space'),
(5, 'Bachelor Mess', 'Shared hostel or bachelor accommodation')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- Seed Area Zones
INSERT INTO area_zones (id, name, city, description) VALUES
(1, 'Gulshan', 'Dhaka', 'Premium residential and commercial zone'),
(2, 'Banani', 'Dhaka', 'Diplomatic and upscale commercial zone'),
(3, 'Dhanmondi', 'Dhaka', 'Vibrant residential zone with educational institutes'),
(4, 'Uttara', 'Dhaka', 'Spacious residential suburb near the airport'),
(5, 'Mirpur', 'Dhaka', 'Highly populated residential hub'),
(6, 'Halishahar', 'Chittagong', 'Major residential neighborhood in Chittagong'),
(7, 'GEC Circle', 'Chittagong', 'Central commercial hub of Chittagong')
ON DUPLICATE KEY UPDATE name=VALUES(name), city=VALUES(city), description=VALUES(description);

-- Seed Amenities
INSERT INTO amenities (id, name, description) VALUES
(1, 'Lift', 'Passenger elevator access'),
(2, 'Generator', '24/7 backup power generator supply'),
(3, 'Security', '24/7 guard and safety monitoring'),
(4, 'WiFi', 'High-speed internet connection availability'),
(5, 'Parking', 'Dedicated garage or space for vehicles'),
(6, 'Gas', 'Pipeline natural gas connection'),
(7, 'CCTV', 'Surveillance cameras setup'),
(8, 'Balcony', 'Open-air veranda or balcony'),
(9, 'Gym', 'Fitness center or gymnasium access')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
