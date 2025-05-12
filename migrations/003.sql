-- Add the new column
ALTER TABLE fees ADD COLUMN fee_class_pricing_id INT NOT NULL;

-- Add the foreign key constraint
ALTER TABLE fees 
ADD CONSTRAINT fk_fee_class_pricing
FOREIGN KEY (fee_class_pricing_id) 
REFERENCES fee_class_pricing(pricing_id);

-- Remove the amount column (if it exists and you're replacing it with fee_class_pricing)
ALTER TABLE fees DROP COLUMN IF EXISTS amount;