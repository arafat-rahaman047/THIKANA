CREATE TABLE IF NOT EXISTS rental_agreements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    tenant_id INT NOT NULL,
    owner_id INT NOT NULL,
    rent_amount DECIMAL(12, 2) NOT NULL,
    security_deposit DECIMAL(12, 2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    terms TEXT NOT NULL,
    status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_agreements_property ON rental_agreements(property_id);
CREATE INDEX idx_agreements_tenant ON rental_agreements(tenant_id);
CREATE INDEX idx_agreements_owner ON rental_agreements(owner_id);
CREATE INDEX idx_agreements_status ON rental_agreements(status);
