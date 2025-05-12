-- First, remove the old status constraint
ALTER TABLE fee_payments 
DROP CONSTRAINT IF EXISTS fee_payments_status_check;

-- Add the payment_method column
ALTER TABLE fee_payments 
ADD COLUMN payment_method VARCHAR(20) 
CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'check'));

-- Update the status column with new values
ALTER TABLE fee_payments 
ALTER COLUMN status TYPE VARCHAR(20),
ADD CONSTRAINT fee_payments_status_check 
CHECK (status IN ('completed', 'pending', 'failed'));

-- Optional: If you want to rename the old status column to payment_method
-- (Alternative to adding a new column if you prefer to replace it)
-- ALTER TABLE fee_payments RENAME COLUMN status TO payment_method;
-- ALTER TABLE fee_payments 
-- ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'
-- CHECK (status IN ('completed', 'pending', 'failed'));

UPDATE fee_payments SET status = 'completed' WHERE status = 'cash';
UPDATE fee_payments SET payment_method = status WHERE status IN ('cash', 'bank_transfer', 'mobile_money', 'check');