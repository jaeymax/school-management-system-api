
ALTER TABLE fees
DROP CONSTRAINT IF EXISTS fee_status_check,
DROP CONSTRAINT IF EXISTS fees_status_check,
ADD CONSTRAINT fees_status_check CHECK (status IN ('pending', 'paid', 'overdue', 'partial'));