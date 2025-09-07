CREATE TABLE school_settings (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    date_format VARCHAR(20) NOT NULL,
    system_theme VARCHAR(5) NOT NULL CHECK (system_theme IN ('light', 'dark')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger to update the updated_at timestamp automatically
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = CURRENT_TIMESTAMP;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER update_school_settings_updated_at
-- BEFORE UPDATE ON school_settings
-- FOR EACH ROW
-- EXECUTE FUNCTION update_updated_at_column();