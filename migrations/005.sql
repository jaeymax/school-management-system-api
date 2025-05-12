CREATE TABLE daily_fee_payments (
    payment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    feeding_id INT NOT NULL REFERENCES daily_feeding_fees(feeding_id),
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'check')),
    status VARCHAR(20) CHECK (status IN ('completed', 'pending', 'failed')),
    transaction_reference VARCHAR(100),
    received_by INT REFERENCES users(user_id),
    notes TEXT
);
