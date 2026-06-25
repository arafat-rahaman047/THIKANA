CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    type_id INT NOT NULL,
    zone_id INT NOT NULL,
    title VARCHAR(191) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    bedrooms INT NOT NULL DEFAULT 0,
    bathrooms INT NOT NULL DEFAULT 0,
    area_sqft INT NOT NULL DEFAULT 0,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    listing_type ENUM('rent', 'sale', 'sublet', 'office', 'bachelor') NOT NULL,
    status ENUM('active', 'inactive', 'pending', 'rejected', 'rented', 'sold') DEFAULT 'pending',
    is_furnished TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES property_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (zone_id) REFERENCES area_zones(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_type ON properties(type_id);
CREATE INDEX idx_properties_zone ON properties(zone_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);
